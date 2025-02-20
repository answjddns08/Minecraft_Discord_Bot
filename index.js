import { config } from "dotenv";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client, GatewayIntentBits, Collection } from "discord.js";

config({ path: ".env" });

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "commands");
const commandFolders = await fs.readdir(foldersPath);

// commands폴더에 있는 파일을 읽고 client.commands에 저장
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

// events폴더에 있는 파일을 읽고 client에 이벤트 등록
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

client.login(process.env.testbot);
