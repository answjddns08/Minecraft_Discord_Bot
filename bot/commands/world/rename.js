import { SlashCommandBuilder } from "discord.js";
import { promises as fs } from "fs";
import path from "path";
import config from "../../config/config.json" with { type: "json" };
import { loadLastWorld } from "../../functions/lastWorld.js";
import { isServerRunning } from "../../functions/dockerControl.js";

export default {
	data: new SlashCommandBuilder()
		.setName("rename")
		.setDescription("월드 이름 변경")
		.addStringOption((option) =>
			option
				.setName("oldname")
				.setDescription("변경할 월드 이름")
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
		const worlds = await fs.readdir(config.worldDir);
		const oldName = interaction.options.getString("oldname");

		if (oldName === (await loadLastWorld()) && (await isServerRunning())) {
			interaction.reply("서버가 실행 중인 월드의 이름을 변경할 수 없습니다.");
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

		// 월드 이름 검증: 알파벳, 숫자, 한글, 언더스코어(_), 하이픈(-)만 허용
		const validNameRegex = /^[a-zA-Z0-9_\-가-힣]+$/;
		if (!validNameRegex.test(worldName)) {
			await interaction.reply(
				"월드 이름은 영문, 숫자, 한글, 언더스코어(_), 하이픈(-)만 사용 가능합니다.",
			);
			return;
		}

		try {
			const oldPath = path.join(config.worldDir, oldName);
			const newPath = path.join(config.worldDir, newName);

			await fs.rename(oldPath, newPath);

			await interaction.reply(
				`✅ **${oldName}** → **${newName}** 월드 이름이 변경되었습니다.`
			);
		} catch (error) {
			console.log(error);

			await interaction.reply("월드 이름 변경중 오류 발생!");

			return;
		}
	},
};
