import { promises as fs } from "fs";
import path from "path";
import config from "../config.json" with { type: "json" };

/**
 * @param {String} serverWorldName - 서버 내 월드 파일
 * @param {String} savedWorldName - 월드 보관 폴더 내 월드 파일
 */
async function changeWorld(serverWorldName, savedWorldName) {
	const serverWorlds = (await fs.readdir(config.minecraftDir)).filter((world) =>
		world.startsWith(config.worldLevelName)
	);

	const serverOpsJson = (await fs.readdir(config.minecraftDir)).filter((file) =>
		file.startsWith("ops.json")
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

export default changeWorld;
