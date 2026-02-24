import { useQuery } from "@tanstack/react-query";
import { serverApi } from "../services/api";

export default function ServerStatus() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["serverStatus"],
		queryFn: () => serverApi.getStatus(),
		refetchInterval: 5000, // Refetch every 5 seconds
	});

	const status = data?.data;

	if (isLoading) {
		return (
			<div className="bg-gray-800 rounded-lg p-6 shadow-lg">
				<h2 className="text-2xl font-bold mb-4">Server Status</h2>
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-gray-800 rounded-lg p-6 shadow-lg">
				<h2 className="text-2xl font-bold mb-4">Server Status</h2>
				<p className="text-red-500">Error loading server status</p>
			</div>
		);
	}

	const isOnline = status?.status === "online";

	return (
		<div className="bg-gray-800 rounded-lg p-6 shadow-lg">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">Server Status</h2>
				<button
					onClick={() => refetch()}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
				>
					Refresh
				</button>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-gray-400">Status:</span>
					<span
						className={`px-3 py-1 rounded-full text-sm font-semibold ${
							isOnline ? "bg-green-600" : "bg-red-600"
						}`}
					>
						{isOnline ? "Online" : "Offline"}
					</span>
				</div>

				{status?.serverName && (
					<div className="flex items-center justify-between">
						<span className="text-gray-400">Server Name:</span>
						<span className="font-medium">{status.serverName}</span>
					</div>
				)}

				{status?.version && (
					<div className="flex items-center justify-between">
						<span className="text-gray-400">Version:</span>
						<span className="font-medium">{status.version}</span>
					</div>
				)}

				{isOnline && (
					<div className="flex items-center justify-between">
						<span className="text-gray-400">Players:</span>
						<span className="font-medium">
							{status.players} / {status.maxPlayers}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
