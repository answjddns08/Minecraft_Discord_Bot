import { Events, MessageFlags } from "discord.js";

/**
 * 나중에 if문 여러개를 만들어서
 * 각 버튼이나 선택 메뉴에 대한 상호작용에 대한 코드추가할 수 있음
 * 특정 메세지나 한정된 상황이 아니라 봇 전체의 모든 버튼,메뉴 등의 처리 가능해짐
 *
 * 일시적인 상호작용에 적합한 Collector와 달리
 * 영구적인 상호작용에 유용
 */

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`
			);
			return;
		}

		//autocomplete가 있는 경우 autocomplete 실행
		if (interaction.isAutocomplete()) {
			try {
				await command.autocomplete(interaction);
			} catch (error) {
				console.error(error);
			}
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: "There was an error while executing this command!",
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: "There was an error while executing this command!",
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	},
};
