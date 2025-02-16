import { SlashCommandBuilder, ChannelType } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("further")
		.setDescription("Replies with your input!")
		.addStringOption((option) =>
			option
				.setName("input")
				.setDescription("Max length is 2000")
				// Ensure the text will fit in an embed description, if the user chooses that option
				.setMaxLength(2000)
		)
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription("Set the channel type")
				// Ensure the user can only select a TextChannel for output
				.addChannelTypes(ChannelType.GuildText)
		),
	async execute(interaction) {
		const content =
			"String 옵션은 최소 최대 길이 설정\nInteger 옵션은 최소 최대 수 설정\nChannel 옵션은 체널 타입(채팅방, 통화방 등등) 설정";

		interaction.reply(content);
	},
};
