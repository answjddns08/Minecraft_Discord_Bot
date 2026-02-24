import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY || "dev-key-change-in-production";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add auth token to requests
api.interceptors.request.use((config) => {
	config.headers.Authorization = `Bearer ${API_KEY}`;
	return config;
});

// Server endpoints
export const serverApi = {
	getStatus: () => api.get("/server/status"),
	getPlayers: () => api.get("/server/players"),
	start: () => api.post("/server/start"),
	stop: () => api.post("/server/stop"),
};

// World endpoints
export const worldApi = {
	list: () => api.get("/worlds"),
	listTrash: () => api.get("/worlds/trash"),
	create: (data) => api.post("/worlds", data),
	rename: (name, newName) => api.put(`/worlds/${name}`, { newName }),
	remove: (name) => api.delete(`/worlds/${name}`),
	restore: (name) => api.post(`/worlds/${name}/restore`),
	select: (name) => api.post(`/worlds/${name}/select`),
};

export default api;
