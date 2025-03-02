import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { promises as fs } from "fs";
import config from "../../config.json" assert { type: "json" };
import cleanUpSchedule from "../../functions/cleanUpSchedule.js";
import path from "path";

export default {
	data: new SlashCommandBuilder()
		.setName("restore")
		.setDescription("월드 복원"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		const TrashWorldList = await fs.readdir(config.TrashWorldDir);

		if (TrashWorldList.length === 0) {
			await interaction.reply("복원할 월드가 없습니다.");
			return;
		}

		const selectList = new StringSelectMenuBuilder()
			.setCustomId("WorldRestore")
			.setPlaceholder("복원할 월드 선택")
			.addOptions(
				TrashWorldList.map((world) =>
					new StringSelectMenuOptionBuilder()
						.setLabel(world)
						.setValue(world)
						.setDescription(`${world} 월드 복원`)
				)
			);

		const row = new ActionRowBuilder().addComponents(selectList);

		const response = await interaction.reply({
			content: "복원할 월드를 선택해주세요.\n\n-# 명령어 친 사람만 사용 가능",
			components: [row],
			withResponse: true,
		});

		// 명령어 친 사람만 사용 가능
		const collectorFilter = (i) => i.user.id === interaction.user.id;

		const collector = response.resource.message.createMessageComponentCollector(
			{
				filter: collectorFilter,
				time: 180000, // 3분
			}
		);

		collector.on("collect", async (i) => {
			const worldName = i.values[0];

			fs.rename(
				path.join(config.TrashWorldDir, worldName),
				path.join(config.worldDir, worldName)
			);

			await interaction.editReply({
				content: `**${worldName}** 월드를 복원했습니다.`,
				components: [],
			});

			if (TrashWorldList.length === 1) {
				cleanUpSchedule().cancel();
			}

			collector.stop("manual");
			return;
		});

		collector.on("end", async (i, reason) => {
			if (reason === "manual") return;
			await interaction.editReply({
				content: "시간이 초과되었습니다.",
				components: [],
			});
		});
	},
};
