import {
	SlashCommandBuilder,
	UserSelectMenuBuilder,
	ActionRowBuilder,
	ComponentType,
} from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("mutliselect")
		.setDescription("multi selection"),
	async execute(interaction) {
		const userSelect = new UserSelectMenuBuilder()
			.setCustomId("users")
			.setPlaceholder("Select multiple users.")
			.setMinValues(1)
			.setMaxValues(10);

		const row1 = new ActionRowBuilder().addComponents(userSelect);

		const response = await interaction.reply({
			content: "Select users:",
			components: [row1],
			withResponse: true,
		});

		const collector = response.resource.message.createMessageComponentCollector(
			{ componentType: ComponentType.UserSelect, time: 3_600_000 }
		);

		collector.on("collect", async (i) => {
			const selection = i.values[0];
			await i.reply(`${i.user} has selected ${selection}!`);
		});
	},
};
