import { Events, REST, Routes } from "discord.js";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

config({ path: "../.env" });

const clientId = process.env.testbot_id;
const guildId = "1080485159230509096";
const token = process.env.testbot;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

const foldersPath = path.join(__dirname, "../commands");
const commandFolders = fs.readdirSync(foldersPath);

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		for (const folder of commandFolders) {
			// Grab all the command files from the commands directory you created earlier
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs
				.readdirSync(commandsPath)
				.filter((file) => file.endsWith(".js"));
			// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				const command = await import(filePath);
				if ("data" in command.default && "execute" in command.default) {
					commands.push(command.default.data.toJSON());
				} else {
					console.log(
						`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
					);
				}
			}
		}

		// Construct and prepare an instance of the REST module
		const rest = new REST().setToken(token);

		// and deploy your commands!
		(async () => {
			try {
				console.log(
					`Started refreshing ${commands.length} application (/) commands.`
				);

				/* //길드(서버) 전용 명령어만 할당하려고 전역 명령어를 제거
				const allCommands = await rest.get(
					Routes.applicationCommands(clientId)
				);
				for (const command of allCommands) {
					await rest.delete(Routes.applicationCommand(clientId, command.id));
				} */

				// 특정 길드(서버)에만 명령어 할당
				const data = await rest.put(
					Routes.applicationGuildCommands(clientId, guildId),
					{ body: commands }
				);

				console.log(
					`Successfully reloaded ${data.length} application (/) commands.`
				);
			} catch (error) {
				// And of course, make sure you catch and log any errors!
				console.error(error);
			}
		})();

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
