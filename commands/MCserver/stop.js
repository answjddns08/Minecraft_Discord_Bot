import { ActivityType, SlashCommandBuilder } from "discord.js";
import { exec } from "child_process";
import serverCheck from "../../functions/serverCheck.js";
import { Rcon } from "rcon-client";
import config from "../../config.json" assert { type: "json" };

export default {
	data: new SlashCommandBuilder()
		.setName("stop")
		.setDescription("마크 서버 종료"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		const check = await serverCheck();

		if (check === null) {
			interaction.reply("월드 종료 중 오류 발생!");
			return;
		} else if (!check) {
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

		await exec(
			`tmux kill-session -t ${config.sessionName}`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(`실행 오류: ${error}`);
					interaction.reply("월드 종료 중 오류 발생!");
					return;
				}
			}
		);

		interaction.client.user.setPresence({
			activities: [
				{
					name: "휴식 시간..",
					type: ActivityType.Custom,
				},
			],
			status: "idle",
		});

		await interaction.reply("stop!");
	},
};
