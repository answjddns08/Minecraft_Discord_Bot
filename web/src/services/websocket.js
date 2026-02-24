import { create } from "zustand";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws";

export const useWebSocketStore = create((set) => ({
	ws: null,
	connected: false,
	messages: [],

	connect: () => {
		const ws = new WebSocket(WS_URL);

		ws.onopen = () => {
			console.log("WebSocket connected");
			set({ ws, connected: true });
		};

		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			console.log("WebSocket message:", message);
			set((state) => ({ messages: [...state.messages, message] }));
		};

		ws.onclose = () => {
			console.log("WebSocket disconnected");
			set({ ws: null, connected: false });

			// Reconnect after 5 seconds
			setTimeout(() => {
				set((state) => {
					if (!state.connected) {
						state.connect();
					}
				});
			}, 5000);
		};

		ws.onerror = (error) => {
			console.error("WebSocket error:", error);
		};
	},

	disconnect: () => {
		set((state) => {
			if (state.ws) {
				state.ws.close();
			}
			return { ws: null, connected: false };
		});
	},

	clearMessages: () => set({ messages: [] }),
}));
