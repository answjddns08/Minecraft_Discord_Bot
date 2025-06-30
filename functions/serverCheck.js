import { exec } from "child_process";
import config from "../config.json" with { type: "json" };

function serverCheck() {
	return new Promise((resolve, reject) => {
		exec(
			`tmux has-session -t ${config.sessionName}`,
			(error, stdout, stderr) => {
				if (error) {
					if (error.code === 1) {
						resolve(false);
					} else {
						resolve(null);
					}
				} else {
					resolve(true);
				}
			}
		);
	});
}

export default serverCheck;
