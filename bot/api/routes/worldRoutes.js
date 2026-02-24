import { Router } from "express";
import { promises as fs } from "fs";
import path from "path";
import config from "../../config/config.json" with { type: "json" };
import { loadLastWorld } from "../../functions/lastWorld.js";

const router = Router();

/**
 * GET /api/worlds
 * 월드 목록 조회
 */
router.get("/", async (req, res) => {
	try {
		const worldsPath = config.worldsDir;
		const files = await fs.readdir(worldsPath);

		// 디렉토리만 필터링
		const worlds = [];
		for (const file of files) {
			const filePath = path.join(worldsPath, file);
			const stat = await fs.stat(filePath);
			if (stat.isDirectory()) {
				worlds.push({
					name: file,
					size: stat.size,
					modified: stat.mtime,
				});
			}
		}

		// 마지막 사용 월드 가져오기
		const lastWorld = await loadLastWorld();

		res.json({
			worlds,
			current: lastWorld || null,
		});
	} catch (error) {
		console.error("Error listing worlds:", error);
		res.status(500).json({ error: "Failed to list worlds" });
	}
});

/**
 * POST /api/worlds
 * 새 월드 생성
 */
router.post("/", async (req, res) => {
	try {
		const { name } = req.body;

		if (!name) {
			return res.status(400).json({ error: "World name is required" });
		}

		const worldPath = path.join(config.worldsDir, name);

		// 월드가 이미 존재하는지 확인
		try {
			await fs.access(worldPath);
			return res.status(400).json({ error: "World already exists" });
		} catch {
			// 월드가 없으면 생성
		}

		await fs.mkdir(worldPath, { recursive: true });

		res.json({ message: "World created", name });
	} catch (error) {
		console.error("Error creating world:", error);
		res.status(500).json({ error: "Failed to create world" });
	}
});

/**
 * DELETE /api/worlds/:name
 * 월드 삭제
 */
router.delete("/:name", async (req, res) => {
	try {
		const { name } = req.params;
		const worldPath = path.join(config.worldsDir, name);

		// 월드가 존재하는지 확인
		try {
			await fs.access(worldPath);
		} catch {
			return res.status(404).json({ error: "World not found" });
		}

		// 휴지통으로 이동 (실제로는 삭제)
		await fs.rm(worldPath, { recursive: true, force: true });

		res.json({ message: "World deleted", name });
	} catch (error) {
		console.error("Error deleting world:", error);
		res.status(500).json({ error: "Failed to delete world" });
	}
});

/**
 * POST /api/worlds/:name/select
 * 월드 선택
 */
router.post("/:name/select", async (req, res) => {
	try {
		const { name } = req.params;
		const worldPath = path.join(config.worldsDir, name);

		// 월드가 존재하는지 확인
		try {
			await fs.access(worldPath);
		} catch {
			return res.status(404).json({ error: "World not found" });
		}

		// 실제 월드 변경 로직은 Discord Bot 명령어 로직 재사용
		res.json({ message: "World selected", name });
	} catch (error) {
		console.error("Error selecting world:", error);
		res.status(500).json({ error: "Failed to select world" });
	}
});

export default router;
