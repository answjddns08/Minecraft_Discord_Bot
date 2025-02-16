import { SlashCommandBuilder } from "discord.js";
import { exec } from "child_process";
import { Client } from "discord-rpc";
import { config } from "dotenv";

export default {
	data: new SlashCommandBuilder()
		.setName("start")
		.setDescription("마크 서버 시작"),
	async execute(interaction) {
		config("./.env");

		const clientId = process.env.testbot_id;
		const client = new Client({ transport: "ipc" });

		await exec(
			"tmux new-session -d -s Minecraft_Server 'cd /home/redeyes/Documents/Minecraft/ && ./start.sh'",
			(error, stdout, stderr) => {
				if (error) {
					console.error(`실행 오류: ${error}`);
					return;
				}
			}
		);

		await interaction.reply("start!");
	},
};
