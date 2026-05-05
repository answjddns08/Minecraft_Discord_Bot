import { Router } from "express";
import { isServerRunning } from "../../functions/dockerControl.js";
import { startMinecraftServer } from "../../functions/dockerControl.js";
import config from "../../config/config.json" with { type: "json" };
import { rconList, rconStop } from "../../functions/rconlist.js";
import { waitForServerStop } from "../../commands/MCserver/stop.js";
import { stopMinecraftServer } from "../../functions/dockerControl.js";
import { loadLastWorld } from "../../functions/lastWorld.js";

const router = Router();

/**
 * GET /api/server/status
 * 서버 상태 조회
 * - isRunning: 서버가 켜져 있는지 여부
 * - newWorld: 새로 시작한 월드 이름 (마지막으로 시작한 월드)
 */
router.get("/status", async (req, res) => {
	try {
		const isRunning = await isServerRunning();
		const newWorld = config.lastWorld;

		res.json({
			isRunning,
			newWorld,
		});
	} catch (error) {
		console.error("Error getting server status:", error);
		res.status(500).json({ error: "Failed to get server status" });
	}
});

/**
 * GET /api/server/players
 * 현재 접속 중인 플레이어 목록
 * - count: 접속 중인 플레이어 수
 * - max: 최대 플레이어 수
 * - players: 접속 중인 플레이어 이름 배열
 */
router.get("/players", async (req, res) => {
	try {
		const isRunning = await isServerRunning();

		if (!isRunning) {
			return res.json({ players: [], count: 0 });
		}

		const { count, max, players } = await rconList();

		res.json({
			count,
			max,
			players,
		});
	} catch (error) {
		console.error("Error getting players:", error);
		res.json({ count: 0, max: 10, players: [] });
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

		const worldName = await loadLastWorld();

		if (!worldName) {
			return res.status(400).json({ error: "No world selected" });
		}

		const mcVersion = config.currentVersion || process.env.MC_VERSION || "LATEST";

		await startMinecraftServer(worldName, mcVersion);

		res.json({ message: "Server start initiated", worldName, mcVersion });
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

		await rconStop();

		const stoppedGracefully = await waitForServerStop();

		if (!stoppedGracefully) {
			console.warn("Server did not stop gracefully, attempting force stop...");
			await stopMinecraftServer();
		}

		// 실제 서버 중지 로직은 Discord Bot 명령어 로직 재사용
		res.json({ message: "Server stop initiated" });
	} catch (error) {
		console.error("Error stopping server:", error);
		res.status(500).json({ error: "Failed to stop server" });
	}
});

export default router;
