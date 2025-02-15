import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("option")
		.setDescription("command options!")
		.addStringOption((option) =>
			option
				.setName("require")
				.setDescription("option which is required")
				.setRequired(true)
		)
		.addAttachmentOption((option) =>
			option.setName("attach").setDescription("attachment Option")
		)
		.addBooleanOption((option) =>
			option.setName("bool").setDescription("bool option")
		)
		.addChannelOption((option) =>
			option.setName("channel").setDescription("channel option")
		)
		.addIntegerOption((option) =>
			option.setName("integer").setDescription("integer option")
		)
		.addRoleOption((option) =>
			option.setName("role").setDescription("role option")
		)
		.addStringOption((option) =>
			option.setName("string").setDescription("string option")
		)
		.addUserOption((option) =>
			option.setName("user").setDescription("user option")
		),
	async execute(interaction) {
		await interaction.reply("so many command options to use!");
	},
};
