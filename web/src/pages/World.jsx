import { useEffect, useRef, useState, startTransition } from "react";
import {
	getServerPlayers,
	getServerStatus,
	getWorldProperty,
} from "../lib/minecraftApi.js";
import "./world.css";

function World() {
	const [serverStatus, setServerStatus] = useState("불러오는 중");
	const [worldName, setWorldName] = useState("-");
	const [playerInfo, setPlayerInfo] = useState({ count: 0, max: 0 });
	const [settings, setSettings] = useState({});
	const [logs, setLogs] = useState([]);
	const [logInput, setLogInput] = useState("");
	const [wsStatus, setWsStatus] = useState("연결 중");
	const [error, setError] = useState("");
	const websocketRef = useRef(null);

	useEffect(() => {
		let mounted = true;
		let websocket = null;

		async function loadWorld() {
			try {
				const [status, players, property] = await Promise.all([
					getServerStatus(),
					getServerPlayers(),
					getWorldProperty(),
				]);

				if (!mounted) {
					return;
				}

				startTransition(() => {
					setServerStatus(status.isRunning ? "작동 중" : "정지");
					setWorldName(property.world || status.newWorld || "-");
					setPlayerInfo({
						count: players.count ?? 0,
						max: players.max ?? 0,
					});
					setSettings(property.settings || {});
				});
			} catch (loadError) {
				if (!mounted) {
					return;
				}

				setError(loadError.message || "월드 정보를 불러오지 못했습니다.");
			}
		}

		void loadWorld();

		const websocketBase =
			import.meta.env.VITE_WS_BASE_URL ||
			(import.meta.env.VITE_API_BASE_URL
				? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
				: `${window.location.protocol}//${window.location.hostname}:9009`);

		try {
			websocket = new WebSocket(`${websocketBase}/ws`);
			websocketRef.current = websocket;

			websocket.addEventListener("open", () => {
				if (mounted) {
					setWsStatus("연결됨");
				}
			});

			websocket.addEventListener("message", (event) => {
				if (!mounted) {
					return;
				}

				try {
					const payload = JSON.parse(event.data);

					if (payload.type === "log") {
						setLogs((prevLogs) => [
							...prevLogs,
							`[${payload.source}] ${payload.message}`,
						]);
						return;
					}

					if (payload.type === "log-status") {
						setLogs((prevLogs) => [...prevLogs, payload.message]);
						return;
					}

					if (payload.type === "rcon-response") {
						setLogs((prevLogs) => [
							...prevLogs,
							`> ${payload.command}`,
							payload.response || "[no response]",
						]);
						return;
					}

					if (payload.type === "rcon-error") {
						setLogs((prevLogs) => [
							...prevLogs,
							`> ${payload.command}`,
							`[error] ${payload.error}`,
						]);
						return;
					}

					if (payload.type === "hello") {
						return;
					}

					setLogs((prevLogs) => [...prevLogs, event.data]);
				} catch {
					setLogs((prevLogs) => [...prevLogs, String(event.data)]);
				}
			});

			websocket.addEventListener("close", () => {
				if (mounted) {
					setWsStatus("연결 끊김");
				}
			});

			websocket.addEventListener("error", () => {
				if (mounted) {
					setWsStatus("연결 실패");
				}
			});
		} catch {
			if (mounted) {
				setWsStatus("연결 실패");
			}
		}

		return () => {
			mounted = false;
			if (websocket) {
				websocket.close();
			}
			websocketRef.current = null;
		};
	}, []);

	function sendLogCommand(event) {
		event.preventDefault();

		const trimmed = logInput.trim();
		if (!trimmed) {
			return;
		}

		const websocketBase =
			import.meta.env.VITE_WS_BASE_URL ||
			(import.meta.env.VITE_API_BASE_URL
				? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
				: `${window.location.protocol}//${window.location.hostname}:9009`);

		setLogs((prevLogs) => [...prevLogs, `> ${trimmed}`]);
		setLogInput("");

		const websocket = websocketRef.current;

		if (!websocket || websocket.readyState !== WebSocket.OPEN) {
			setLogs((prevLogs) => [
				...prevLogs,
				"[error] 웹소켓 연결에 실패했습니다.",
			]);
			return;
		}

		websocket.send(JSON.stringify({ command: trimmed }));
	}

	const propertyItems = [
		{ label: "난이도", value: settings.difficulty || "-" },
		{ label: "게임 모드", value: settings.gameMode || "-" },
		{ label: "지형", value: settings["level-type"] || "-" },
		{ label: "OP 여부", value: settings.op ? "예" : "아니오" },
	];

	return (
		<>
			<div className="world-header">
				<h2>{worldName}</h2>
				<div className="container">
					<h3>
						플레이어: {playerInfo.count}/{playerInfo.max}
					</h3>
					<button className={serverStatus === "작동 중" ? "OFF" : "ON"}>
						{serverStatus !== "작동 중" ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 640 640"
								width="32"
								height="32"
							>
								<path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" />
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 640 640"
								width="32"
								height="32"
							>
								<path d="M160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96z" />
							</svg>
						)}
					</button>
					{/* 나중에 서버 켜져 있으면 정지 버튼,
					꺼져 있으면 실행 버튼으로 바뀌도록 동작해야 함 */}
				</div>
			</div>
			<div className="property">
				<h1>server property</h1>
				{error ? (
					<p style={{ color: "#dc3545", textAlign: "left" }}>{error}</p>
				) : null}
				{propertyItems.map((item) => (
					<div key={item.label}>
						<p>{item.label}:</p>
						<p>{item.value}</p>
					</div>
				))}
			</div>
			<div className="log">
				<h1>server log</h1>
				<div className="log-content">
					{logs.length > 0 ? (
						logs.map((line, index) => (
							<div key={`${index}-${line}`}>{line}</div>
						))
					) : (
						<div>서버 로그가 여기에 표시됩니다.</div>
					)}
				</div>
				<form
					className="log-input-row"
					onSubmit={(event) => sendLogCommand(event)}
				>
					<input
						type="text"
						value={logInput}
						onChange={(event) => setLogInput(event.target.value)}
						placeholder="명령어를 입력하고 Enter 또는 전송을 누르세요"
					/>
					<button type="submit">전송</button>
				</form>
				<p style={{ marginTop: 10, textAlign: "left" }}>
					웹소켓 상태: {wsStatus}
				</p>
			</div>
		</>
	);
}

export default World;
