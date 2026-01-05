import { promises as fs } from "fs";
import path from "path";
import config from "../config.json" with { type: "json" };

/*
    마크 서버 파일에서 userCache에 있는 유저에게 오퍼레이터 권한을 부여합니다.
*/

const userCachePath = path.join(config.minecraftDir, "usercache.json");
const opsPath = path.join(config.minecraftDir, "ops.json");

/**
 * usercache.json 파일을 읽고, 해당 유저들에게 오퍼레이터 권한을 부여하는 함수
 * @returns {Promise<void>}
 * @throws {Error} Error
 */
async function giveOp() {
	try {
		// usercache.json 파일 읽기
		const userCacheData = await fs.readFile(userCachePath, "utf8");
		const userCache = JSON.parse(userCacheData);

		// ops.json 파일 읽기
		let opsData = [];
		try {
			const opsFileData = await fs.readFile(opsPath, "utf8");
			opsData = JSON.parse(opsFileData);
		} catch (err) {
			if (err.code !== "ENOENT") throw err; // 파일이 없을 경우 무시
		}

		// usercache에 있는 유저들에게 오퍼레이터 권한 부여
		userCache.forEach((user) => {
			if (!opsData.some((op) => op.uuid === user.uuid)) {
				opsData.push({
					uuid: user.uuid,
					name: user.name,
					level: 4, // 오퍼레이터 권한 레벨
					bypassesPlayerLimit: false,
				});
			}
		});

		// ops.json 파일에 쓰기
		await fs.writeFile(opsPath, JSON.stringify(opsData, null, 2), "utf8");

		return;
	} catch (err) {
		throw err;
	}
}

export default giveOp;
