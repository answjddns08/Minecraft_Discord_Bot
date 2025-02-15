import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("echo")
		.setDescription("replies with your input!")
		.addStringOption((option) =>
			option
				.setName("input")
				.setDescription("the input to echo back")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("category")
				.setDescription("The gif category")
				.setRequired(true)
				.addChoices(
					{ name: "Funny", value: "gif_funny" },
					{ name: "Meme", value: "gif_meme" },
					{ name: "Movie", value: "gif_movie" }
				)
		)
		.addStringOption((option) =>
			option
				.setName("server")
				.setDescription("set server to run")
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("user")
				.setDescription("Info about a user")
				.addUserOption((option) =>
					option.setName("target").setDescription("The user")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("server").setDescription("Info about the server")
		),
	async execute(interaction) {
		console.log(interaction.options);

		interaction.reply("echo!");
	},
};
