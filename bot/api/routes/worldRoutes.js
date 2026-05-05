import { Router } from "express";
import { promises as fs } from "fs";
import path from "path";
import config from "../../config/config.json" with { type: "json" };
import { loadLastWorld } from "../../functions/lastWorld.js";
import { updateLastWorld } from "../../functions/lastWorld.js";
import worldSetting from "../../functions/worldSetting.js";
import cleanUpSchedule from "../../functions/cleanUpSchedule.js";
import changeWorld from "../../functions/changeWorlds.js";
import ServerSetting from "../../functions/ServerSetting.js";
import giveOp from "../../functions/giveOp.js";

const router = Router();

/**
 * GET /api/worlds
 * 월드 목록 조회
 */
router.get("/", async (req, res) => {
	try {
		const worldList = await fs.readdir(config.worldDir);

		const worlds = worldList.map((world) => ({
			name: world,
		}));

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
 * GET /api/worlds/trash
 * 휴지통에 있는 월드 목록 조회
 */
router.get("/trash", async (req, res) => {
	const worldList = await fs.readdir(config.TrashWorldDir);
	const now = Date.now();

	/**
	 * 월드 정보 배열 생성
	 * - name: 월드 이름
	 * - daysLeft: 삭제까지 남은 일 수
	 */
	const worldInfo = await Promise.all(
		worldList.map(async (world) => {
			const stat = await fs.stat(path.join(config.TrashWorldDir, world));
			const diff = now - stat.ctime.getTime();
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));

			return {
				name: world,
				daysLeft: config.WorldAgeDay - days,
			};
		})
	);

	res.json(worldInfo);
});

/**
 * 요청 바디 예시
 * @typedef {Object} CreateWorldRequest
 * @property {string} name - 생성할 월드 이름
 * @property {string} difficulty - 월드 난이도 (peaceful, easy, normal, hard)
 * @property {string} gameMode - 게임 모드 (survival, creative, adventure)
 * @property {string} levelType - 지형 유형 (default, flat, large_biomes, amplified)
 * @property {boolean} op - OP 권한 여부
 */

/**
 * POST /api/worlds
 * 새 월드 생성
 */
router.post("/", async (req, res) => {
	try {
		/**
		 * @type {CreateWorldRequest}
		 */
		const { name, difficulty, gameMode, levelType, op } = req.body;

		if (
			name == null ||
			difficulty == null ||
			gameMode == null ||
			levelType == null ||
			typeof op !== "boolean"
		) {
			return res.status(400).json({ error: "All fields are required" });
		}

		const worldList = await fs.readdir(config.worldDir);

		if (worldList.includes(name)) {
			// 월드가 이미 존재하는지 확인
			return res.status(400).json({ error: "World already exists" });
		}

		try {
			// 월드 디렉토리 생성
			await fs.mkdir(path.join(config.worldDir, name));
		} catch (error) {
			console.error("Error creating world directory:", error);
			return res.status(500).json({ error: "Failed to create world directory" });
		}

		const worldSettings = {
			difficulty,
			gameMode,
			"level-type": levelType,
			op,
		};

		await worldSetting.updateWorldSettings(name, worldSettings);

		res.json({ message: "World created", name });
	} catch (error) {
		console.error("Error creating world:", error);
		res.status(500).json({ error: "Failed to create world" });
	}
});

/**
 * GET /api/worlds/property
 * 현재 월드의 설정 정보 조회
 * - difficulty: 월드 난이도 (peaceful, easy, normal, hard)
 * - gameMode: 게임 모드 (survival, creative, adventure)
 * - levelType: 지형 유형 (default, flat, large_biomes, amplified)
 * - op: OP 권한 여부
 */
router.get("/property", async (req, res) => {
	try {
		const lastWorld = await loadLastWorld();

		if (!lastWorld) {
			return res.status(404).json({ error: "No world currently selected" });
		}

		/**
		 * @type {Object} WorldSettings
		 * @property {string} difficulty - 월드 난이도
		 * @property {string} gameMode - 게임 모드
		 * @property {string} levelType - 지형 유형
		 * @property {boolean} op - OP 권한 여부
		 */
		const settings = await worldSetting.readWorldSettings(lastWorld);

		res.json({
			world: lastWorld,
			settings,
		});
	} catch (error) {
		console.error("Error getting world properties:", error);
		res.status(500).json({ error: "Failed to get world properties" });
	}
});

/**
 * DELETE /api/worlds/:name
 * 월드 삭제
 */
router.delete("/:name", async (req, res) => {
	try {
		const { name } = req.params;
		const worldPath = path.join(config.worldDir, name);

		// 월드가 존재하는지 확인
		try {
			await fs.access(worldPath);
		} catch {
			return res.status(404).json({ error: "World not found" });
		}

		if (name === (await loadLastWorld())) {
			return res.status(400).json({ error: "Cannot delete the currently selected world" });
		}

		const sourcePath = path.join(config.worldDir, name);
		const destPath = path.join(config.TrashWorldDir, name);

		try {
			await fs.rename(sourcePath, destPath);
		} catch (error) {
			console.error("Error moving world to trash:", error);
			return res.status(500).json({ error: "Failed to delete world" });
		}

		cleanUpSchedule();

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
		const worldPath = path.join(config.worldDir, name);

		// 월드가 존재하는지 확인
		try {
			await fs.access(worldPath);
		} catch {
			return res.status(404).json({ error: "World not found" });
		}

		const lastWorld = await loadLastWorld();

		await changeWorld(lastWorld, name);

		const worldSettings = await worldSetting.readWorldSettings(name);
		const worldSet = worldSettings ?? {};

		if (worldSet) {
			await ServerSetting.updateServerProperties({
				difficulty: worldSet.difficulty,
				gamemode: worldSet.gameMode,
				"level-type": worldSet["level-type"],
			});
		}

		if (worldSet.op === true) {
			await giveOp();
		}

		await updateLastWorld(name);

		// 실제 월드 변경 로직은 Discord Bot 명령어 로직 재사용
		res.json({ message: "World selected", name });
	} catch (error) {
		console.error("Error selecting world:", error);
		res.status(500).json({ error: "Failed to select world" });
	}
});

/**
 * POST /api/worlds/:name/restore
 * 월드 복구
 */
router.post("/:name/restore", async (req, res) => {
	const { name } = req.params;

	const trashList = await fs.readdir(config.TrashWorldDir);

	try {
		const sourcePath = path.join(config.TrashWorldDir, name);
		const destPath = path.join(config.worldDir, name);

		// 월드가 휴지통에 존재하는지 확인
		try {
			await fs.access(sourcePath);
		} catch {
			return res.status(404).json({ error: "World not found in trash" });
		}

		try {
			await fs.rename(sourcePath, destPath);
		} catch (error) {
			console.error("Error restoring world:", error);
			return res.status(500).json({ error: "Failed to restore world" });
		}

		if (trashList.length === 1) {
			cleanUpSchedule().cancel();
		}

		res.json({ message: "World restored", name });
	} catch (error) {
		console.error("Error restoring world:", error);
		res.status(500).json({ error: "Failed to restore world" });
	}
})

export default router;
