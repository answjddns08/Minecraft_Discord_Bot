import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { exec } from "child_process";

const worldDir = "/home/redeyes/Documents/MinecraftWorlds";
const TrashWorldDir = "/home/redeyes/Documents/MinecraftWorldsTrash";

const getWorldList = (directory) => {
	return new Promise((resolve, reject) => {
		exec(`ls ${directory}`, (error, stdout, stderr) => {
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
	data: new SlashCommandBuilder().setName("remove").setDescription("월드 삭제"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		try {
			const worldList = await getWorldList(worldDir);

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
							.setDescription(`${world} 월드 삭제`)
					)
				);

			const row = new ActionRowBuilder().addComponents(selectList);

			const response = await interaction.reply({
				content: "삭제할 월드를 선택해주세요.\n\n-# 명령어 친 사람만 사용 가능",
				components: [row],
				withResponse: true,
			});

			// 명령어 친 사람만 사용 가능
			const collectorFilter = (i) => i.user.id === interaction.user.id;

			const collector =
				response.resource.message.createMessageComponentCollector({
					filter: collectorFilter,
					time: 180000, // 3분
				});

			collector.on("collect", async (i) => {
				const worldName = i.values[0];

				await new Promise((resolve, reject) => {
					exec(`mv ${worldDir}/${worldName} ${TrashWorldDir}`, (error) => {
						if (error) {
							console.error(`실행 오류: ${error}`);
							interaction.editReply("월드 삭제 중 오류 발생!");
							reject(error);
							return;
						}
						resolve();
					});
				});

				await interaction.editReply({
					content: `**${worldName}** 월드를 삭제했습니다.`,
					components: [],
				});
			});

			collector.on("end", async () => {
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
