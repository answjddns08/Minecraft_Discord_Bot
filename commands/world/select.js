import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { exec } from "child_process";
import { config } from "dotenv";
import { serverCheck } from "../../functions/serverCheck.js";

const worldDir = "/home/redeyes/Documents/MinecraftWorlds";

// exec 함수를 Promise로 감싸서 비동기 처리
const getWorldList = () => {
	return new Promise((resolve, reject) => {
		exec(`ls ${worldDir}`, (error, stdout, stderr) => {
			if (error) {
				reject(error);
				return;
			}
			const worlds = stdout.split("\n").filter((world) => world.trim() !== "");
			resolve(worlds);
		});
	});
};

export default {
	data: new SlashCommandBuilder().setName("select").setDescription("월드 선택"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		const check = serverCheck();

		if (check === null) {
			await interaction.reply("서버 상태를 확인하는 중 오류 발생!");
			return;
		} else if (check) {
			await interaction.reply(
				"월드가 실행 중이라 월드를 변경할 수 없어요! :no_entry_sign:"
			);
			return;
		}

		config({ path: ".env" });

		try {
			const worldList = await getWorldList();

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

				process.env.lastWorld = worldName;

				await interaction.editReply({
					content: `**${worldName}** 월드를 선택했습니다.`,
					components: [],
				});
			});
		} catch (error) {
			console.error(`실행 오류: ${error}`);
			await interaction.reply("월드 목록을 불러오는 중 오류 발생!");
		}
	},
};
