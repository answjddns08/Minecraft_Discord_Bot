import { ActivityType, SlashCommandBuilder } from "discord.js";
import { exec } from "child_process";
import { serverCheck } from "../../functions/serverCheck.js";
import { Rcon } from "rcon-client";

export default {
	data: new SlashCommandBuilder()
		.setName("stop")
		.setDescription("마크 서버 종료"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		const check = serverCheck();

		if (check === null) {
			interaction.reply("월드 종료 중 오류 발생!");
			return;
		} else if (!check) {
			await interaction.reply("월드가 꺼져 있어요. :x:");
			return;
		} else {
			const rcon = new Rcon({
				host: "localhost",
				port: 25575,
				password: "password",
			});

			await rcon.connect();

			const response = await rcon.send("list");

			await rcon.end();

			if (response.split(":")[1]?.trim().split(",").length > 1) {
				await interaction.reply("플레이어가 서버에 남아있어요! :x:");
				return;
			}
		}

		const rcon = new Rcon({
			host: "localhost",
			port: 25575,
			password: "password",
		});

		await rcon.connect();

		await rcon.send("stop");

		await rcon.end();

		await exec(
			"tmux kill-session -t Minecraft_Server",
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
