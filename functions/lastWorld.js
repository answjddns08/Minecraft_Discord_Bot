import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const configPath = path.join(__dirname, "../config.json");

/**
 * LastWorld(마지막으로 선택된 월드) 변수 업데이트
 * @param {String} worldName - 마지막으로 선택된 월드 이름
 */
async function updateLastWorld(worldName) {
	let config = JSON.parse(await fs.readFile(configPath, "utf-8"));
	config.lastWorld = worldName;

	await fs.writeFile(configPath, JSON.stringify(config, null, 2));

	return;
}

/**
 * lostWorld 값 불러오기
 * @returns {Promise<string>} lostWorld
 */
async function loadLastWorld() {
	const config = JSON.parse(await fs.readFile(configPath, "utf-8"));

	return config.lastWorld;
}

export { updateLastWorld, loadLastWorld };
