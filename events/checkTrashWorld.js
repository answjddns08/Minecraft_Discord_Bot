import { Events } from "discord.js";
import { promises as fs } from "fs";
import config from "../config.json" assert { type: "json" };
import cleanUpSchedule from "../functions/cleanUpSchedule.js";

export default {
	name: Events.ClientReady,
	once: true,
	/**
	 * @param {import("discord.js").Client} client
	 */
	async execute(client) {
		const worldList = await fs.readdir(config.TrashWorldDir);

		if (worldList.length === 0) return;

		cleanUpSchedule();
	},
};
