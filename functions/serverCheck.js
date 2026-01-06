import { exec } from "child_process";
import config from "../config.json" with { type: "json" };

function serverCheck() {
	return new Promise((resolve, reject) => {
		// Docker 환경인지 확인 (환경 변수로 판단)
		const isDocker = process.env.DOCKER_ENV === "true";

		if (isDocker) {
			// Docker 환경: 컨테이너 상태 확인
			exec(
				`docker inspect -f '{{.State.Running}}' minecraft-server 2>/dev/null`,
				(error, stdout, stderr) => {
					if (error) {
						// 컨테이너가 존재하지 않음 (정상 - 서버가 꺼진 상태)
						if (error.code === 1) {
							resolve(false);
						} else {
							// 실제 오류
							console.error(`[serverCheck] Docker 오류: ${error.message}`);
							resolve(null);
						}
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
