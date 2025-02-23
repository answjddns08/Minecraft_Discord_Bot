import { promises as fs } from "fs";
import path from "path";
import config from "../config.json" assert { type: "json" };

/**
 * @param {String} oldPath -옮겨질 월드 디렉토리
 * @param {String} newPath - 옮길 월드 파일들
 */
async function moveWorlds(oldPath, newPath) {
	const worlds = (await fs.readdir(oldPath)).filter((world) =>
		world.startsWith(config.worldLevelName)
	);

	const opsJson = (await fs.readdir(oldPath)).filter((world) =>
		world.startsWith("ops.json")
	);

	if (worlds.length === 0) return;

	worlds.map(async (world) => {
		await fs.rename(path.join(oldPath, world), path.join(newPath, world));
	});

	if (opsJson.length === 0) return;

	await fs.rename(
		path.join(oldPath, opsJson[0]),
		path.join(newPath, opsJson[0])
	);
}

export default moveWorlds;
