import { Rcon } from "rcon-client";
import {
	SlashCommandBuilder,
	EmbedBuilder,
	AttachmentBuilder,
} from "discord.js";
import serverCheck from "../../functions/serverCheck.js";
import config from "../../config.json" with { type: "json" };
import { loadLastWorld } from "../../functions/lastWorld.js";

/*
	썸네일 설정 변수들 (로컬 파일 사용 기준)
	외부에 있는 사진 파일을 사용할 경우 
	attachment,files: [] 제거하고 setThumbnail에 URL 기입
*/

export default {
	data: new SlashCommandBuilder()
		.setName("check")
		.setDescription("마크 서버 상태 확인"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();

		const serverIcon = new AttachmentBuilder(config.thumbnailDir);

		let rcon;

		let resultEmbed = new EmbedBuilder()
			.setTitle("**" + (await loadLastWorld()) + "**")
			.setThumbnail(`attachment://${config.thumbnailFile}`);

		const check = await serverCheck();

		if (check === null) {
			await interaction.editReply("서버 연결 실패!");
			return;
		} else if (!check) {
			resultEmbed
				.setColor(0xf70707)
				.setDescription("The world is offline! :x:");

			await interaction.editReply({
				embeds: [resultEmbed],
				files: [serverIcon],
			});
			return;
		}

		try {
			rcon = await Rcon.connect({
				host: config.RCsettings.host,
				port: config.RCsettings.port,
				password: config.RCsettings.password,
			});

			const response = await rcon.send("list");
			const playerList =
				response
					.split(":")[1]
					?.split(",")
					.map((player) => player.trim()) || [];

			resultEmbed
				.setColor(0x08f608)
				.setDescription("The world is online! :white_check_mark:")
				.addFields(
					{
						name: `플레이어 [ ${playerList.length}명 ]`,
						value: `${playerList}`,
					},
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

			await interaction.editReply("서버 연결 실패!");
		} finally {
			if (rcon) {
				await rcon.end();
			}
		}
	},
};
