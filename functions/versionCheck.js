import { exec } from "child_process";
import config from "../config.json" with { type: "json" };

/**
 * Checks the server version by finding a jar file in the Minecraft directory.
 * @returns {Promise<{server: string, version: string}>} - Returns an object containing the server and version.
 */
function checkServerVersion() {
	return new Promise((resolve, reject) => {
		// Docker 환경에서는 /data 디렉토리 사용
		const searchDir =
			process.env.DOCKER_ENV === "true" ? "/data" : config.minecraftDir;
		exec(
			`find ${searchDir} -maxdepth 1 -name "*.jar"`,
			(error, stdout, stderr) => {
				if (error) {
					resolve({ server: "", version: "" }); // 에러 시 빈 값 반환
					return;
				}
				if (stderr || !stdout.trim()) {
					resolve({ server: "", version: "" });
					return;
				}

				//stdout example: "/path/to/paper-1.21.6-48.jar"

				const jarFile = stdout.trim().split("/").pop(); // Get the last line (ex: paper-1.21.6-48.jar)

				const server = jarFile.split("-")[0] || ""; // Extract the server (ex: paper)
				const version = jarFile.split("-")[1] || ""; // Extract the version (ex: 1.21.6)

				resolve({ server, version });
			}
		);
	});
}

export default checkServerVersion;
