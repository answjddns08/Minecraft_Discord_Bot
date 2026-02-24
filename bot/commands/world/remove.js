import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { promises as fs } from "fs";
import path from "path";
import config from "../../config/config.json" with { type: "json" };
import cleanUpSchedule from "../../functions/cleanUpSchedule.js";
import { loadLastWorld, updateLastWorld } from "../../functions/lastWorld.js";
import serverCheck from "../../functions/serverCheck.js";

export default {
	data: new SlashCommandBuilder().setName("remove").setDescription("월드 삭제"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		// 서버 실행 상태 확인
		const check = await serverCheck();

		if (check === null) {
			await interaction.reply("서버 상태를 확인하는 중 오류 발생!");
			return;
		} else if (check) {
			await interaction.reply(
				"서버가 실행 중이라 월드를 삭제할 수 없어요! :no_entry_sign:",
			);
			return;
		}

		try {
			const worldList = await fs.readdir(config.worldDir);

			if (worldList.length === 0) {
				await interaction.reply("삭제할 월드가 없습니다.");
				return;
			}

			const selectList = new StringSelectMenuBuilder()
				.setCustomId("WorldRestore")
				.setPlaceholder("삭제할 월드 선택")
				.addOptions(
					worldList.map((world) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(world)
							.setValue(world)
							.setDescription(`${world} 월드 삭제`),
					),
				);

			const row = new ActionRowBuilder().addComponents(selectList);

			const response = await interaction.reply({
				content: "삭제할 월드를 선택해주세요.\n\n-# 명령어 친 사람만 사용 가능",
				components: [row],
				withResponse: true,
			});

			// 버튼을 누른 유저가 명령어를 사용한 유저인지 확인
			const collectorFilter = (i) => i.user.id === interaction.user.id;

			const collector =
				response.resource.message.createMessageComponentCollector({
					filter: collectorFilter,
					time: 180000, // 3min
				});

			collector.on("collect", async (i) => {
				const worldName = i.values[0];

				if (worldName === (await loadLastWorld())) {
					updateLastWorld("");
				}

				try {
					const sourcePath = path.join(config.worldDir, worldName);
					const destPath = path.join(config.TrashWorldDir, worldName);

					await fs.rename(sourcePath, destPath);
				} catch (error) {
					console.error(error);
					await interaction.editReply("월드 제거중 오류 발생!");
					return;
				}

				await interaction.editReply({
					content: `**${worldName}** 월드를 삭제했습니다.`,
					components: [],
				});

				// 월드 제거 후 cleanUpSchedule 함수가 이미 실행되어 있으면 그냥 리턴
				// cleanUpSchedule 함수가 실행되어 있지 않으면 실행

				cleanUpSchedule();

				collector.stop("manual");
				return;
			});

			collector.on("end", async (i, reason) => {
				if (reason === "manual") return;
				await interaction.editReply({
					content: "시간이 초과되었습니다.",
					components: [],
				});
			});
		} catch (error) {
			console.error(error);
			await interaction.reply("오류 발생!");
		}
	},
};
