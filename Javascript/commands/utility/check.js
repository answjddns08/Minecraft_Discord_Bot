import { Rcon } from "rcon-client";
import { SlashCommandBuilder } from "discord.js";

function sleep(sec) {
	return new Promise((resolve) => setTimeout(resolve, sec));
}

export default {
	data: new SlashCommandBuilder()
		.setName("check")
		.setDescription("minecraft server check"),
	async execute(interaction) {
		const rcon = await Rcon.connect({
			host: "127.0.0.1",
			port: 25575,
			password: "0808",
		});

		interaction.reply("the response is ...");

		const response = await rcon.send("list");

		console.log(response);

		await sleep(500);

		interaction.followUp(response);

		rcon.end();
	},
};
