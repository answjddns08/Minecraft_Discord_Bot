import { useState } from "react";
import "./maps.css";

function Maps() {
	const [selectedMap, setSelectedMap] = useState("아모른직다");
	const [modalOpen, setModalOpen] = useState(false);

	const maps = [
		{ name: "아모른직다1", type: "일반" },
		{ name: "아모른직다2", type: "일반" },
		{ name: "아모른직다3", type: "일반" },
	];

	return (
		<>
			<div className="maps-header">
				<h3>선택된 월드: {selectedMap}</h3>
				<button onClick={() => setModalOpen(true)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 640 640"
						width="35"
						height="35"
					>
						<path
							fill="rgb(255, 255, 255)"
							d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"
						/>
					</svg>
					새로 만들기
				</button>
			</div>
			<div className="maps-list">
				<h2>map list</h2>
				{maps.map((map) => (
					<section key={map.name} className="maps-item">
						<h4>{map.name}</h4>
						<p>{map.type}</p>
						<button
							className={
								selectedMap === map.name ? "btn-select selected" : "btn-select"
							}
							onClick={() => setSelectedMap(map.name)}
						>
							선택
						</button>
						<button className="btn-delete">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 640 640"
								width="35"
								height="35"
							>
								<path
									fill="rgb(255, 255, 255)"
									d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"
								/>
							</svg>
						</button>
					</section>
				))}
			</div>

			{modalOpen && (
				<div className="modal-background">
					<div className="modal-content">
						<h2>새 월드 만들기</h2>
						<form>
							<p>월드 이름</p>
							<input type="text" placeholder="월드 이름" />
						</form>
						<form>
							<p>월드 난이도</p>
							<select>
								<option value="peaceful">평화로움</option>
								<option value="easy">쉬움</option>
								<option value="normal">보통</option>
								<option value="hard">어려움</option>
							</select>
						</form>
						<form>
							<p>게임 모드</p>
							<select>
								<option value="survival">야생</option>
								<option value="creative">크리에이티브</option>
								<option value="adventure">모험</option>
							</select>
						</form>
						<form>
							<p>지형 설정</p>
							<select>
								<option value="minecraft:normal">기본</option>
								<option value="minecraft:flat">평지</option>
								<option value="minecraft:largeBiomes">대형 바이옴</option>
								<option value="minecraft:amplified">높이 증폭</option>
							</select>
						</form>
						<form
							style={{
								display: "flex",
								alignItems: "center",
								flexDirection: "row",
								gap: "10px",
								width: "100%",
							}}
						>
							<p>op 여부</p>
							<input style={{ marginLeft: "auto" }} type="checkbox" />
						</form>
						<div className="btn-area">
							<button
								className="submit"
								type="submit"
								onClick={() => setModalOpen(false)}
							>
								생성
							</button>
							<button
								className="cancel"
								type="button"
								onClick={() => setModalOpen(false)}
							>
								취소
							</button>
						</div>
						<div className="drag-and-drop">zip파일 드래그 앤 드롭</div>
					</div>
				</div>
			)}
		</>
	);
}

export default Maps;
