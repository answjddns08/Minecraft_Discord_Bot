import { Events, MessageFlags } from "discord.js";

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
