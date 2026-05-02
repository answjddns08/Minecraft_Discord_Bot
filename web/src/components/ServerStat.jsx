import { useState } from "react";
import "./serverStat.css";

const Running = "작동 중";
const Stopped = "사망";

function ServerStat() {
	const [serverStatus, setServerStatus] = useState(Running);

	function toggleServerStatus() {
		setServerStatus((prevStatus) =>
			prevStatus === Running ? Stopped : Running,
		);
	}

	return (
		<div className="serverStat">
			<h2>마크 서버: {serverStatus}</h2>
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
