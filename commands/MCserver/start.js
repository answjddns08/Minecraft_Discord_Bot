import { SlashCommandBuilder, ActivityType } from "discord.js";
import { exec } from "child_process";
import serverCheck from "../../functions/serverCheck.js";
import config from "../../config.json" assert { type: "json" };

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
			interaction.reply("월드 실행 중 오류 발생!");
			return;
		} else if (check) {
			interaction.reply("이미 월드가 실행 중이에요! :arrows_counterclockwise:");
			return;
		}

		await exec(
			`tmux new-session -d -s ${config.sessionName} '${config.sessionCommand}'`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(`실행 오류: ${error}`);
					interaction.reply("월드 실행 중 오류 발생!");
					return;
				}
			}
		);

		const worldName = config.lastWorld;

		if (worldName === "") {
			await interaction.reply("월드가 정해져 있지 않습니다 :x:");
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

		await interaction.reply(
			`${worldName} 월드를 시작합니다.\n실행하는데 시간이 좀 걸려요. :hourglass_flowing_sand:`
		);
	},
};
