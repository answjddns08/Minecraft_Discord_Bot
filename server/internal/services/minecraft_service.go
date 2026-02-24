package services

import (
	"fmt"
	"os"
	"time"

	"mc-bot-server/internal/models"

	"github.com/willroberts/minecraft-client"
)

type MinecraftService struct {
	host     string
	port     string
	password string
}

func NewMinecraftService() *MinecraftService {
	return &MinecraftService{
		host:     getEnv("RCON_HOST", "localhost"),
		port:     getEnv("RCON_PORT", "25575"),
		password: getEnv("RCON_PASSWORD", ""),
	}
}

// GetStatus returns the current server status
func (s *MinecraftService) GetStatus() (*models.ServerStatus, error) {
	client, err := s.connect()
	if err != nil {
		return &models.ServerStatus{
			Status:      "offline",
			LastUpdated: time.Now(),
		}, nil
	}
	defer client.Close()

	// Get player count
	response, err := client.SendCommand("list")
	if err != nil {
		return nil, fmt.Errorf("failed to get player list: %w", err)
	}

	// Parse response (simplified - you'd need proper parsing)
	status := &models.ServerStatus{
		ServerName:  "Minecraft Server",
		Status:      "online",
		Version:     "Unknown", // Get from server.properties or other source
		Players:     0,
		MaxPlayers:  20,
		LastUpdated: time.Now(),
	}

	// Basic parsing of "list" command response
	// Example: "There are 0 of a max of 20 players online:"
	fmt.Sscanf(response.Body, "There are %d of a max of %d players online",
		&status.Players, &status.MaxPlayers)

	return status, nil
}

// GetPlayers returns the list of online players
func (s *MinecraftService) GetPlayers() ([]string, error) {
	client, err := s.connect()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	response, err := client.SendCommand("list")
	if err != nil {
		return nil, fmt.Errorf("failed to get player list: %w", err)
	}

	// Parse player names from response
	// This is simplified - you'd need proper parsing
	players := []string{}

	// Example response: "There are 2 of a max of 20 players online: Player1, Player2"
	// Parse this properly based on actual response format

	_ = response.Body // Use the response

	return players, nil
}

// SendCommand sends a command to the server
func (s *MinecraftService) SendCommand(command string) (string, error) {
	client, err := s.connect()
	if err != nil {
		return "", err
	}
	defer client.Close()

	response, err := client.SendCommand(command)
	if err != nil {
		return "", fmt.Errorf("failed to send command: %w", err)
	}

	return response.Body, nil
}

func (s *MinecraftService) connect() (*minecraft.Client, error) {
	address := fmt.Sprintf("%s:%s", s.host, s.port)
	client, err := minecraft.NewClient(address)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RCON: %w", err)
	}

	if err := client.Authenticate(s.password); err != nil {
		client.Close()
		return nil, fmt.Errorf("failed to authenticate: %w", err)
	}

	return client, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
