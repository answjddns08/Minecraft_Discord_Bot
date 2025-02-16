import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SlashCommandBuilder,
} from "discord.js";
import { link } from "fs";

export default {
	data: new SlashCommandBuilder()
		.setName("button")
		.setDescription("show a button!"),
	async execute(interaction) {
		const primary = new ButtonBuilder()
			.setCustomId("primary")
			.setLabel("primary btn")
			.setStyle(ButtonStyle.Primary);

		const second = new ButtonBuilder()
			.setCustomId("second")
			.setLabel("second btn")
			.setStyle(ButtonStyle.Secondary);

		const success = new ButtonBuilder()
			.setCustomId("success")
			.setLabel("success btn")
			.setStyle(ButtonStyle.Success);

		const Danger = new ButtonBuilder()
			.setCustomId("Danger")
			.setLabel("Danger  btn")
			.setStyle(ButtonStyle.Danger);

		const Link = new ButtonBuilder()
			.setLabel("Link  btn")
			.setURL("https://notebook.o-r.kr")
			.setStyle(ButtonStyle.Link);

		const row = new ActionRowBuilder().addComponents(
			primary,
			second,
			success,
			Danger,
			Link
		);

		const response = await interaction.reply({
			content: `test buttons`,
			components: [row],
			withResponse: true,
		});

		//버튼 누른 놈이 명령어 친 놈인지 확인하는 필터
		const collectorFilter = (i) => i.user.id === interaction.user.id;

		try {
			const confirmation =
				await response.resource.message.awaitMessageComponent({
					filter: collectorFilter,
					time: 60000,
				});

			await confirmation.update({
				content: `the custom ID is ${confirmation.customId}`,
				components: [],
			});
		} catch {
			await interaction.editReply({
				content: "Confirmation not received within 1 minute, cancelling",
				components: [],
			});
		}
	},
};
