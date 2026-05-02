import { useState } from "react";
import "./serverStat.css";

const Running = "작동 중";
const Stopped = "사망";

function ServerStat() {
	const [serverStatus, setServerStatus] = useState(Running);
	const [selectedWorld, setSelectedWorld] = useState("월드1");

	function toggleServerStatus() {
		setServerStatus((prevStatus) =>
			prevStatus === Running ? Stopped : Running,
		);

		// for test
		setSelectedWorld((prevWorld) =>
			prevWorld === "월드1" ? "월드2" : "월드1",
		);
	}

	return (
		<div className="serverStat">
			<div className="serverStat-header">
				<h2>마크 서버: </h2>
				<h2 style={{ marginRight: 0 }}>{serverStatus}</h2>
			</div>
			<div className="serverStat-header">
				<h3 style={{ margin: 0 }}>선택된 월드: </h3>
				<h3 style={{ margin: 0 }}>{selectedWorld}</h3>
			</div>
			<button
				onClick={toggleServerStatus}
				className={`isOff ${serverStatus === Running ? "OFF" : "ON"}`}
			>
				{serverStatus === Running ? "OFF" : "ON"}
			</button>
		</div>
	);
}

export default ServerStat;
