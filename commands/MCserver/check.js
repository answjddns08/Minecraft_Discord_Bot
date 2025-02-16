import { Rcon } from "rcon-client";
import {
	SlashCommandBuilder,
	EmbedBuilder,
	AttachmentBuilder,
} from "discord.js";
import { config } from "dotenv";

export default {
	data: new SlashCommandBuilder()
		.setName("check")
		.setDescription("minecraft server check"),
	async execute(interaction) {
		await interaction.deferReply();

		config({ path: ".env" });

		const worldName = process.env.lastWorld;

		const serverIcon = new AttachmentBuilder(
			"/home/redeyes/Documents/Minecraft/server-icon.png"
		);

		let rcon;

		let resultEmbed = new EmbedBuilder()
			.setTitle("**" + worldName + "**")
			.setThumbnail("attachment://server-icon.png");
		try {
			rcon = await Rcon.connect({
				host: "127.0.0.1",
				port: 25575,
				password: "0808",
			});

			const response = await rcon.send("list");
			const playerList = response.split(":")[1]?.trim().split(",") || "없음";

			resultEmbed
				.setColor(0x08f608)
				.setDescription("The world is online! :white_check_mark:")
				.addFields(
					{ name: "플레이어", value: `${playerList}` },
					{ name: "\u200B", value: "\u200B" },
					{
						name: "squaremap 주소",
						value: "[squaremap](http://notebook.o-r.kr:8888)",
					},
					{ name: "\u200B", value: "\u200B" },
					{ name: "서버 주소", value: "notebook.o-r.kr" }
				);

			await interaction.editReply({
				embeds: [resultEmbed],
				files: [serverIcon],
			});
		} catch (error) {
			console.error("RCON Error:", error);

			resultEmbed
				.setColor(0xf70707)
				.setDescription("The world is offline! :x:");

			await interaction.editReply({
				embeds: [resultEmbed],
				files: [serverIcon],
			});
		} finally {
			if (rcon) {
				await rcon.end();
			}
		}
	},
};
