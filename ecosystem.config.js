export const apps = [
	{
		name: "minecraft-bot-dev",
		script: "index.js",
		env: {
			NODE_ENV: "development",
		},
		watch: true,
		ignore_watch: ["node_modules", ".git", "*.log"],
		instances: 1,
		exec_mode: "fork",
	},
	{
		name: "minecraft-bot-prod",
		script: "index.js",
		env: {
			NODE_ENV: "production",
		},
		watch: false,
		instances: 1,
		exec_mode: "fork",
		restart_delay: 1000,
		max_restarts: 10,
	},
];
