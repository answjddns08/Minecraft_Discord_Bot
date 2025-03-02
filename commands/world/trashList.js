import { SlashCommandBuilder } from "discord.js";
import { promises as fs } from "fs";
import config from "../../config.json" assert { type: "json" };
import path from "path";

export default {
	data: new SlashCommandBuilder()
		.setName("trashlist")
		.setDescription("삭제된 월드 목록 보기"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		try {
			const worldList = await fs.readdir(config.TrashWorldDir);
			const now = Date.now();

			if (worldList.length === 0) {
				await interaction.reply("버려진 월드가 없네요!");
				return;
			}

			const worldInfoPromises = worldList.map(async (world) => {
				const stat = await fs.stat(path.join(config.TrashWorldDir, world));
				const diff = now - stat.ctime.getTime();
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));

				return `- :file_folder: ${world} - 삭제까지 ${
					config.WorldAgeDay - days
				}일 남음`;
			});

			const worldInfo = await Promise.all(worldInfoPromises);

			await interaction.reply(`버려진 월드 목록\n${worldInfo.join("\n")}`);
		} catch (error) {
			console.log(error);
			await interaction.reply("월드 목록을 불러오던 중 오류 발생!");
			return;
		}
	},
};
