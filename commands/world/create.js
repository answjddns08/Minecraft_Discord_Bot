import {
	SlashCommandBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from "discord.js";
import fs from "fs";
import dotenv from "dotenv";
import config from "../../config.json" assert { type: "json" };

export default {
	data: new SlashCommandBuilder()
		.setName("create")
		.setDescription("월드 생성")
		.addStringOption((option) =>
			option
				.setName("worldname")
				.setDescription("생성할 월드 이름")
				.setMaxLength(20)
				.setRequired(true)
		),
	/**
	 * @param {import("discord.js").CommandInteraction} interaction
	 */
	async execute(interaction) {
		const worldName = interaction.options.getString("worldname");

		const worldList = fs.readdir(config.worldDir);

		if (worldList.includes(worldName)) {
			await interaction.reply("이미 존재하는 월드입니다.");
			return;
		}

		const createWorld = (worldName) => {
			return new Promise((resolve, reject) => {
				exec(
					`cd ${worldDir} && mkdir ${worldName}`,
					(error, stdout, stderr) => {
						if (error) {
							reject(error);
							return;
						}
						resolve();
					}
				);
			});
		};

		try {
			await createWorld(worldName);
			await interaction.reply(`${worldName} 월드 생성 완료!`);
		} catch (error) {
			console.error(error);
			await interaction.reply("월드 생성 중 오류 발생!");
			return;
		}

		const confirmBtn = new ButtonBuilder()
			.setCustomId("setLastWorld")
			.setLabel("확인")
			.setStyle(ButtonStyle.Success);

		const cancelBtn = new ButtonBuilder()
			.setCustomId("notSetLastWorld")
			.setLabel("취소")
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

		const interactionId = interaction.user.id;

		const response = await interaction.followUp({
			content: "생성한 월드를 실행할 월드로 설정하시겠습니까?",
			components: [row],
			withResponse: true,
		});

		const filter = (i) => i.user.id === interaction.user.id;

		try {
			const confirmation = await response.awaitMessageComponent({
				filter,
				time: 180000,
			});

			dotenv.config({ path: ".env" });

			if (confirmation.customId === "setLastWorld") {
				await confirmation.update({
					content: `선택된 월드: **${process.env.lastWorld}** -> **${worldName}**`,
					components: [],
				});

				process.env.lastWorld = worldName;
			} else {
				await confirmation.update({
					content: "월드 설정이 취소되었습니다.",
					components: [],
				});
			}
		} catch (error) {
			await interaction.editReply({
				content: "시간이 초과되었습니다.",
				components: [],
			});
		}
	},
};
