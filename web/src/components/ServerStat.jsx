import { useEffect, useState, startTransition } from "react";
import {
	getServerStatus,
	startServer,
	stopServer,
} from "../lib/minecraftApi.js";
import "./serverStat.css";

function ServerStat() {
	const [isRunning, setIsRunning] = useState(false);
	const [selectedWorld, setSelectedWorld] = useState("-");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	async function loadStatus() {
		setLoading(true);
		setError("");

		try {
			const status = await getServerStatus();
			startTransition(() => {
				setIsRunning(Boolean(status.isRunning));
				setSelectedWorld(status.newWorld || "-");
			});
		} catch (loadError) {
			setError(loadError.message || "서버 상태를 불러오지 못했습니다.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadStatus();
	}, []);

	async function toggleServerStatus() {
		setError("");

		try {
			if (isRunning) {
				await stopServer();
			} else {
				await startServer();
			}

			await loadStatus();
		} catch (toggleError) {
			setError(toggleError.message || "서버 제어에 실패했습니다.");
		}
	}

	return (
		<div className="serverStat">
			<div className="serverStat-header">
				<h2>마크 서버:</h2>
				<h2 style={{ marginRight: 0 }}>
					{loading ? "불러오는 중" : isRunning ? "작동 중" : "정지"}
				</h2>
			</div>
			<div className="serverStat-header">
				<h3 style={{ margin: 0 }}>선택된 월드:</h3>
				<h3 style={{ margin: 0 }}>{selectedWorld}</h3>
			</div>
			{error ? (
				<p style={{ marginTop: 10, color: "#dc3545", textAlign: "left" }}>
					{error}
				</p>
			) : null}
			<button
				onClick={() => void toggleServerStatus()}
				disabled={loading}
				className={`isOff ${isRunning ? "OFF" : "ON"}`}
			>
				{isRunning ? "OFF" : "ON"}
			</button>
		</div>
	);
}

export default ServerStat;
