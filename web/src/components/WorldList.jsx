import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { worldApi } from "../services/api";

export default function WorldList() {
	const [newWorldName, setNewWorldName] = useState("");
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["worlds"],
		queryFn: () => worldApi.list(),
	});

	const createMutation = useMutation({
		mutationFn: (name) => worldApi.create({ name }),
		onSuccess: () => {
			queryClient.invalidateQueries(["worlds"]);
			setNewWorldName("");
		},
	});

	const selectMutation = useMutation({
		mutationFn: (name) => worldApi.select(name),
		onSuccess: () => {
			queryClient.invalidateQueries(["worlds"]);
		},
	});

	const removeMutation = useMutation({
		mutationFn: (name) => worldApi.remove(name),
		onSuccess: () => {
			queryClient.invalidateQueries(["worlds"]);
		},
	});

	const worlds = data?.data?.worlds || [];

	return (
		<div className="bg-gray-800 rounded-lg p-6 shadow-lg">
			<h2 className="text-2xl font-bold mb-4">Worlds</h2>

			{/* Create new world */}
			<div className="mb-6 flex gap-2">
				<input
					type="text"
					value={newWorldName}
					onChange={(e) => setNewWorldName(e.target.value)}
					placeholder="New world name"
					className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					onClick={() => createMutation.mutate(newWorldName)}
					disabled={!newWorldName || createMutation.isPending}
					className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md font-semibold"
				>
					Create
				</button>
			</div>

			{/* World list */}
			{isLoading ? (
				<p className="text-gray-400">Loading worlds...</p>
			) : worlds.length === 0 ? (
				<p className="text-gray-400">No worlds found</p>
			) : (
				<div className="space-y-2">
					{worlds.map((world) => (
						<div
							key={world.name}
							className={`flex items-center justify-between p-4 rounded-md ${
								world.isActive ? "bg-blue-900" : "bg-gray-700"
							}`}
						>
							<div>
								<h3 className="font-semibold flex items-center gap-2">
									{world.name}
									{world.isActive && (
										<span className="px-2 py-0.5 bg-green-600 text-xs rounded-full">
											Active
										</span>
									)}
								</h3>
								<p className="text-sm text-gray-400">Size: {world.size}</p>
							</div>

							<div className="flex gap-2">
								{!world.isActive && (
									<button
										onClick={() => selectMutation.mutate(world.name)}
										className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
									>
										Select
									</button>
								)}
								<button
									onClick={() => {
										if (confirm(`Delete world "${world.name}"?`)) {
											removeMutation.mutate(world.name);
										}
									}}
									className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm"
								>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
