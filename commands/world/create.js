import {
	SlashCommandBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { promises as fs } from "fs";
import path from "path";
import dotenv from "dotenv";
import config from "../../config.json" assert { type: "json" };
import worldSetting from "../../functions/worldSetting.js";
import changeWorld from "../../functions/changeWorlds.js";
import ServerSetting from "../../functions/ServerSetting.js";

/*
	월드의 정보를 어디다가 저장하지?
	json?,DB?
	-> json으로 저장
	json에 월드 이름, 난이도, 게임 모드, OP 여부 저장
	-> 월드 이름을 key로 사용
	-> json 파일 이름: worldSettings.json
*/

export default {
	data: new SlashCommandBuilder()
		.setName("create")
		.setDescription("월드 생성")
		.addStringOption((option) =>
			option
				.setName("worldname")
				.setDescription("생성할 월드 이름")
				.setMaxLength(20)
				.setRequired(true)
		),
	/**
	 * @param {import("discord.js").CommandInteraction} interaction
	 */
	async execute(interaction) {
		const worldName = interaction.options.getString("worldname");

		const worldList = await fs.readdir(config.worldDir);

		if (worldList.includes(worldName)) {
			await interaction.reply("이미 존재하는 월드입니다.");
			return;
		}

		try {
			await fs.mkdir(path.join(config.worldDir, worldName));
			await interaction.reply(`${worldName} 월드 생성 완료!`);
		} catch (error) {
			console.error(error);
			await interaction.reply("월드 생성 중 오류 발생!");
			return;
		}

		// 월드 설정
		/*
			월드 난이도(메뉴)
			게임 모드 설정(메뉴)
			op 여부(버튼)
		*/

		const difficultyList = new StringSelectMenuBuilder()
			.setCustomId("difficultySelect")
			.setPlaceholder("난이도 선택")
			.addOptions([
				new StringSelectMenuOptionBuilder()
					.setLabel("평화로움")
					.setValue("peaceful")
					.setDescription("응애 모드"),
				new StringSelectMenuOptionBuilder()
					.setLabel("쉬움")
					.setValue("easy")
					.setDescription("죽기엔 아직 어림"),
				new StringSelectMenuOptionBuilder()
					.setLabel("보통")
					.setValue("normal")
					.setDescription("적당함"),
				new StringSelectMenuOptionBuilder()
					.setLabel("어려움")
					.setValue("hard")
					.setDescription("악몽의 시간!"),
				//.setDefault(true),
			]);

		const gameModeList = new StringSelectMenuBuilder()
			.setCustomId("gameModeSelect")
			.setPlaceholder("게임 모드 선택")
			.addOptions([
				new StringSelectMenuOptionBuilder()
					.setLabel("서바이벌")
					.setValue("survival")
					.setDescription("생존"),
				/* .setDefault(true), */ new StringSelectMenuOptionBuilder()
					.setLabel("크리에이티브")
					.setValue("creative")
					.setDescription("gun축가"),
				new StringSelectMenuOptionBuilder()
					.setLabel("어드벤처")
					.setValue("adventure")
					.setDescription("핀과 제익흐의 어드벤처 타임"),
			]);

		const opConfirmBtn = new ButtonBuilder()
			.setCustomId("opConfirm")
			.setLabel("OP 허용하는 허졉쉑")
			.setStyle(ButtonStyle.Success);

		const opCancelBtn = new ButtonBuilder()
			.setCustomId("opCancel")
			.setLabel("OP 거부하는 10상남자")
			.setStyle(ButtonStyle.Danger);

		const actionRows = [
			new ActionRowBuilder().addComponents(difficultyList),
			new ActionRowBuilder().addComponents(gameModeList),
			new ActionRowBuilder().addComponents(opConfirmBtn, opCancelBtn),
		];

		const settingResponse = await interaction.followUp({
			content: "월드 설정",
			components: actionRows,
			withResponse: true,
		});

		const worldSettings = {
			difficulty: null,
			gameMode: null,
		};

		const opEnable = null;

		const filter = (interaction) => interaction.user.id === interaction.user.id;

		const settingCollector = settingResponse.createMessageComponentCollector({
			filter: filter,
			time: 180000, // 3min
		});

		await settingCollector.on("collect", async (i) => {
			if (i.isStringSelectMenu()) {
				if (i.customId === "difficultySelect") {
					worldSettings.difficulty = i.values[0];
				} else if (i.customId === "gameModeSelect") {
					worldSettings.gameMode = i.values[0];
				}
			} else if (i.isButton()) {
				opEnable = i.customId === "opConfirm";
			}

			await i.deferUpdate();

			// 모든 설정이 완료되었는지 확인
			if (
				worldSettings.difficulty &&
				worldSettings.gameMode &&
				opEnable !== null
			) {
				settingResponse.edit({
					content: "설정이 완료되었습니다.",
					components: [],
				});
				settingCollector.stop();
			}
		});

		const confirmBtn = new ButtonBuilder()
			.setCustomId("setLastWorld")
			.setLabel("확인")
			.setStyle(ButtonStyle.Success);

		const cancelBtn = new ButtonBuilder()
			.setCustomId("notSetLastWorld")
			.setLabel("취소")
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

		let selectResponse;

		let selectCollector;

		settingCollector.on("end", async () => {
			if (
				!worldSettings.difficulty ||
				!worldSettings.gameMode ||
				opEnable === null
			) {
				await settingResponse.edit({
					content:
						"시간이 초과되었습니다.\n(선택을 안한 나머지는 기본 설정으로 조정)",
					components: [],
				});
			}

			worldSettings.difficulty = worldSettings.difficulty || world.difficulty;
			worldSettings.gameMode = worldSettings.gameMode || world.gameMode;
			opEnable = opEnable ?? world.op;

			// 월드 설정을 json파일에 저장

			worldSetting.updateWorldSettings(worldName, worldSettings);

			selectResponse = await interaction.followUp({
				content: "선택한 월드로 변경하시겠습니까?",
				components: [row],
				withResponse: true,
			});

			selectCollector = selectResponse.createMessageComponentCollector({
				filter: filter,
				time: 180000, // 3min
			});

			selectCollector.on("collect", async (i) => {
				if (i.isButton()) {
					if (i.customId === "setLastWorld") {
						await dotenv.config({ path: ".env" });

						await changeWorld(process.env.lastWorld, worldName);

						process.env.lastWorld = worldName;

						ServerSetting.updateServerProperties(worldSettings);

						await i.update({
							content: `선택된 월드: **${process.env.lastWorld}** -> **${worldName}**`,
							components: [],
						});
					} else {
						await i.update({
							content: "월드 설정이 취소되었습니다.",
							components: [],
						});
					}
				}
			});

			selectCollector.on("end", async () => {
				await selectResponse.edit({
					content: "시간이 초과되었습니다.",
					components: [],
				});
			});
		});
	},
};
