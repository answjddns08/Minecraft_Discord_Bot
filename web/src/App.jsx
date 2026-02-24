import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWebSocketStore } from "./services/websocket";
import ServerStatus from "./components/ServerStatus";
import ServerControls from "./components/ServerControls";
import WorldList from "./components/WorldList";

const queryClient = new QueryClient();

function App() {
	const { connected, connect } = useWebSocketStore();

	useEffect(() => {
		connect();
	}, [connect]);

	return (
		<QueryClientProvider client={queryClient}>
			<div className="min-h-screen bg-gray-900 text-white p-8">
				<div className="max-w-7xl mx-auto">
					<header className="mb-8">
						<h1 className="text-4xl font-bold mb-2">
							Minecraft Server Manager
						</h1>
						<div className="flex items-center gap-2 text-sm">
							<span className="text-gray-400">WebSocket:</span>
							<span
								className={`px-2 py-1 rounded text-xs font-semibold ${
									connected ? "bg-green-600" : "bg-red-600"
								}`}
							>
								{connected ? "Connected" : "Disconnected"}
							</span>
						</div>
					</header>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
						<ServerStatus />
						<ServerControls />
					</div>

					<WorldList />
				</div>
			</div>
		</QueryClientProvider>
	);
}

export default App;
