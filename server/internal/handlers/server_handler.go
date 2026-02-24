package handlers

import (
	"mc-bot-server/internal/models"
	"mc-bot-server/internal/services"
	"mc-bot-server/internal/ws"

	"github.com/gofiber/fiber/v3"
)

type ServerHandler struct {
	minecraftService *services.MinecraftService
	dockerService    *services.DockerService
	hub              *ws.Hub
}

func NewServerHandler(mc *services.MinecraftService, docker *services.DockerService, hub *ws.Hub) *ServerHandler {
	return &ServerHandler{
		minecraftService: mc,
		dockerService:    docker,
		hub:              hub,
	}
}

// GetStatus returns the current server status
func (h *ServerHandler) GetStatus(c fiber.Ctx) error {
	status, err := h.minecraftService.GetStatus()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "status_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	return c.JSON(status)
}

// GetPlayers returns the list of online players
func (h *ServerHandler) GetPlayers(c fiber.Ctx) error {
	players, err := h.minecraftService.GetPlayers()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "players_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	return c.JSON(fiber.Map{
		"players": players,
		"count":   len(players),
	})
}

// Start starts the Minecraft server
func (h *ServerHandler) Start(c fiber.Ctx) error {
	// Check if already running
	isRunning, err := h.dockerService.IsRunning()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "status_check_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	if isRunning {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error:   "already_running",
			Message: "Server is already running",
			Code:    fiber.StatusBadRequest,
		})
	}

	// Start server
	if err := h.dockerService.Start(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "start_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	// Broadcast to WebSocket clients
	h.hub.Broadcast(models.WSMessage{
		Type:    "server_started",
		Payload: fiber.Map{"status": "starting"},
	})

	return c.JSON(models.SuccessResponse{
		Success: true,
		Message: "Server is starting",
	})
}

// Stop stops the Minecraft server
func (h *ServerHandler) Stop(c fiber.Ctx) error {
	// Check if running
	isRunning, err := h.dockerService.IsRunning()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "status_check_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	if !isRunning {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error:   "not_running",
			Message: "Server is not running",
			Code:    fiber.StatusBadRequest,
		})
	}

	// Stop server
	if err := h.dockerService.Stop(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "stop_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	// Broadcast to WebSocket clients
	h.hub.Broadcast(models.WSMessage{
		Type:    "server_stopped",
		Payload: fiber.Map{"status": "stopped"},
	})

	return c.JSON(models.SuccessResponse{
		Success: true,
		Message: "Server is stopping",
	})
}
