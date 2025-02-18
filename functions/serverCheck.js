import { exec } from "child_process";

export const serverCheck = async () => {
	await exec("tmux ls | grep Minecraft_Server", (error, stdout, stderr) => {
		if (error) {
			console.error(`실행 오류: ${error}`);
			return null;
		}

		//세션이 존재하면 true, 존재하지 않으면 false
		return stdout.trim() == "" ? false : true;
	});
};
