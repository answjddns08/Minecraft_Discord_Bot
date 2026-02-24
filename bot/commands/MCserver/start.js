import { SlashCommandBuilder, ActivityType } from "discord.js";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import serverCheck from "../../../shared/functions/serverCheck.js";
import config from "../../config.json" with { type: "json" };
import { startAutoShutdown } from "../../../shared/functions/autoShutdown.js";
import { loadLastWorld } from "../../../shared/functions/lastWorld.js";
import { startMinecraftServer } from "../../../shared/functions/dockerControl.js";

// 프로젝트 루트 경로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

export default {
	data: new SlashCommandBuilder()
		.setName("start")
		.setDescription("마크 서버 시작"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		const check = await serverCheck();

		if (check === null) {
			await interaction.reply("월드 실행 중 오류 발생!");
			return;
		} else if (check) {
			await interaction.reply(
				"이미 월드가 실행 중이에요! :arrows_counterclockwise:"
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
			`**${worldName}** 월드를 시작합니다.\n실행하는데 시간이 좀 걸려요. :hourglass_flowing_sand:`
		);

		const isDocker = process.env.DOCKER_ENV === "true";

		if (isDocker) {
			// Docker 환경: Docker API를 통해 컨테이너 생성/시작
			const mcVersion = process.env.MC_VERSION || "LATEST";

			try {
				console.log(
					`[Server] 서버 시작 중... (월드: ${worldName}, 버전: ${mcVersion})`
				);

				await startMinecraftServer(worldName, mcVersion);

				// 서버가 준비될 때까지 대기 후 완료 메시지
				setTimeout(() => {
					interaction.followUp(
						`✅ **${worldName}** 월드가 시작되었습니다! (버전: ${mcVersion})`
					);
				}, 10000);
			} catch (error) {
				console.error(`[Server] 서버 시작 실패:`, error);
				interaction.followUp("월드 실행 중 오류 발생!");
				return;
			}
		} else {
			// 로컬 환경: tmux 세션 시작
			exec(
				`tmux new-session -d -s ${config.sessionName} '${config.sessionCommand}'`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(`실행 오류: ${error}`);
						interaction.reply("월드 실행 중 오류 발생!");
						return;
					}
				}
			);
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
