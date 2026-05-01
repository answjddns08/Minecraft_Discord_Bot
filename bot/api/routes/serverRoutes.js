import { Router } from "express";
import { isServerRunning } from "../../functions/dockerControl.js";
import serverCheck from "../../functions/serverCheck.js";
import { Rcon } from "rcon-client";
import config from "../../config/config.json" with { type: "json" };

const router = Router();

/**
 * GET /api/server/status
 * 서버 상태 조회
 */
router.get("/status", async (req, res) => {
	try {
		const isRunning = await isServerRunning();
		const status = await serverCheck();

		res.json({
			running: isRunning,
			status: status ? "online" : "offline",
		});
	} catch (error) {
		console.error("Error getting server status:", error);
		res.status(500).json({ error: "Failed to get server status" });
	}
});

/**
 * GET /api/server/players
 * 현재 접속 중인 플레이어 목록
 */
router.get("/players", async (req, res) => {
	try {
		const isRunning = await isServerRunning();

		if (!isRunning) {
			return res.json({ players: [], count: 0 });
		}

		const rcon = await Rcon.connect({
			host: config.rconHost,
			port: config.rconPort,
			password: config.rconPassword,
		});

		const response = await rcon.send("list");
		await rcon.end();

		// "There are 2 of a max of 20 players online: player1, player2"
		const match = response.match(/There are (\d+).*?: (.+)/);

		if (match) {
			const count = parseInt(match[1]);
			const playerList = match[2] ? match[2].split(", ") : [];

			res.json({
				count,
				max: 20,
				players: playerList,
			});
		} else {
			res.json({ count: 0, max: 20, players: [] });
		}
	} catch (error) {
		console.error("Error getting players:", error);
		res.json({ count: 0, max: 20, players: [] });
	}
});

/**
 * POST /api/server/start
 * 서버 시작
 */
router.post("/start", async (req, res) => {
	try {
		const isRunning = await isServerRunning();

		if (isRunning) {
			return res.status(400).json({ error: "Server is already running" });
		}

		// 실제 서버 시작 로직은 Discord Bot 명령어 로직 재사용
		// 지금은 간단히 응답만
		res.json({ message: "Server start initiated" });
	} catch (error) {
		console.error("Error starting server:", error);
		res.status(500).json({ error: "Failed to start server" });
	}
});

/**
 * POST /api/server/stop
 * 서버 중지
 */
router.post("/stop", async (req, res) => {
	try {
		const isRunning = await isServerRunning();

		if (!isRunning) {
			return res.status(400).json({ error: "Server is not running" });
		}

		// 실제 서버 중지 로직은 Discord Bot 명령어 로직 재사용
		res.json({ message: "Server stop initiated" });
	} catch (error) {
		console.error("Error stopping server:", error);
		res.status(500).json({ error: "Failed to stop server" });
	}
});

export default router;
