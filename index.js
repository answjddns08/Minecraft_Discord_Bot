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
	// 추가 성능 최적화
	allowedMentions: {
		parse: ["users"], // 유저 멘션만 허용 (everyone, here, role 비활성화)
		repliedUser: false, // 답장 시 유저 멘션 비활성화
	},
	// 파일 첨부 크기 제한
	messageCacheMaxSize: 20, // 메시지 캐시 최대 크기
	// memory optimization - cache
	makeCache: Options.cacheWithLimits({
		ChannelManager: 10, // 채널 매니저 캐시 (메시지 작업 시 필요)
		GuildMemberManager: 50, // 길드 멤버 매니저 캐시 제한
		MessageManager: 200, // 메시지 매니저 캐시 제한
		PresenceManager: 10, // 프레즌스 매니저 캐시 비활성화
		ReactionManager: 10, // 리액션 매니저 캐시 비활성화
		UserManager: 100, // 유저 매니저 캐시 제한
	}),
	// memory optimization - sweepers
	sweepers: {
		messages: {
			interval: 1800, // 30분마다 실행
			lifetime: 300, // 5분 이상 된 메시지 제거
		},
		users: {
			interval: 1800, // 30분마다 실행
			filter: () => (user) => user.bot && user.id !== user.client.user.id,
		},
		guildMembers: {
			interval: 1800, // 30분마다 실행
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
const token = process.env.DISCORD_TOKEN;
const botId = process.env.DISCORD_CLIENT_ID;

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
