import "./JiDo.css";

function JiDo() {
	const isSiteAvailable = false; // 나중에 실제 사이트가 준비되면 true로 변경
	// 추가로 나중에 iframe 달아야 함

	return (
		<div className="JiDo">
			<h1>지도</h1>
			{isSiteAvailable ? (
				<p>지도 사이트</p>
			) : (
				<p>월드가 꺼져 있거나 지도 사이트가 죽었나 보네요</p>
			)}
		</div>
	);
}

export default JiDo;
