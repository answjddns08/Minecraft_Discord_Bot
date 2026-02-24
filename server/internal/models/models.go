package models

import "time"

// ServerStatus represents the current status of the Minecraft server
type ServerStatus struct {
	ServerName    string    `json:"serverName"`
	Status        string    `json:"status"`
	Version       string    `json:"version"`
	Players       int       `json:"players"`
	MaxPlayers    int       `json:"maxPlayers"`
	OnlinePlayers []string  `json:"onlinePlayers,omitempty"`
	Uptime        int64     `json:"uptime,omitempty"`
	LastUpdated   time.Time `json:"lastUpdated"`
}

// World represents a Minecraft world
type World struct {
	Name         string         `json:"name"`
	Size         string         `json:"size"`
	CreatedAt    time.Time      `json:"createdAt"`
	LastModified time.Time      `json:"lastModified"`
	IsActive     bool           `json:"isActive"`
	Settings     *WorldSettings `json:"settings,omitempty"`
}

// WorldSettings represents world configuration
type WorldSettings struct {
	LevelType  string `json:"levelType"`
	Difficulty string `json:"difficulty"`
	Gamemode   string `json:"gamemode"`
	PVP        bool   `json:"pvp"`
	Hardcore   bool   `json:"hardcore"`
	MaxPlayers int    `json:"maxPlayers"`
}

// CreateWorldRequest represents the request to create a new world
type CreateWorldRequest struct {
	Name     string         `json:"name" validate:"required,min=1,max=50"`
	Settings *WorldSettings `json:"settings,omitempty"`
}

// RenameWorldRequest represents the request to rename a world
type RenameWorldRequest struct {
	OldName string `json:"oldName" validate:"required"`
	NewName string `json:"newName" validate:"required,min=1,max=50"`
}

// WSMessage represents a WebSocket message
type WSMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    int    `json:"code"`
}

// SuccessResponse represents a success response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
