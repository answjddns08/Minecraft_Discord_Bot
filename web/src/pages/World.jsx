import { useState } from "react";
import "./world.css";

function World() {
	const [serverStatus, setServerStatus] = useState("작동 중");

	return (
		<>
			<div className="world-header">
				<h2>월드 이름</h2>
				<div className="container">
					<h3>플레이어: 0/20</h3>
					<button
						className={serverStatus === "작동 중" ? "OFF" : "ON"}
						onClick={() =>
							setServerStatus(serverStatus === "작동 중" ? "정지" : "작동 중")
						}
					>
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
