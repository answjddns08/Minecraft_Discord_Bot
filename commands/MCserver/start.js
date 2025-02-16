import { SlashCommandBuilder, ActivityType } from "discord.js";
import { exec } from "child_process";
import { config } from "dotenv";

export default {
	data: new SlashCommandBuilder()
		.setName("start")
		.setDescription("마크 서버 시작"),
	async execute(interaction) {
		config("./.env");

		const worldName = process.env.lastWorld;

		await exec(
			"tmux new-session -d -s Minecraft_Server 'cd /home/redeyes/Documents/Minecraft/ && ./start.sh'",
			(error, stdout, stderr) => {
				if (error) {
					console.error(`실행 오류: ${error}`);
					return;
				}
			}
		);

		interaction.client.user.setPresence({
			activities: [
				{
					name: `${worldName} 월드 실행`,
					type: ActivityType.Playing,
				},
			],
			status: "online",
		});

		await interaction.reply("start!");
	},
};
