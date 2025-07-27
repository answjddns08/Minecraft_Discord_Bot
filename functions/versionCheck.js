import { exec } from "child_process";
import config from "../config.json" with { type: "json" };

/**
 * Checks the server version by finding a jar file in the Minecraft directory.
 * @returns {Promise<{server: string, version: string}>} - Returns an object containing the server and version.
 */
function checkServerVersion() {
	return new Promise((resolve, reject) => {
		exec(`find ${config.minecraftDir}/*.jar`, (error, stdout, stderr) => {
			if (error) {
				reject(`Error: ${error.message}`);
				return;
			}
			if (stderr) {
				reject(`Stderr: ${stderr}`);
				return;
			}

			//stdout example: "/path/to/paper-1.21.6-48.jar"

			const jarFile = stdout.trim().split("/").pop(); // Get the last line (ex: paper-1.21.6-48.jar)

			const server = jarFile.split("-")[0] || ""; // Extract the server (ex: paper)
			const version = jarFile.split("-")[1] || ""; // Extract the version (ex: 1.21.6)

			resolve({ server, version });
		});
	});
}

export default checkServerVersion;
