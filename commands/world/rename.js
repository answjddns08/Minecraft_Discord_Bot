import { SlashCommandBuilder } from "discord.js";
import { exec } from "child_process";
import { config } from "dotenv";
import { serverCheck } from "../../functions/serverCheck.js";

const worldDir = "/home/redeyes/Documents/MinecraftWorlds";

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
const getWorldList = (directory) => {
	return new Promise((resolve, reject) => {
		exec(`ls ${directory}`, (error, stdout, stderr) => {
			if (error) {
				reject(error);
				return;
			}
			const worlds = stdout.split("\n").filter((world) => world.trim() !== "");
			resolve(worlds);
		});
	});
};

/**
 * @type {string[]} worlds
 */
const worlds = await getWorldList(worldDir);

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
		config({ path: ".env" });

		const oldName = interaction.options.getString("oldname");

		if (oldName === process.env.lastWorld && serverCheck()) {
			interaction.reply(
				"서버가 실행 중일 때는 현재 선택된 월드의 이름을 변경할 수 없습니다."
			);
			return;
		}

		const newName = interaction.options.getString("newname");

		if (!worlds.includes(oldName)) {
			interaction.reply("존재하지 않는 월드 이름입니다.");
			return;
		}

		if (worlds.includes(newName)) {
			interaction.reply("이미 존재하는 월드 이름입니다.");
			return;
		}

		await exec(
			`mv ${worldDir}/${oldName} ${worldDir}/${newName}`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(`실행 오류: ${error}`);
					interaction.reply("월드 이름 변경 중 오류 발생!");
					return;
				}

				interaction.reply(
					`월드 이름 변경 완료: **${oldName}** -> **${newName}**`
				);
			}
		);
	},
};
