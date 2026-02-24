package services

import (
"fmt"
	"os"
	"os/exec"
	"strings"
)

type DockerService struct {
	containerName string
}

func NewDockerService() *DockerService {
	containerName := os.Getenv("DOCKER_CONTAINER_NAME")
	if containerName == "" {
		containerName = "minecraft-server"
	}
	
	return &DockerService{
		containerName: containerName,
	}
}

// IsRunning checks if the Minecraft server container is running
func (s *DockerService) IsRunning() (bool, error) {
	cmd := exec.Command("docker", "ps", "--filter", fmt.Sprintf("name=%s", s.containerName), "--format", "{{.Names}}")
	output, err := cmd.Output()
	if err != nil {
		return false, fmt.Errorf("failed to check container status: %w", err)
	}
	
	return strings.Contains(string(output), s.containerName), nil
}

// Start starts the Minecraft server container
func (s *DockerService) Start() error {
	cmd := exec.Command("docker", "start", s.containerName)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to start container: %w", err)
	}
	return nil
}

// Stop stops the Minecraft server container
func (s *DockerService) Stop() error {
	cmd := exec.Command("docker", "stop", s.containerName)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to stop container: %w", err)
	}
	return nil
}

// GetStats returns container stats (simplified version)
func (s *DockerService) GetStats() (map[string]interface{}, error) {
	cmd := exec.Command("docker", "stats", s.containerName, "--no-stream", "--format", "{{json .}}")
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to get stats: %w", err)
	}
	
	// Return raw JSON string for now
	return map[string]interface{}{
		"raw": string(output),
	}, nil
}

func (s *DockerService) Close() error {
	return nil
}
