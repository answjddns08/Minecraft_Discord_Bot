import { SlashCommandBuilder } from "discord.js";

function sleep(sec) {
	return new Promise((resolve) => setTimeout(resolve, sec));
}

export default {
	data: new SlashCommandBuilder()
		.setName("edit")
		.setDescription("edit the replies"),
	async execute(interaction) {
		await interaction.reply("What the fuck!");

		await sleep(1000);

		await interaction.editReply("What the f**k!");
	},
};
