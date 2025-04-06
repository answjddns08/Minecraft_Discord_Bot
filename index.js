import { config } from "dotenv";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client, GatewayIntentBits, Collection, Options } from "discord.js";

config({ path: ".env" });

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	makeCache: Options.cacheWithLimits(Options.DefaultMakeCacheSettings),
	sweepers: {
		...Options.DefaultSweeperSettings,
		messages: {
			interval: 3_600, // Every hour.
			lifetime: 1_800, // Remove messages older than 30 minutes.
		},
		users: {
			interval: 3_600, // Every hour.
			filter: () => (user) => user.bot && user.id !== user.client.user.id, // Remove all bots.
		},
	},
});

//discord bot token
const token = process.env.testbot;

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "commands");
const commandFolders = await fs.readdir(foldersPath);

// read files in commands folder and save to client.commands
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = (await fs.readdir(commandsPath)).filter((file) =>
		file.endsWith(".js")
	);
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(filePath);
		if ("data" in command.default && "execute" in command.default) {
			client.commands.set(command.default.data.name, command.default);
			console.log(`completely set the ${filePath} file!`);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = (await fs.readdir(eventsPath)).filter((file) =>
	file.endsWith(".js")
);

// read files in events folder and register to client
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = await import(filePath);
	if (event.once) {
		client.once(event.default.name, (...args) =>
			event.default.execute(...args)
		);
	} else {
		client.on(event.default.name, (...args) => event.default.execute(...args));
	}
}

client.login(token);
