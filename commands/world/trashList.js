import { SlashCommandBuilder } from "discord.js";
import { exec } from "child_process";

const trashWorldDir = "/home/redeyes/Documents/MinecraftWorldsTrash";

export default {
	data: new SlashCommandBuilder()
		.setName("trashlist")
		.setDescription("삭제된 월드 목록 보기"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		await exec(`ls ${trashWorldDir}`, (error, stdout, stderr) => {
			if (error) {
				console.error(`실행 오류: ${error}`);
				interaction.reply("월드 목록을 불러오는 중 오류 발생!");
				return;
			}

			const worldList = stdout.split("\n").filter((world) => world !== "");

			if (worldList.length === 0) {
				interaction.reply("삭제된 월드가 없습니다.");
				return;
			}

			interaction.reply(
				`**삭제된** 월드 목록\n${worldList
					.map((world) => `- :file_folder: ${world}`)
					.join("\n")}`
			);
		});
	},
};
