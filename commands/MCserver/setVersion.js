import {
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from "discord.js";
import { promises as fs } from "fs";
import path from "path";
import serverCheck from "../../functions/serverCheck.js";
import config from "../../config.json" with { type: "json" };

export default {
	data: new SlashCommandBuilder()
		.setName("setversion")
		.setDescription("마크 서버 버전 설정"),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();

		const check = await serverCheck();

		if (check === null) {
			await interaction.editReply("서버 상태를 확인하는 중 오류 발생!");
			return;
		} else if (check) {
			await interaction.editReply(
				"서버가 실행 중이라 버전을 변경할 수 없어요! :no_entry_sign:"
			);
			return;
		}

		// Paper MC API에서 버전 목록 가져오기
		let versions = [];
		try {
			const response = await fetch("https://api.papermc.io/v2/projects/paper");
			const data = await response.json();
			versions = data.versions || [];

			if (versions.length === 0) {
				await interaction.editReply("사용 가능한 버전을 가져올 수 없습니다.");
				return;
			}
		} catch (error) {
			console.error("Paper MC API 오류:", error);
			await interaction.editReply("버전 목록을 가져오는 중 오류 발생!");
			return;
		}

		// 최신 10개 버전 추출 (역순)
		const recentVersions = versions.slice(-10).reverse();

		// 버전 선택 메뉴
		const versionList = new StringSelectMenuBuilder()
			.setCustomId("versionSelect")
			.setPlaceholder("서버 버전 선택");

		// 동적으로 버전 옵션 추가
		recentVersions.forEach((version, index) => {
			const isLatest = index === 0 ? " (최신)" : "";
			versionList.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(`${version}${isLatest}`)
					.setValue(version)
					.setDescription(`Paper 버전 ${version}`)
			);
		});

		const confirmBtn = new ButtonBuilder()
			.setCustomId("versionConfirm")
			.setLabel("확인")
			.setStyle(ButtonStyle.Success);

		const cancelBtn = new ButtonBuilder()
			.setCustomId("versionCancel")
			.setLabel("취소")
			.setStyle(ButtonStyle.Danger);

		const actionRows = [
			new ActionRowBuilder().addComponents(versionList),
			new ActionRowBuilder().addComponents(confirmBtn, cancelBtn),
		];

		const response = await interaction.editReply({
			content:
				"변경할 서버 버전을 선택해주세요.\n\n-# 명령어 친 사람만 사용 가능",
			components: actionRows,
		});

		let selectedVersion = null;

		const filter = (i) => i.user.id === interaction.user.id;

		const collector = response.createMessageComponentCollector({
			filter: filter,
			time: 180000, // 3min
		});

		collector.on("collect", async (i) => {
			if (i.isStringSelectMenu()) {
				selectedVersion = i.values[0];
				await i.deferUpdate();
			} else if (i.isButton()) {
				if (i.customId === "versionConfirm") {
					if (!selectedVersion) {
						await i.followUp({
							content: "버전을 선택해주세요.",
							ephemeral: true,
						});
						return;
					}

					try {
						// VERSION 파일에 버전 저장 (itzg 이미지가 자동으로 읽음)
						const versionFile = path.join(config.minecraftDir, "VERSION");
						await fs.writeFile(versionFile, selectedVersion, "utf8");

						await i.deferUpdate();

						await i.followUp({
							content: `✅ 서버 버전이 **${selectedVersion}**로 설정되었습니다.\n\n다음 서버 시작 시 이 버전으로 실행됩니다.`,
						});

						collector.stop("manual");
					} catch (error) {
						console.error(error);
						await interaction.followUp({
							content: `버전 설정 중 오류 발생!: ${error.message}`,
						});
					}
				} else if (i.customId === "versionCancel") {
					await i.update({
						content: "버전 설정이 취소되었습니다.",
						components: [],
					});
					collector.stop("manual");
				}
			}
		});

		collector.on("end", async (i, reason) => {
			if (reason === "manual") return;
			await response.edit({
				content: "시간이 초과되었습니다.",
				components: [],
			});
		});
	},
};
