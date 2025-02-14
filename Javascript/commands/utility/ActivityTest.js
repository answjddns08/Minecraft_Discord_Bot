import { SlashCommandBuilder, ActivityType } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("set")
		.setDescription("Setting the activity type"),
	async execute(client) {
		await client.user.setActivity({
			name: "testing",
			type: ActivityType.Playing,
		});
	},
};
