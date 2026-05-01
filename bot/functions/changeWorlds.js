import { promises as fs } from "fs";
import path from "path";
import config from "../config/config.json" with { type: "json" };

/**
 * @param {String} serverWorldName - 현재 월드 이름
 * @param {String} savedWorldName - 변경할 월드 이름
 */
async function changeWorld(serverWorldName, savedWorldName) {
	console.log(
		`[changeWorld] 월드 변경: ${serverWorldName} -> ${savedWorldName}`,
	);

	// 월드 디렉토리 복사/이동
	const serverWorlds = (await fs.readdir(config.minecraftDir)).filter(
		(world) => world.startsWith(config.worldLevelName),
	);

	const serverOpsJson = (await fs.readdir(config.minecraftDir)).filter(
		(file) => file.startsWith("ops.json"),
	);

	// 현재 월드를 백업
	if (serverWorlds.length !== 0) {
		// 백업 경로가 존재하는지 확인
		const backupPath = path.join(config.worldDir, serverWorldName);
		try {
			await fs.access(backupPath);
		} catch {
			// 디렉토리가 없으면 생성
			await fs.mkdir(backupPath, { recursive: true });
		}

		for (const world of serverWorlds) {
			const srcPath = path.join(config.minecraftDir, world);
			const destPath = path.join(config.worldDir, serverWorldName, world);
			console.log(`[changeWorld] Backing up: ${srcPath} -> ${destPath}`);
			await fs.rename(srcPath, destPath);
		}
	}

	if (serverOpsJson.length !== 0) {
		const srcPath = path.join(config.minecraftDir, serverOpsJson[0]);
		const destPath = path.join(config.worldDir, serverWorldName, serverOpsJson[0]);
		console.log(`[changeWorld] Backing up: ${srcPath} -> ${destPath}`);
		await fs.rename(srcPath, destPath);
	}

	// 새로운 월드 로드
	const savedWorldPath = path.join(config.worldDir, savedWorldName);
	const savedWorlds = (await fs.readdir(savedWorldPath)).filter((world) =>
		world.startsWith(config.worldLevelName),
	);

	const savedOpsJson = (await fs.readdir(savedWorldPath)).filter((file) =>
		file.startsWith("ops.json"),
	);

	if (savedWorlds.length !== 0) {
		for (const world of savedWorlds) {
			await fs.rename(
				path.join(config.worldDir, savedWorldName, world),
				path.join(config.minecraftDir, world),
			);
		}
	}

	if (savedOpsJson.length !== 0) {
		await fs.rename(
			path.join(config.worldDir, savedWorldName, savedOpsJson[0]),
			path.join(config.minecraftDir, savedOpsJson[0]),
		);
	}

	console.log(`[changeWorld] 월드 파일 이동 완료`);
}

export default changeWorld;
