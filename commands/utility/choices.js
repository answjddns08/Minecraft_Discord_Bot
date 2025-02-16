import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("choices")
		.setDescription("many choices!")
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
		),

	async execute(interaction) {
		interaction.reply("Max choices is 25!");
	},
};
