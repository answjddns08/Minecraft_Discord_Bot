import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with Pong!"),
	async execute(interaction) {
		const client = await import("../../index.js");

		console.log(interaction.client.ws.ping);

		await interaction.reply("Pong! with" + client.client.ws.ping + "ms");
	},
};
