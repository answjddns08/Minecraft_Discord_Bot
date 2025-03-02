import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { promises as fs } from "fs";
import serverCheck from "../../functions/serverCheck.js";
import config from "../../config.json" assert { type: "json" };
import changeWorld from "../../functions/changeWorlds.js";
import worldSetting from "../../functions/worldSetting.js";
import ServerSetting from "../../functions/ServerSetting.js";
import giveOp from "../../functions/giveOp.js";
import updateLastWorld from "../../functions/UpdateLastWorld.js";

/*
	env파일이 python과 달리 동적으로 변경이 되지 않음
	(되긴 되는데 디코 봇이 꺼지면 초기화됨, 기존 값으로 되돌아감)
	만약 디코 봇이 오류로 인해 꺼질 경우 env 파일을 수정해야 하는 귀찮음 생김
	-> worldSetting.json에 lastWorld라는 key를 추가하여 마지막으로 선택한 월드를 저장
*/

export default {
	data: new SlashCommandBuilder().setName("select").setDescription("월드 선택"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		const check = await serverCheck();

		if (check === null) {
			await interaction.reply("서버 상태를 확인하는 중 오류 발생!");
			return;
		} else if (check) {
			await interaction.reply(
				"월드가 실행 중이라 월드를 변경할 수 없어요! :no_entry_sign:"
			);
			return;
		}

		try {
			const worldList = await fs.readdir(config.worldDir);

			const selectList = new StringSelectMenuBuilder()
				.setCustomId("WorldSelect")
				.setPlaceholder("월드 선택")
				.addOptions(
					worldList.map((world) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(world)
							.setValue(world)
							.setDescription(`${world} 월드 선택`)
					)
				);

			const row = new ActionRowBuilder().addComponents(selectList);

			const response = await interaction.reply({
				content: "월드를 선택해주세요.\n\n-# 명령어 친 사람만 사용 가능",
				components: [row],
				withResponse: true,
			});

			const collectorFilter = (i) => i.user.id === interaction.user.id;

			const collector =
				response.resource.message.createMessageComponentCollector({
					filter: collectorFilter,
					time: 180000, // 3분
				});

			collector.on("collect", async (i) => {
				const worldName = i.values[0];

				const lastWorld = config.lastWorld;

				await changeWorld(lastWorld, worldName);

				const worldSet = (await worldSetting.readWorldSettings())[worldName];

				await ServerSetting.updateServerProperties({
					difficulty: worldSet.difficulty,
					gameMode: worldSet.gameMode,
				});

				if (worldSet.op === true) {
					await giveOp();
				}

				await interaction.editReply({
					content: `선택된 월드: **${lastWorld}** -> **${worldName}**`,
					components: [],
				});

				await updateLastWorld(worldName);

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
			console.error(`실행 오류: ${error}`);
			await interaction.reply("월드 목록을 불러오는 중 오류 발생!");
		}
	},
};
