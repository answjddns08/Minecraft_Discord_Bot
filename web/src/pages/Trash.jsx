import { useEffect, useState } from "react";
import { listTrashWorlds, restoreWorld } from "../lib/minecraftApi.js";
import "./trash.css";

function Trash() {
	const [trashWorlds, setTrashWorlds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	async function loadTrash() {
		setLoading(true);
		setError("");

		try {
			const data = await listTrashWorlds();
			setTrashWorlds(data || []);
		} catch (loadError) {
			setError(loadError.message || "휴지통 목록을 불러오지 못했습니다.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadTrash();
	}, []);

	async function handleRestore(name) {
		setError("");

		try {
			await restoreWorld(name);
			await loadTrash();
		} catch (restoreError) {
			setError(restoreError.message || "월드 복구에 실패했습니다.");
		}
	}

	return (
		<>
			<div className="trash-list">
				<h2>trash list</h2>
				{error ? (
					<p style={{ color: "#dc3545", width: "85%", textAlign: "left" }}>
						{error}
					</p>
				) : null}
				{loading ? <p>불러오는 중...</p> : null}
				{trashWorlds.length === 0 && !loading ? (
					<p>휴지통이 비어 있습니다.</p>
				) : null}
				{trashWorlds.map((world) => (
					<section key={world.name} className="trash-item">
						<h4>{world.name}</h4>
						<p>{world.daysLeft}일 남음</p>
						<button onClick={() => void handleRestore(world.name)}>복구</button>
					</section>
				))}
			</div>
		</>
	);
}

export default Trash;
