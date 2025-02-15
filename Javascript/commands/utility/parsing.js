import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("parsing")
		.setDescription("command option parsing!")
		.addStringOption((option) =>
			option.setName("input").setDescription("input something!")
		),
	async execute(interaction) {
		// ??는 null을 감지하는 문법, null이면 "nothing", 아니면 interaction에서 받은 값 그대로

		const input = (await interaction.options.getString("input")) ?? "nothing";

		await interaction.reply("the input is " + input);
		await interaction.followUp("also subcommands are applied");
	},
};
