import { exec } from "child_process";
import config from "../config.json" with { type: "json" };

function serverCheck() {
	return new Promise((resolve, reject) => {
		// Docker 환경인지 확인 (환경 변수로 판단)
		const isDocker = process.env.DOCKER_ENV === "true";

		if (isDocker) {
			// Docker 환경: 컨테이너 상태 확인
			exec(
				`docker inspect -f '{{.State.Running}}' minecraft-server`,
				(error, stdout, stderr) => {
					if (error) {
						resolve(null);
					} else {
						resolve(stdout.trim() === "true");
					}
				}
			);
		} else {
			// 로컬 환경: tmux 세션 확인
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
		}
	});
}

export default serverCheck;
