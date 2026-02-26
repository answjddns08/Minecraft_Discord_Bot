import { SlashCommandBuilder, ActivityType } from "discord.js";
import { startAutoShutdown } from "../../functions/autoShutdown.js";
import { loadLastWorld } from "../../functions/lastWorld.js";
import {
	isServerRunning,
	startMinecraftServer,
} from "../../functions/dockerControl.js";

export default {
	data: new SlashCommandBuilder()
		.setName("start")
		.setDescription("마크 서버 시작"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		const check = await isServerRunning();

		if (check) {
			await interaction.reply(
				"이미 월드가 실행 중이에요! :arrows_counterclockwise:",
			);
			return;
		}

		const worldName = await loadLastWorld();

		if (worldName === "") {
			await interaction.reply("월드가 정해져 있지 않습니다 :x:");
			return;
		}

		// 먼저 응답하기 (Interaction 시간 초과 방지)
		await interaction.reply(
			`**${worldName}** 월드를 시작합니다.\n실행하는데 시간이 좀 걸려요. :hourglass_flowing_sand:`,
		);

		const mcVersion = process.env.MC_VERSION || "LATEST";

		try {
			console.log(`서버 시작 중... (월드: ${worldName}, 버전: ${mcVersion})`);

			await startMinecraftServer(worldName, mcVersion);
		} catch (error) {
			console.error(`[Server] 서버 시작 실패:`, error);
			interaction.followUp("월드 실행 중 오류 발생!");
			return;
		}

		interaction.client.user.setPresence({
			activities: [
				{
					name: `${worldName} 월드 운영`,
					type: ActivityType.Playing,
					state: "평화(?)로운 월드 운영 중",
				},
			],
			status: "online",
		});

		startAutoShutdown(interaction.client);
	},
};
