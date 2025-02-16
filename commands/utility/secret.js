import { MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("secret")
		.setDescription("A secret message!"),
	async execute(interaction) {
		await interaction.reply({
			content: "Secret Message!",
			flags: MessageFlags.Ephemeral,
		});
	},
};
