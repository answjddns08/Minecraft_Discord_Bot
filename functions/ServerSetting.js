import { promises as fs } from "fs";
import path from "path";
import config from "../config.json" assert { type: "json" };

/*
오브젝트 형태로 월드 설정(난이도, 지형 설정)을 받고 그걸 server.properties에 적용하는 함수
*/

/**
 * server.properties 파일을 읽어오는 함수
 * @returns {Promise<Object>} server.properties 파일의 설정 데이터
 * @throws {Error} Error
 */
async function readServerProperties() {
	try {
		const data = await fs.readFile(
			path.join(config.minecraftDir, "server.properties"),
			"utf8"
		);
		const properties = {};
		data.split("\n").forEach((line) => {
			const [key, value] = line.split("=");
			if (key && value) {
				properties[key.trim()] = value.trim();
			}
		});
		return properties;
	} catch (err) {
		throw err;
	}
}

/**
 * server.properties 파일을 업데이트하는 함수
 * @param {Object} newSettings 업데이트할 설정
 * @returns {Promise<void>}
 * @throws {Error} Error
 */
async function updateServerProperties(newSettings) {
	try {
		const currentSettings = await readServerProperties();
		const updatedSettings = { ...currentSettings, ...newSettings };
		const propertiesString = Object.entries(updatedSettings)
			.map(([key, value]) => `${key}=${value}`)
			.join("\n");
		await fs.writeFile(serverPropertiesPath, propertiesString, "utf8");
	} catch (err) {
		throw err;
	}
}

export default {
	readServerProperties,
	updateServerProperties,
};
