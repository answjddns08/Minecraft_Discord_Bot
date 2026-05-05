import { useEffect, useState, startTransition } from "react";
import { getServerPlayers } from "../lib/minecraftApi.js";
import "./players.css";

function Players() {
	const [players, setPlayers] = useState([]);
	const [count, setCount] = useState(0);
	const [max, setMax] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let mounted = true;

		async function loadPlayers() {
			try {
				const data = await getServerPlayers();
				if (!mounted) {
					return;
				}

				startTransition(() => {
					setPlayers(data.players || []);
					setCount(data.count ?? 0);
					setMax(data.max ?? 0);
				});
			} catch (loadError) {
				if (!mounted) {
					return;
				}

				setError(loadError.message || "플레이어 목록을 불러오지 못했습니다.");
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}

		void loadPlayers();

		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div className="players">
			<div className="players-header">
				<h2>Players</h2>
				<h2>{loading ? "..." : `${count}/${max}`}</h2>
			</div>
			{error ? (
				<p style={{ color: "#dc3545", textAlign: "left" }}>{error}</p>
			) : null}
			<ul>
				{players.length > 0 ? (
					players.map((player) => <li key={player}>{player}</li>)
				) : (
					<li>접속한 플레이어가 없습니다.</li>
				)}
			</ul>
		</div>
	);
}

export default Players;
