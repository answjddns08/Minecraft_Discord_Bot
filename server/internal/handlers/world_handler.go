package handlers

import (
	"mc-bot-server/internal/models"
	"mc-bot-server/internal/services"
	"mc-bot-server/internal/ws"

	"github.com/gofiber/fiber/v3"
)

type WorldHandler struct {
	worldService *services.WorldService
	hub          *ws.Hub
}

func NewWorldHandler(worldService *services.WorldService, hub *ws.Hub) *WorldHandler {
	return &WorldHandler{
		worldService: worldService,
		hub:          hub,
	}
}

// List returns all worlds
func (h *WorldHandler) List(c fiber.Ctx) error {
	worlds, err := h.worldService.List()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "list_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	return c.JSON(fiber.Map{
		"worlds": worlds,
		"count":  len(worlds),
	})
}

// ListTrash returns all worlds in trash
func (h *WorldHandler) ListTrash(c fiber.Ctx) error {
	worlds, err := h.worldService.ListTrash()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "list_trash_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	return c.JSON(fiber.Map{
		"worlds": worlds,
		"count":  len(worlds),
	})
}

// Create creates a new world
func (h *WorldHandler) Create(c fiber.Ctx) error {
	var req models.CreateWorldRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error:   "invalid_request",
			Message: err.Error(),
			Code:    fiber.StatusBadRequest,
		})
	}

	if err := h.worldService.Create(req.Name, req.Settings); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "create_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	// Broadcast to WebSocket clients
	h.hub.Broadcast(models.WSMessage{
		Type:    "world_created",
		Payload: fiber.Map{"name": req.Name},
	})

	return c.Status(fiber.StatusCreated).JSON(models.SuccessResponse{
		Success: true,
		Message: "World created successfully",
		Data:    fiber.Map{"name": req.Name},
	})
}

// Rename renames a world
func (h *WorldHandler) Rename(c fiber.Ctx) error {
	oldName := c.Params("name")

	var req struct {
		NewName string `json:"newName"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error:   "invalid_request",
			Message: err.Error(),
			Code:    fiber.StatusBadRequest,
		})
	}

	if err := h.worldService.Rename(oldName, req.NewName); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "rename_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	// Broadcast to WebSocket clients
	h.hub.Broadcast(models.WSMessage{
		Type: "world_renamed",
		Payload: fiber.Map{
			"oldName": oldName,
			"newName": req.NewName,
		},
	})

	return c.JSON(models.SuccessResponse{
		Success: true,
		Message: "World renamed successfully",
	})
}

// Remove moves a world to trash
func (h *WorldHandler) Remove(c fiber.Ctx) error {
	name := c.Params("name")

	if err := h.worldService.Remove(name); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "remove_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	// Broadcast to WebSocket clients
	h.hub.Broadcast(models.WSMessage{
		Type:    "world_removed",
		Payload: fiber.Map{"name": name},
	})

	return c.JSON(models.SuccessResponse{
		Success: true,
		Message: "World moved to trash",
	})
}

// Restore restores a world from trash
func (h *WorldHandler) Restore(c fiber.Ctx) error {
	name := c.Params("name")

	if err := h.worldService.Restore(name); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "restore_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	// Broadcast to WebSocket clients
	h.hub.Broadcast(models.WSMessage{
		Type:    "world_restored",
		Payload: fiber.Map{"name": name},
	})

	return c.JSON(models.SuccessResponse{
		Success: true,
		Message: "World restored successfully",
	})
}

// Select selects a world as active
func (h *WorldHandler) Select(c fiber.Ctx) error {
	name := c.Params("name")

	if err := h.worldService.Select(name); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error:   "select_error",
			Message: err.Error(),
			Code:    fiber.StatusInternalServerError,
		})
	}

	// Broadcast to WebSocket clients
	h.hub.Broadcast(models.WSMessage{
		Type:    "world_selected",
		Payload: fiber.Map{"name": name},
	})

	return c.JSON(models.SuccessResponse{
		Success: true,
		Message: "World selected successfully",
	})
}
