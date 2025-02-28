import { promises as fs } from "fs";
import path from "path";
import config from "../config.json" assert { type: "json" };
import worldSetting from "./worldSetting.js";

async function cleanUpTrashWorld() {
	const now = Date.now();
	const worlds = await fs.readdir(config.TrashWorldDir);

	for (const world of worlds) {
		const worldPath = path.join(config.TrashWorldDir, world);
		const stat = await fs.stat(worldPath);
		const diff = now - stat.ctime.getTime(); // ctime은 파일 수정 시간(디렉토리 이동 포함)을 알 수 있음
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days >= config.WorldAgeDay) {
			await fs.rm(worldPath, { recursive: true });
			await worldSetting.removeWorld(world);
			console.log(`Removed the ${world} world from the trash!`);
		}
	}
	return;
}

export default cleanUpTrashWorld;
