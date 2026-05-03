import "./world.css";

function World() {
	return (
		<>
			<div className="world-header">
				<h2>월드 이름</h2>
				<div className="container">
					<h3>플레이어: 0/20</h3>
					<button>접속하기</button>
					{/* 나중에 서버 켜져 있으면 정지 버튼,
					꺼져 있으면 실행 버튼으로 바뀌도록 동작해야 함 */}
				</div>
			</div>
			<div className="property">
				<h1>server property</h1>

				<div>
					<p>난이도:</p>
					<p>어려움</p>
				</div>
				<div>
					<p>게임 모드:</p>
					<p>서바이벌</p>
				</div>
				<div>
					<p>지형:</p>
					<p>일반</p>
				</div>
				<div>
					<p>OP 여부:</p>
					<p>예</p>
				</div>
			</div>
			<div className="log">
				<h1>server log</h1>
				<div className="log-content">
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
					eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
					minim veniam, quis nostrud exercitation ullamco laboris nisi ut
					aliquip ex ea commodo consequat. Duis aute irure dolor in
					reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
					pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
					culpa qui officia deserunt mollit anim id est laborum."
					<br />
					<br />
					"Sed ut perspiciatis unde omnis iste natus error sit voluptatem
					accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
					ab illo inventore veritatis et quasi architecto beatae vitae dicta
					sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
					aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
					qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui
					dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
					quia non numquam eius modi tempora incidunt ut labore et dolore magnam
					aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
					exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex
					ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in
					ea voluptate velit esse quam nihil molestiae consequatur, vel illum
					qui dolorem eum fugiat quo voluptas nulla pariatur?"
				</div>
			</div>
		</>
	);
}

export default World;
