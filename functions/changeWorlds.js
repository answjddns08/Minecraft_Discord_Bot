import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import config from "../config.json" with { type: "json" };

/**
 * @param {String} serverWorldName - 현재 월드 이름
 * @param {String} savedWorldName - 변경할 월드 이름
 */
async function changeWorld(serverWorldName, savedWorldName) {
	const isDocker = process.env.DOCKER_ENV === "true";

	if (isDocker) {
		// Docker 환경: docker-compose.yml의 LEVEL 환경변수 변경
		console.log(
			`[changeWorld] 월드 변경: ${serverWorldName} -> ${savedWorldName}`
		);

		// 월드 디렉토리 복사/이동
		const serverWorlds = (await fs.readdir(config.minecraftDir)).filter(
			(world) => world.startsWith(config.worldLevelName)
		);

		const serverOpsJson = (await fs.readdir(config.minecraftDir)).filter(
			(file) => file.startsWith("ops.json")
		);

		// 현재 월드를 백업
		if (serverWorlds.length !== 0) {
			for (const world of serverWorlds) {
				await fs.rename(
					path.join(config.minecraftDir, world),
					path.join(config.worldDir, serverWorldName, world)
				);
			}
		}

		if (serverOpsJson.length !== 0) {
			await fs.rename(
				path.join(config.minecraftDir, serverOpsJson[0]),
				path.join(config.worldDir, serverWorldName, serverOpsJson[0])
			);
		}

		// 새로운 월드 로드
		const savedWorlds = (
			await fs.readdir(path.join(config.worldDir, savedWorldName))
		).filter((world) => world.startsWith(config.worldLevelName));

		const savedOpsJson = (
			await fs.readdir(path.join(config.worldDir, savedWorldName))
		).filter((file) => file.startsWith("ops.json"));

		if (savedWorlds.length !== 0) {
			for (const world of savedWorlds) {
				await fs.rename(
					path.join(config.worldDir, savedWorldName, world),
					path.join(config.minecraftDir, world)
				);
			}
		}

		if (savedOpsJson.length !== 0) {
			await fs.rename(
				path.join(config.worldDir, savedWorldName, savedOpsJson[0]),
				path.join(config.minecraftDir, savedOpsJson[0])
			);
		}

		console.log(`[changeWorld] 월드 파일 이동 완료`);
	} else {
		// 로컬 환경: 기존 방식 그대로
		const serverWorlds = (await fs.readdir(config.minecraftDir)).filter(
			(world) => world.startsWith(config.worldLevelName)
		);

		const serverOpsJson = (await fs.readdir(config.minecraftDir)).filter(
			(file) => file.startsWith("ops.json")
		);

		if (serverWorlds.length !== 0) {
			serverWorlds.map(async (world) => {
				await fs.rename(
					path.join(config.minecraftDir, world),
					path.join(config.worldDir, serverWorldName, world)
				);
			});
		}

		if (serverOpsJson.length !== 0) {
			await fs.rename(
				path.join(config.minecraftDir, serverOpsJson[0]),
				path.join(config.worldDir, serverWorldName, serverOpsJson[0])
			);
		}

		const savedWorlds = (
			await fs.readdir(path.join(config.worldDir, savedWorldName))
		).filter((world) => world.startsWith(config.worldLevelName));

		const savedOpsJson = (
			await fs.readdir(path.join(config.worldDir, savedWorldName))
		).filter((file) => file.startsWith("ops.json"));

		if (savedWorlds.length !== 0) {
			savedWorlds.map(async (world) => {
				await fs.rename(
					path.join(config.worldDir, savedWorldName, world),
					path.join(config.minecraftDir, world)
				);
			});
		}

		if (savedOpsJson.length !== 0) {
			await fs.rename(
				path.join(config.worldDir, savedWorldName, savedOpsJson[0]),
				path.join(config.minecraftDir, savedOpsJson[0])
			);
		}
	}
}

export default changeWorld;
