import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const containerName = process.env.CONTAINER_NAME || "minecraft-server";

/**
 * Minecraft 서버 컨테이너 시작
 * @param {string} worldName - 월드 이름
 * @param {string} mcVersion - 마인크래프트 버전 (기본값: LATEST)
 * @returns {Promise<void>}
 */
export async function startMinecraftServer(worldName, mcVersion = "LATEST") {
	try {
		const container = docker.getContainer(containerName);
		const info = await container.inspect();

		if (info.State.Running) {
			console.log(`[Docker] 컨테이너가 이미 실행 중입니다.`);
			return;
		}

		console.log(
			`[Docker] 컨테이너 시작 중... (월드: ${worldName}, 버전: ${mcVersion})`,
		);
		await container.start();
		console.log(`[Docker] 컨테이너 시작 완료!`);
	} catch (error) {
		if (error.statusCode === 404) {
			console.error(
				`[Docker] 컨테이너를 찾을 수 없습니다. docker compose up -d minecraft를 먼저 실행하세요.`,
			);
		}
		console.error(`[Docker] 컨테이너 시작 실패:`, error);
		throw error;
	}
}

/**
 * Minecraft 서버 컨테이너 중지 및 제거
 * @returns {Promise<void>}
 */
export async function stopMinecraftServer() {
	try {
		const container = docker.getContainer(containerName);

		// 컨테이너 정보 확인
		const info = await container.inspect();

		if (info.State.Running) {
			console.log(`[Docker] 컨테이너 중지 중...`);
			await container.stop({ t: 30 }); // 30초 타임아웃
		}

		console.log(`[Docker] 컨테이너 중지 완료!`);
	} catch (error) {
		if (error.statusCode === 404) {
			console.log(`[Docker] 컨테이너가 존재하지 않습니다.`);
			return;
		}
		console.error(`[Docker] 컨테이너 중지/제거 실패:`, error);
		throw error;
	}
}

/**
 * Minecraft 서버 컨테이너 상태 확인
 * @returns {Promise<boolean>} - 실행 중이면 true, 아니면 false
 */
export async function isServerRunning() {
	try {
		const container = docker.getContainer(containerName);
		const info = await container.inspect();
		return info.State.Running;
	} catch (error) {
		if (error.statusCode === 404) {
			return false;
		}
		console.error(`[Docker] 컨테이너 상태 확인 실패:`, error);
		return false;
	}
}
