import Docker from "dockerode";
import { PassThrough } from "stream";
import { Rcon } from "rcon-client";
import config from "../config/config.json" with { type: "json" };

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const containerName = process.env.CONTAINER_NAME || "minecraft-server";
const clients = new Set();

let dockerLogStreamStarted = false;
let logBuffer = "";

/**
 * broadcast a message to all connected clients
 * @param {string|object} payload 
 */
function broadcast(payload) {
    const message = typeof payload === "string" ? payload : JSON.stringify(payload);

    for (const client of clients) {
        if (client.readyState === 1) {
            client.send(message);
        }
    }
}

/**
 * send a message to a specific client
 * @param {import("ws").WebSocket} ws 
 * @param {string|object} payload 
 */
function safeSend(ws, payload) {
    if (ws.readyState === 1) {
        ws.send(typeof payload === "string" ? payload : JSON.stringify(payload));
    }
}

/**
 * emits a log line to all connected clients
 * @param {string} source 
 * @param {string} line 
 * @returns 
 */
function emitLogLine(source, line) {
    const trimmed = line.replace(/\r$/, "");
    if (!trimmed) {
        return;
    }

    broadcast({
        type: "log",
        source,
        message: trimmed,
        timestamp: new Date().toISOString(),
    });
}

/**
 * appends text to the log buffer and emits log lines
 * @param {string} source 
 * @param {string} text 
 */
function appendLogText(source, text) {
    logBuffer += text;

    const lines = logBuffer.split(/\r?\n/);
    logBuffer = lines.pop() ?? "";

    for (const line of lines) {
        emitLogLine(source, line);
    }
}

async function startDockerLogStream() {
    if (dockerLogStreamStarted) {
        return;
    }

    dockerLogStreamStarted = true;

    try {
        const container = docker.getContainer(containerName);
        const stream = await new Promise((resolve, reject) => {
            container.logs(
                {
                    follow: true,
                    stdout: true,
                    stderr: true,
                    tail: 0,
                    timestamps: false,
                },
                (error, output) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(output);
                },
            );
        });

        const stdout = new PassThrough();
        const stderr = new PassThrough();
        docker.modem.demuxStream(stream, stdout, stderr);

        stdout.on("data", (chunk) => appendLogText("stdout", chunk.toString("utf8")));
        stderr.on("data", (chunk) => appendLogText("stderr", chunk.toString("utf8")));

        stream.on("error", (error) => {
            console.error("[WebSocket] Docker log stream error:", error);
            broadcast({
                type: "log-error",
                message: "Docker log stream ended",
                error: error?.message ?? String(error),
            });
            dockerLogStreamStarted = false;
        });

        broadcast({
            type: "log-status",
            message: `Connected to ${containerName} log stream`,
        });
    } catch (error) {
        console.error("[WebSocket] Failed to start Docker log stream:", error);
        dockerLogStreamStarted = false;
        broadcast({
            type: "log-error",
            message: "Failed to start Docker log stream",
            error: error?.message ?? String(error),
        });
    }
}

/**
 * sends an RCON command and returns the response
 * @param {string} command 
 * @returns 
 */
async function sendRconCommand(command) {
    const rcon = await Rcon.connect({
        host: config.RCsettings.host,
        port: config.RCsettings.port,
        password: config.RCsettings.password,
    });

    try {
        return await rcon.send(command);
    } finally {
        await rcon.end();
    }
}

/**
 * fetches the server help text via RCON, parses command names, and sends to a ws or broadcasts
 * @param {import("ws").WebSocket} [ws]
 */
async function fetchAndSendCommands(ws) {
    try {
        const output = await sendRconCommand("help");
        const text = String(output || "");
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

        const commands = new Set();

        for (const line of lines) {
            // take the first token and strip leading slash if present
            const first = line.split(/\s+/)[0];
            if (!first) continue;
            const cmd = first.replace(/^\//, "");
            // ignore non-command lines like 'Available commands:'
            if (/^[a-z0-9_:\-]+$/i.test(cmd)) {
                commands.add(cmd);
            }
        }

        const list = Array.from(commands).sort();

        const payload = {
            type: "commands-list",
            commands: list,
            timestamp: new Date().toISOString(),
        };

        if (ws) {
            safeSend(ws, payload);
        } else {
            broadcast(payload);
        }
    } catch (error) {
        const msg = error?.message ?? String(error);
        if (ws) {
            safeSend(ws, {
                type: "commands-error",
                error: msg,
            });
        } else {
            broadcast({ type: "commands-error", error: msg });
        }
    }
}

/**
 * websocket handler
 * @param {import("ws").WebSocket} ws
 */
function websocketFn(ws) {
    clients.add(ws);

    safeSend(ws, {
        type: "hello",
        message: "WebSocket connected",
    });

    void startDockerLogStream();
    void fetchAndSendCommands(ws);

    ws.on("message", async (message) => {
        const raw = Buffer.isBuffer(message) ? message.toString("utf8") : String(message);
        const trimmed = raw.trim();

        if (!trimmed) {
            return;
        }

        let command = trimmed;

        try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed.command === "string") {
                command = parsed.command;
            }
        } catch {
            // plain text command is allowed
        }

        try {
            const response = await sendRconCommand(command);
            safeSend(ws, {
                type: "rcon-response",
                command,
                response,
            });
        } catch (error) {
            safeSend(ws, {
                type: "rcon-error",
                command,
                error: error?.message ?? String(error),
            });
        }
    });

    ws.on("close", () => {
        clients.delete(ws);
    });

    ws.on("error", (error) => {
        console.error("[WebSocket] Client error:", error);
        clients.delete(ws);
    });
}

export { broadcast, websocketFn };