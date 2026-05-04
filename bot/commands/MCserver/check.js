import {
	SlashCommandBuilder,
	EmbedBuilder,
	AttachmentBuilder,
} from "discord.js";
import { isServerRunning } from "../../functions/dockerControl.js";
import config from "../../config/config.json" with { type: "json" };
import { loadLastWorld } from "../../functions/lastWorld.js";
import versionCheck from "../../functions/versionCheck.js";
import { rconList, rconStop } from "../../functions/rconlist.js"

/**
 * config.json에서 현재 설정된 서버 버전 읽기
 */
function getCurrentVersion() {
	return config.currentVersion || "LATEST";
}

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
		const currentVersion = getCurrentVersion();

		let resultEmbed = new EmbedBuilder()
			.setTitle("**" + (await loadLastWorld()) + "**")
			.setThumbnail(`attachment://${config.thumbnailFile}`);

		const check = await isServerRunning();

		if (!check) {
			resultEmbed
				.setColor(0xf70707)
				.setDescription("The world is offline! :x:\n **\n**")
				.addFields(
					{
						name: "서버 주소",
						value: "mc.redeyes.dev",
						inline: true,
					},
					{
						name: "버전",
						value: currentVersion,
						inline: true,
					},
				);

			await interaction.editReply({
				embeds: [resultEmbed],
				files: [serverIcon],
			});
			return;
		}

		try {

			const { count, players } = await rconList();

			console.log("Player Count:", count);

			const { server, version } = await versionCheck();

			resultEmbed
				.setColor(0x08f608)
				.setDescription("The world is online! :white_check_mark:\n **\n**")
				.addFields(
					{
						name: `플레이어 [ ${count}명 ]`,
						value: `${players.join(", ")}\n **\n**`,
					},
					{
						name: "서버 주소",
						value: "mc.redeyes.dev",
						inline: true,
					},
					{
						name: "버전",
						value: currentVersion,
						inline: true,
					},
				);

			if (server || version) {
				resultEmbed.addFields(
					{ name: "\u200B", value: "\u200B" },
					{
						name: "서버 정보",
						value: `서버: ${server || "알 수 없음"}\n버전: ${version || "알 수 없음"}`,
					},
				);
			}

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
