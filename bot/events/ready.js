import { Events, REST, Routes } from "discord.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Docker 환경에서는 환경 변수가 이미 주입되어 있으므로 dotenv 불필요
const token = process.env.DISCORD_TOKEN;
const botID = process.env.DISCORD_CLIENT_ID;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

const foldersPath = path.join(__dirname, "../commands");
const commandFolders = await fs.readdir(foldersPath);

export default {
	name: Events.ClientReady,
	once: true,
	/**
	 * @param {import("discord.js").Client} client
	 */
	async execute(client) {
		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = (await fs.readdir(commandsPath)).filter((file) =>
				file.endsWith(".js"),
			);
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				const command = await import(filePath);
				if ("data" in command.default && "execute" in command.default) {
					commands.push(command.default.data.toJSON());
				} else {
					console.log(
						`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
					);
				}
			}
		}

		const rest = new REST().setToken(token);

		(async () => {
			try {
				console.log(
					`Started refreshing ${commands.length} application (/) commands.`,
				);

				/**
				 * @type {import("discord.js").RESTPostAPIApplicationCommandsJSONBody[]}
				 * @description This is the array of commands to be registered.
				 */
				let data;

				// remove all commands (prevents conflicts with guild commands)
				const allCommands = await rest.get(Routes.applicationCommands(botID));
				for (const command of allCommands) {
					await rest.delete(Routes.applicationCommand(botID, command.id));
				}

				data = await rest.put(Routes.applicationCommands(botID), {
					body: commands,
				});

				console.log(
					`Successfully reloaded ${data.length} application (/) commands.`,
				);
			} catch (error) {
				console.error(error);
			}
		})();

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
