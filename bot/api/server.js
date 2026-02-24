import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import serverRoutes from "./routes/serverRoutes.js";
import worldRoutes from "./routes/worldRoutes.js";

/**
 * Discord Bot과 통합된 Express API 서버
 * ENV: ENABLE_WEB_SERVER=true 로 활성화
 */
export function createAPIServer(client) {
	const app = express();
	const httpServer = createServer(app);

	// Middleware
	app.use(cors());
	app.use(express.json());

	// Health check
	app.get("/health", (req, res) => {
		res.json({
			status: "ok",
			discord: client.isReady() ? "connected" : "disconnected",
			timestamp: new Date().toISOString(),
		});
	});

	// API Routes
	app.use("/api/server", serverRoutes);
	app.use("/api/worlds", worldRoutes);

	// WebSocket 서버
	const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

	wss.on("connection", (ws) => {
		console.log("✅ WebSocket client connected");

		// 초기 연결 시 상태 전송
		ws.send(
			JSON.stringify({
				type: "connection",
				data: { status: "connected" },
			})
		);

		ws.on("close", () => {
			console.log("❌ WebSocket client disconnected");
		});
	});

	// WebSocket 브로드캐스트 함수
	const broadcast = (type, data) => {
		const message = JSON.stringify({ type, data });
		wss.clients.forEach((client) => {
			if (client.readyState === 1) {
				// WebSocket.OPEN
				client.send(message);
			}
		});
	};

	return { app, httpServer, broadcast };
}

/**
 * API 서버 시작
 */
export function startAPIServer(app, httpServer, port = 3000) {
	return new Promise((resolve, reject) => {
		httpServer.listen(port, () => {
			console.log(`🌐 Web API Server running on http://localhost:${port}`);
			console.log(`🔌 WebSocket Server running on ws://localhost:${port}/ws`);
			resolve();
		});

		httpServer.on("error", (error) => {
			console.error("❌ Failed to start API server:", error);
			reject(error);
		});
	});
}
