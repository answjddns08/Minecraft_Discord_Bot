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
import config from "../../config/config.json" with { type: "json" };
import worldSetting from "../../functions/worldSetting.js";
import changeWorld from "../../functions/changeWorlds.js";
import ServerSetting from "../../functions/ServerSetting.js";
import giveOp from "../../functions/giveOp.js";
import { updateLastWorld } from "../../functions/lastWorld.js";
import { isServerRunning } from "../../functions/dockerControl.js";

/*
	월드 생성하는데 글자 제한 안둠

	특수기호나 띄어쓰기 등의 기호가 허용되긴 한데 나중에 문제 생길 수 있으니 제한해야 할 듯
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
        .setRequired(true),
    ),
  /**
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const worldName = interaction.options.getString("worldname");

    // 월드 이름 검증: 알파벳, 숫자, 한글, 언더스코어(_), 하이픈(-)만 허용
    const validNameRegex = /^[a-zA-Z0-9_\-가-힣]+$/;
    if (!validNameRegex.test(worldName)) {
      await interaction.reply(
        "월드 이름은 영문, 숫자, 한글, 언더스코어(_), 하이픈(-)만 사용 가능합니다.",
      );
      return;
    }

    const worldList = await fs.readdir(config.worldDir);

    if (worldList.includes(worldName)) {
      // 월드가 이미 존재하는지 확인
      await interaction.reply("이미 존재하는 월드입니다.");
      return;
    }

    try {
      // 월드 디렉토리 생성
      await fs.mkdir(path.join(config.worldDir, worldName));
      await interaction.reply(`${worldName} 월드 생성 완료!`);
    } catch (error) {
      console.error(error);
      await interaction.reply("월드 생성 중 오류 발생!");
      return;
    }

    /*
			월드 설정

			월드 난이도(메뉴)
			게임 모드 설정(메뉴)
			지형 설정(메뉴)
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
          .setDescription("적당함 (기본 설정)"),
        new StringSelectMenuOptionBuilder()
          .setLabel("어려움")
          .setValue("hard")
          .setDescription("악몽의 시간!"),
      ]);

    const gameModeList = new StringSelectMenuBuilder()
      .setCustomId("gameModeSelect")
      .setPlaceholder("게임 모드 선택")
      .addOptions([
        new StringSelectMenuOptionBuilder()
          .setLabel("서바이벌")
          .setValue("survival")
          .setDescription("생존 (기본 설정)"),
        new StringSelectMenuOptionBuilder()
          .setLabel("크리에이티브")
          .setValue("creative")
          .setDescription("gun축가"),
        new StringSelectMenuOptionBuilder()
          .setLabel("어드벤처")
          .setValue("adventure")
          .setDescription("핀과 제익흐의 어드벤처 타임"),
      ]);

    const worldTypeList = new StringSelectMenuBuilder()
      .setCustomId("levelTypeSelect")
      .setPlaceholder("지형 선택")
      .addOptions([
        new StringSelectMenuOptionBuilder()
          .setLabel("기본 월드")
          .setValue("minecraft:normal")
          .setDescription(
            "언덕, 계곡, 물 등이 생성되는 일반적인 월드 (기본 설정)",
          ),
        new StringSelectMenuOptionBuilder()
          .setLabel("평지")
          .setValue("minecraft:flat")
          .setDescription("마을밖에 없는 평평한 땅(주로 건축용으로 사용)"),
        new StringSelectMenuOptionBuilder()
          .setLabel("대형 바이옴")
          .setValue("minecraft:largeBiomes")
          .setDescription("기본 월드와 같으나 생물 군계의 구역이 더 커짐"),
        new StringSelectMenuOptionBuilder()
          .setLabel("높이 증폭")
          .setValue("minecraft:amplified")
          .setDescription("기본 월드와 같으나 높이가 더 증가함"),
      ]);

    const opConfirmBtn = new ButtonBuilder()
      .setCustomId("opConfirm")
      .setLabel("OP 허용하는 허졉쉑")
      .setStyle(ButtonStyle.Success);

    const opCancelBtn = new ButtonBuilder()
      .setCustomId("opCancel")
      .setLabel("OP 거부하는 10상남자 (기본 설정)")
      .setStyle(ButtonStyle.Danger);

    const actionRows = [
      new ActionRowBuilder().addComponents(difficultyList),
      new ActionRowBuilder().addComponents(gameModeList),
      new ActionRowBuilder().addComponents(worldTypeList),
      new ActionRowBuilder().addComponents(opConfirmBtn, opCancelBtn),
    ];

    const settingResponse = await interaction.followUp({
      content: "월드 설정",
      components: actionRows,
    });

    const worldSettings = {
      difficulty: null,
      gameMode: null,
      "level-type": null,
      op: null,
    };

    /** 상호작용하는 유저가 동일한지 확인 */
    const filter = (i) => i.user.id === interaction.user.id;

    const settingCollector = settingResponse.createMessageComponentCollector({
      filter: filter,
      time: 180000, // 3min
    });

    settingCollector.on("collect", async (i) => {
      if (i.isStringSelectMenu()) {
        if (i.customId === "difficultySelect") {
          worldSettings.difficulty = i.values[0];
        } else if (i.customId === "gameModeSelect") {
          worldSettings.gameMode = i.values[0];
        } else if (i.customId === "levelTypeSelect") {
          worldSettings["level-type"] = i.values[0];
        }
      } else if (i.isButton()) {
        worldSettings.op = i.customId === "opConfirm";
      }

      // 모든 설정이 완료되었는지 확인
      if (
        worldSettings.difficulty &&
        worldSettings.gameMode &&
        worldSettings["level-type"] &&
        worldSettings.op !== null
      ) {
        console.log(worldSettings);
        await i.update({
          content: "월드 설정이 완료되었습니다.",
          components: [],
        });
        settingCollector.stop("manual");
      } else {
        await i.deferUpdate();
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

    settingCollector.on("end", async (collected, reason) => {
      console.log("reason:", reason);

      if (reason !== "manual") {
        await settingResponse.edit({
          content:
            "시간이 초과되었습니다.\n(선택을 안한 나머지는 기본 설정으로 조정)",
          components: [],
        });
      }

      worldSettings.difficulty = worldSettings.difficulty ?? "hard";
      worldSettings.gameMode = worldSettings.gameMode ?? "survival";
      worldSettings.op = worldSettings.op ?? false;
      worldSettings["level-type"] = worldSettings["level-type"] ?? "normal";

      // 월드 설정을 json파일에 저장
      await worldSetting.updateWorldSettings(worldName, worldSettings);

      if (await isServerRunning()) {
        // 월드가 실행 중이니 선택한 월드로 변경할 수 없음
        console.log("서버 실행 중");
        await interaction.followUp(
          "서버가 실행 중이므로 선택한 월드로 변경할 수 없습니다.\n서버를 재시작한 후 수동으로 변경해주세요.",
        );
        return;
      }

      selectResponse = await interaction.followUp({
        content: "선택한 월드로 변경하시겠습니까?",
        components: [row],
      });

      selectCollector = selectResponse.createMessageComponentCollector({
        filter: filter,
        time: 180000, // 3min
      });

      selectCollector.on("collect", async (i) => {
        if (i.isButton()) {
          if (i.customId === "setLastWorld") {
            await changeWorld(config.lastWorld, worldName);

            await ServerSetting.updateServerProperties({
              difficulty: worldSettings.difficulty,
              gameMode: worldSettings.gameMode,
              "level-type": worldSettings["level-type"],
            });

            if (worldSettings.op === true) {
              await giveOp();
            }

            await i.update({
              content: `선택된 월드: **${config.lastWorld}** -> **${worldName}**`,
              components: [],
            });

            await updateLastWorld(worldName);
          } else {
            await i.update({
              content: "월드 변경이 취소되었습니다.",
              components: [],
            });
          }

          selectCollector.stop("manual");
        }
      });

      selectCollector.on("end", async (i, reason) => {
        if (reason === "manual") return;
        await selectResponse.edit({
          content: "시간이 초과되었습니다.",
          components: [],
        });
      });
    });
  },
};
