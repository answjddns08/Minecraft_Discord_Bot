import { SlashCommandBuilder } from "discord.js";

function sleep(sec) {
	return new Promise((resolve) => setTimeout(resolve, sec));
}

export default {
	data: new SlashCommandBuilder()
		.setName("followup")
		.setDescription("sending message one more!"),
	async execute(interaction) {
		await interaction.reply("겨드랑이 보여주는 사나");

		await sleep(1000);

		await interaction.followUp("이 로니콜먼");
	},
};
