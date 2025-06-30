import { promises as fs } from "fs";
import path from "path";
import config from "../config.json" with { type: "json" };

/**
 * server.properties 파일을 읽어오는 함수
 * @returns {Promise<Object>} server.properties 파일의 설정 데이터
 * @throws {Error} 파일 읽기 실패 시 에러
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
		throw new Error(`서버 속성 파일 읽기 실패: ${err.message}`);
	}
}

/**
 * server.properties 파일을 업데이트하는 함수
 * @param {Object} newSettings 업데이트할 설정
 * @returns {Promise<void>}
 * @throws {Error} 파일 쓰기 실패 시 에러
 */
async function updateServerProperties(newSettings) {
	try {
		const currentSettings = await readServerProperties();
		const updatedSettings = { ...currentSettings, ...newSettings };
		const propertiesString = Object.entries(updatedSettings)
			.map(([key, value]) => `${key}=${value}`)
			.join("\n");
		await fs.writeFile(
			path.join(config.minecraftDir, "server.properties"),
			propertiesString,
			"utf8"
		);
	} catch (err) {
		throw new Error(`서버 속성 파일 업데이트 실패: ${err.message}`);
	}
}

export default {
	readServerProperties,
	updateServerProperties,
};
