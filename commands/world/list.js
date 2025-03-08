import { SlashCommandBuilder } from "discord.js";
import { promises as fs } from "fs";
import config from "../../config.json" assert { type: "json" };
import { loadLastWorld } from "../../functions/lastWorld";

export default {
	data: new SlashCommandBuilder()
		.setName("list")
		.setDescription("월드 목록 보기"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		const selectedWorld = loadLastWorld();

		try {
			const worldList = await fs.readdir(config.worldDir);

			if (worldList.length === 0) {
				await interaction.reply("월드가 없습니다\n하나 만드십시오 휴먼");
				return;
			}

			await interaction.reply(
				`현재 선택된 월드: **${selectedWorld}**\n\n월드 목록\n${worldList
					.map((world) => `- :file_folder: ${world}`)
					.join("\n")}`
			);
		} catch (error) {
			console.log(error);
			await interaction.reply("월드 목록을 불러오던 중 오류 발생!");
			return;
		}
	},
};
