import ServerStat from "../components/ServerStat";
import Players from "../components/Players";

function Overview() {
	return (
		<div>
			<h1>Overview</h1>
			<ServerStat />
			<Players />
		</div>
	);
}

export default Overview;
