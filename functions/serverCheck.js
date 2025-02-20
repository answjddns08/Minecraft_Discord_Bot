import { exec } from "child_process";
import config from "../config.json" assert { type: "json" };

const serverCheck = async () => {
	await exec(
		`tmux attach -t ${config.sessionName}`,
		(error, stdout, stderr) => {
			if (
				error !==
				`Error: Command failed: tmux attach -t ${config.sessionName}\nno sessions`
			) {
				//console.error(`실행 오류: ${error}`);
				return null;
			}

			//세션이 존재하면 true, 존재하지 않으면 false
			return stdout.trim() == "" ? false : true;
		}
	);
};

export default serverCheck;
