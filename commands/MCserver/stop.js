import { SlashCommandBuilder } from "discord.js";
import { exec } from "child_process";

export default {
	data: new SlashCommandBuilder()
		.setName("stop")
		.setDescription("마크 서버 종료"),
	async execute(interaction) {
		const client = await import("../../index.js");

		exec("tmux kill-session -t Minecraft_Server", (error, stdout, stderr) => {
			if (error) {
				console.error(`실행 오류: ${error}`);
				return;
			}
		});

		console.log(client.client.user.presence);

		await interaction.reply("stop!");
	},
};
