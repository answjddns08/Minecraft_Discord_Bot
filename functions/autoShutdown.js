import { Rcon } from "rcon-client";
import config from "../config.json" assert { type: "json" };
import { ActivityType } from "discord.js";

const delayMin = 5;
let shutdownTimer;
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

		const check = playerList.length === 1 ? true : false;

		console.log("Player list:", playerList);
		console.log("check:", check);
		console.log("isNoOneOnline:", isNoOneOnline);

		if (isNoOneOnline && check) {
			console.log("server Stop!");

			await rcon.send("stop");
			await rcon.end();

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

function startAutoShutdown(cli) {
	client = cli;
	shutdownTimer = setInterval(autoShutdown, delayMin * 60 * 1000);
}

function stopAutoShutdown() {
	clearInterval(shutdownTimer);
	isNoOneOnline = false;
}

export { startAutoShutdown, stopAutoShutdown };
