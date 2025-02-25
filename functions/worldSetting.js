import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filePath = path.join(__dirname, "../worldSettings.json");

/**
 * 월드 설정 파일을 읽어오는 함수
 * @returns {Promise<Object>} 월드 설정 파일의 object
 * @throws {Error} Error
 */
async function readWorldSettings() {
	try {
		const data = await fs.readFile(filePath, "utf8");
		return JSON.parse(data);
	} catch (err) {
		throw err;
	}
}

/**
 * 월드 설정을 업데이트하는 함수
 * @param {string} worldName 월드 이름
 * @param {Object} updates 업데이트할 설정
 * @returns {Promise<Object>} 업데이트된 설정
 * @throws {Error} Error
 */
async function updateWorldSettings(worldName, updates) {
	try {
		// 기존 설정 읽기
		let settings = await readWorldSettings();

		// 깊은 병합 함수
		const deepMerge = (target, source) => {
			for (const key in source) {
				if (source.hasOwnProperty(key)) {
					if (source[key] instanceof Object && key in target) {
						deepMerge(target[key], source[key]);
					} else {
						target[key] = source[key];
					}
				}
			}
			return target;
		};

		// 월드가 존재하지 않으면 새로 생성
		if (!settings[worldName]) {
			settings[worldName] = {};
		}

		// 해당 월드의 설정과 업데이트 병합
		settings[worldName] = deepMerge(settings[worldName], updates);

		// 병합된 설정을 파일에 쓰기
		const jsonData = JSON.stringify(settings, null, 2);
		await fs.writeFile(filePath, jsonData, "utf8");

		return settings;
	} catch (err) {
		throw err;
	}
}

export default {
	readWorldSettings,
	updateWorldSettings,
};
