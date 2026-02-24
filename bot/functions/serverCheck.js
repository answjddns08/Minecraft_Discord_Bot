import { exec } from "child_process";
import config from "../config/config.json" with { type: "json" };
import { isMinecraftServerRunning } from "./dockerControl.js";

async function serverCheck() {
	try {
		// Docker 환경인지 확인 (환경 변수로 판단)
		const isDocker = process.env.DOCKER_ENV === "true";

		if (isDocker) {
			// Docker 환경: Docker API를 통해 컨테이너 상태 확인
			return await isMinecraftServerRunning();
		} else {
			// 로컬 환경: tmux 세션 확인
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
					},
				);
			});
		}
	} catch (error) {
		console.error(`[serverCheck] 오류:`, error);
		return null;
	}
}

export default serverCheck;
