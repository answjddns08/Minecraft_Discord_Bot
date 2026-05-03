import ServerStat from "../components/ServerStat";
import Players from "../components/Players";
import JiDo from "../components/Jido";

function Overview() {
	return (
		<>
			<ServerStat />
			<Players />
			<JiDo />
		</>
	);
}

export default Overview;
