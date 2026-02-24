package main

import (
	"log"
	"os"

	"mc-bot-server/internal/handlers"
	"mc-bot-server/internal/middleware"
	"mc-bot-server/internal/services"
	"mc-bot-server/internal/ws"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize services
	dockerService := services.NewDockerService()
	minecraftService := services.NewMinecraftService()
	worldService := services.NewWorldService()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "MC Bot Server",
		ServerHeader: "Fiber",
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: getEnv("CORS_ORIGIN", "http://localhost:5173"),
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Initialize WebSocket hub
	hub := ws.NewHub()
	go hub.Run()

	// API Routes
	api := app.Group("/api/v1")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "MC Bot Server is running",
		})
	})

	// Server routes
	serverHandler := handlers.NewServerHandler(minecraftService, dockerService, hub)
	server := api.Group("/server")
	server.Get("/status", serverHandler.GetStatus)
	server.Get("/players", serverHandler.GetPlayers)
	server.Post("/start", middleware.Auth(), serverHandler.Start)
	server.Post("/stop", middleware.Auth(), serverHandler.Stop)

	// World routes
	worldHandler := handlers.NewWorldHandler(worldService, hub)
	worlds := api.Group("/worlds")
	worlds.Get("/", worldHandler.List)
	worlds.Get("/trash", worldHandler.ListTrash)
	worlds.Post("/", middleware.Auth(), worldHandler.Create)
	worlds.Put("/:name", middleware.Auth(), worldHandler.Rename)
	worlds.Delete("/:name", middleware.Auth(), worldHandler.Remove)
	worlds.Post("/:name/restore", middleware.Auth(), worldHandler.Restore)
	worlds.Post("/:name/select", middleware.Auth(), worldHandler.Select)

	// WebSocket
	app.Get("/ws", func(c *fiber.Ctx) error {
		return ws.HandleWebSocket(c, hub)
	})

	// Start server
	port := getEnv("PORT", "3000")
	log.Printf("🚀 Server starting on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
