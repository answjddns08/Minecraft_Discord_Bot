import { Rcon } from "rcon-client";
import config from "../config/config.json" with { type: "json" };
import { ActivityType } from "discord.js";
import { stopMinecraftServer } from "./dockerControl.js";

const delayMin = 5;
/**
 * Minecraft 서버 자동 종료 기능(setInterval 사용함)
 * - 플레이어가 없을 때 일정 시간 후(delayMin) 서버를 자동으로 종료
 * @type {NodeJS.Timeout} shutdownTimer - 자동 종료 타이머
 */
let shutdownTimer = null;
let isNoOneOnline = false;
/**
 * @param {import('discord.js').Client} client
 */
let client;

async function autoShutdown() {
	let rcon;
	try {
		rcon = await Rcon.connect({
			host: config.RCsettings.host,
			port: config.RCsettings.port,
			password: config.RCsettings.password,
		});

		const response = await rcon.send("list");
		const playerList =
			response
				.split(":")[1]
				?.split(",")
				.map((player) => player.trim()) || [];

		const check = playerList[0] == "" ? true : false;

		console.log("Player list:", playerList);
		console.log("check:", check);
		console.log("isNoOneOnline:", isNoOneOnline);

		if (isNoOneOnline && check) {
			console.log("server Stop!");

			await rcon.send("stop");
			await rcon.end();

			// Docker 환경에서는 컨테이너 중지
			const isDocker = process.env.DOCKER_ENV === "true";
			if (isDocker) {
				try {
					console.log("[autoShutdown] 컨테이너 중지 중...");
					await stopMinecraftServer();
					console.log("[autoShutdown] 서버 자동 종료 완료");
				} catch (error) {
					console.error("[autoShutdown] 컨테이너 중지 오류:", error);
				}
			}

			client.user.setPresence({
				activities: [
					{
						name: "휴식 시간..",
						type: ActivityType.Custom,
					},
				],
				status: "idle",
			});

			return;
		}

		isNoOneOnline = check;

		rcon.end();
	} catch (error) {
		console.error("Error checking player list:", error);
		if (rcon) {
			rcon.end();
		}
	}
}

/**
 * 자동 종료 타이머 시작
 * @param {import("discord.js").Client} cli
 */
function startAutoShutdown(cli) {
	client = cli;
	shutdownTimer = setInterval(autoShutdown, delayMin * 60 * 1000);
}

function stopAutoShutdown() {
	if (shutdownTimer) {
		clearInterval(shutdownTimer);
		shutdownTimer = null;
	}
	isNoOneOnline = false;
}

export { startAutoShutdown, stopAutoShutdown };
