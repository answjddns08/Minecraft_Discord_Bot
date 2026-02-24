import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serverApi } from "../services/api";

export default function ServerControls() {
	const queryClient = useQueryClient();

	const startMutation = useMutation({
		mutationFn: serverApi.start,
		onSuccess: () => {
			queryClient.invalidateQueries(["serverStatus"]);
			alert("Server is starting...");
		},
		onError: (error) => {
			alert(
				`Failed to start server: ${error.response?.data?.message || error.message}`,
			);
		},
	});

	const stopMutation = useMutation({
		mutationFn: serverApi.stop,
		onSuccess: () => {
			queryClient.invalidateQueries(["serverStatus"]);
			alert("Server is stopping...");
		},
		onError: (error) => {
			alert(
				`Failed to stop server: ${error.response?.data?.message || error.message}`,
			);
		},
	});

	return (
		<div className="bg-gray-800 rounded-lg p-6 shadow-lg">
			<h2 className="text-2xl font-bold mb-4">Server Controls</h2>

			<div className="flex gap-4">
				<button
					onClick={() => startMutation.mutate()}
					disabled={startMutation.isPending}
					className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md font-semibold transition-colors"
				>
					{startMutation.isPending ? "Starting..." : "Start Server"}
				</button>

				<button
					onClick={() => stopMutation.mutate()}
					disabled={stopMutation.isPending}
					className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md font-semibold transition-colors"
				>
					{stopMutation.isPending ? "Stopping..." : "Stop Server"}
				</button>
			</div>
		</div>
	);
}
