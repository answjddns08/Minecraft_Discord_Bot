import "./trash.css";

function Trash() {
	return (
		<>
			<div className="trash-list">
				<h2>trash list</h2>
				<section className="trash-item">
					<h4>아모른직다</h4>
					<p>일반</p>
					<button>복구</button>
				</section>
				<section className="trash-item">
					<h4>아모른직다</h4>
					<p>건축</p>
					<button>복구</button>
				</section>
				<section className="trash-item">
					<h4>아모른직다</h4>
					<p>모험</p>
					<button>복구</button>
				</section>
				<section className="trash-item">
					<h4>아모른직다</h4>
					<p>일반</p>
					<button>복구</button>
				</section>
			</div>
		</>
	);
}

export default Trash;
