import { SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
import serverCheck from "../../functions/serverCheck.js";
import { promises as fs } from "fs";
import path from "path";
import config from "../../config.json" assert { type: "json" };

const worlds = await fs.readdir(config.worldDir);

export default {
	data: new SlashCommandBuilder()
		.setName("rename")
		.setDescription("월드 이름 변경")
		.addStringOption((option) =>
			option
				.setName("oldname")
				.setDescription("변경할 월드 이름")
				.addChoices(
					worlds.map((world) => ({
						name: world,
						value: world,
					}))
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("newname")
				.setDescription("새로운 월드 이름")
				.setMaxLength(20)
				.setRequired(true)
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		dotenv.config({ path: ".env" });

		const oldName = interaction.options.getString("oldname");

		if (oldName === process.env.lastWorld && (await serverCheck())) {
			interaction.reply(
				"서버가 실행 중일 때는 현재 선택된 월드의 이름을 변경할 수 없습니다."
			);
			return;
		}

		const newName = interaction.options.getString("newname");

		if (!worlds.includes(oldName)) {
			await interaction.reply("존재하지 않는 월드 이름입니다.");
			return;
		}

		if (worlds.includes(newName)) {
			await interaction.reply("이미 존재하는 월드 이름입니다.");
			return;
		}

		try {
			const oldPath = path.join(config.worldDir, oldName);
			const newPath = path.join(config.worldDir, newName);

			await fs.rename(oldPath, newPath);
		} catch (error) {
			console.log(error);

			await interaction.reply("월드 이름 변경중 오류 발생!");

			return;
		}
	},
};
