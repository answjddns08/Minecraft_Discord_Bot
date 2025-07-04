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
	// memory optimization - cache
	makeCache: Options.cacheWithLimits({
		...Options.DefaultMakeCacheSettings,
		MessageManager: 20, // 메시지 캐시를 20개로 제한
		ChannelManager: 50, // 채널 캐시를 50개로 제한
		GuildManager: 5, // 길드 캐시를 5개로 제한
		UserManager: 50, // 유저 캐시를 50개로 제한
		PresenceManager: 0, // Presence 캐시 비활성화
		StageInstanceManager: 0, // Stage Instance 캐시 비활성화
		VoiceStateManager: 0, // Voice State 캐시 비활성화
		GuildScheduledEventManager: 0, // 예약된 이벤트 캐시 비활성화
		ThreadManager: 0, // 스레드 캐시 비활성화
		ThreadMemberManager: 0, // 스레드 멤버 캐시 비활성화
		ReactionManager: 0, // 반응 캐시 비활성화
		ReactionUserManager: 0, // 반응 유저 캐시 비활성화
	}),
	// memory optimization - sweepers
	sweepers: {
		messages: {
			interval: 3600, // 1hour
			lifetime: 300, // remove messages older than 5 minutes
		},
		users: {
			interval: 3600, // 1hour
			filter: () => (user) => user.bot && user.id !== user.client.user.id,
		},
		guildMembers: {
			interval: 3600, // 1hour
			filter: () => (member) => member.id !== member.client.user.id,
		},
	},
	// Partials 비활성화 (필요하지 않은 경우)
	partials: [],
	// REST 최적화
	rest: {
		timeout: 15_000, // 타임아웃을 15초로 단축
		retries: 2, // 재시도 횟수 줄임
	},
});

//discord bot tokens
const token =
	process.env.NODE_ENV === "production"
		? process.env.MinecraftBot
		: process.env.testbot;

const botId =
	process.env.NODE_ENV === "production"
		? process.env.MinecraftBot_id
		: process.env.testbot_id;

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
