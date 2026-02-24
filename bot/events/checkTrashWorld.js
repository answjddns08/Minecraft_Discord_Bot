import { Events } from "discord.js";
import { promises as fs } from "fs";
import config from "../config/config.json" with { type: "json" };
import cleanUpSchedule from "../functions/cleanUpSchedule.js";

export default {
	name: Events.ClientReady,
	once: true,
	/**
	 * @param {import("discord.js").Client} client
	 */
	async execute(client) {
		try {
			const worldList = await fs.readdir(config.TrashWorldDir);

			if (worldList.length === 0) return;

			cleanUpSchedule();
		} catch (error) {
			// TrashWorldDir이 없으면 무시 (정상 상황)
			if (error.code !== "ENOENT") {
				console.error("Error checking trash world:", error);
			}
		}
	},
};
