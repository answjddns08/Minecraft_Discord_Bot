import { SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";
import { exec } from "child_process";

const worldDir = "/home/redeyes/Documents/MinecraftWorlds";

export default {
	data: new SlashCommandBuilder()
		.setName("list")
		.setDescription("월드 목록 보기"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		config({ path: ".env" });

		const worldName = process.env.lastWorld;

		await exec(`ls ${worldDir}`, (error, stdout, stderr) => {
			if (error) {
				console.error(`실행 오류: ${error}`);
				interaction.reply("월드 목록을 불러오는 중 오류 발생!");
				return;
			}

			const worldList = stdout.split("\n").filter((world) => world !== "");

			if (worldList.length === 0) {
				interaction.reply("월드가 없습니다.\n하나 만드십시오 휴먼");
				return;
			}

			interaction.reply(
				`현재 선택된 월드: **${worldName}\n\n**월드 목록\n${worldList
					.map((world) => `- :file_folder: ${world}`)
					.join("\n")}`
			);
		});
	},
};
