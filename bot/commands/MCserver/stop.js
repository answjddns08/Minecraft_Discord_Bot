import { ActivityType, SlashCommandBuilder } from "discord.js";
import { Rcon } from "rcon-client";
import config from "../../config/config.json" with { type: "json" };
import { stopAutoShutdown } from "../../functions/autoShutdown.js";
import {
	isServerRunning,
	stopMinecraftServer,
} from "../../functions/dockerControl.js";

export default {
	data: new SlashCommandBuilder()
		.setName("stop")
		.setDescription("마크 서버 종료"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		const check = await isServerRunning();

		if (!check) {
			await interaction.reply("월드가 꺼져 있어요. :x:");
			return;
		}

		const rcon = new Rcon({
			host: config.RCsettings.host,
			port: config.RCsettings.port,
			password: config.RCsettings.password,
		});

		await rcon.connect();

		const response = await rcon.send("list");

		if (response.split(":")[1]?.trim().split(",").length > 1) {
			await interaction.reply("플레이어가 서버에 남아있어요! :x:");
			await rcon.end();
			return;
		}

		await rcon.send("stop");

		await rcon.end();

		try {
			console.log(`[Server] 컨테이너 중지 중...`);
			await stopMinecraftServer();
			console.log(`[Server] 컨테이너 중지 완료`);
		} catch (error) {
			console.error(`[Server] 컨테이너 중지 오류:`, error);
		}

		interaction.client.user.setPresence({
			activities: [
				{
					name: "휴식 시간..",
					type: ActivityType.Custom,
				},
			],
			status: "idle",
		});

		stopAutoShutdown();

		await interaction.reply("월드를 종료합니다. :zzz:");
	},
};
