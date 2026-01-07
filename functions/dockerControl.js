import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

/**
 * Minecraft 서버 컨테이너 시작
 * @param {string} worldName - 월드 이름
 * @param {string} mcVersion - 마인크래프트 버전 (기본값: LATEST)
 * @returns {Promise<void>}
 */
export async function startMinecraftServer(worldName, mcVersion = "LATEST") {
	const containerName = "minecraft-server";

	try {
		// 기존 컨테이너가 있는지 확인
		let container;
		try {
			container = docker.getContainer(containerName);
			const info = await container.inspect();

			// 컨테이너가 실행 중이면 그냥 반환
			if (info.State.Running) {
				console.log(`[Docker] 컨테이너가 이미 실행 중입니다.`);
				return;
			}

			// 컨테이너가 있지만 중지된 상태면 제거
			console.log(`[Docker] 중지된 컨테이너를 제거합니다.`);
			await container.remove({ force: true });
		} catch (err) {
			// 컨테이너가 없으면 정상
			console.log(`[Docker] 새 컨테이너를 생성합니다.`);
		}

		// 네트워크 확인 및 생성
		const networkName = "mc_bot_minecraft-network";
		try {
			await docker.getNetwork(networkName).inspect();
		} catch (err) {
			console.log(`[Docker] 네트워크 생성: ${networkName}`);
			await docker.createNetwork({ Name: networkName });
		}

		// 새 컨테이너 생성 및 시작
		console.log(`[Docker] 컨테이너 생성 중...`);
		const newContainer = await docker.createContainer({
			Image: "mc_bot-minecraft-server:latest",
			name: containerName,
			Env: [
				`VERSION=${mcVersion}`,
				`LEVEL=${worldName}`,
				`MEMORY=2G`,
				`EULA=true`,
			],
			HostConfig: {
				RestartPolicy: { Name: "no" },
				PortBindings: {
					"25565/tcp": [{ HostPort: "25565" }],
					"25575/tcp": [{ HostPort: "25575" }],
				},
				Binds: [
					"/home/redeyes/Documents/mc-data/server:/data",
					"/home/redeyes/Documents/MC_bot/worldSettings.json:/config/worldSettings.json:ro",
				],
				NetworkMode: networkName,
				Memory: 3 * 1024 * 1024 * 1024, // 3GB
				NanoCpus: 3 * 1000000000, // 3 CPU
			},
		});

		console.log(`[Docker] 컨테이너 시작 중...`);
		await newContainer.start();
		console.log(`[Docker] 컨테이너 시작 완료!`);
	} catch (error) {
		console.error(`[Docker] 컨테이너 시작 실패:`, error);
		throw error;
	}
}

/**
 * Minecraft 서버 컨테이너 중지 및 제거
 * @returns {Promise<void>}
 */
export async function stopMinecraftServer() {
	const containerName = "minecraft-server";

	try {
		const container = docker.getContainer(containerName);

		// 컨테이너 정보 확인
		const info = await container.inspect();

		if (info.State.Running) {
			console.log(`[Docker] 컨테이너 중지 중...`);
			await container.stop({ t: 30 }); // 30초 타임아웃
		}

		console.log(`[Docker] 컨테이너 제거 중...`);
		await container.remove({ force: true });
		console.log(`[Docker] 컨테이너 제거 완료!`);
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
export async function isMinecraftServerRunning() {
	const containerName = "minecraft-server";

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
