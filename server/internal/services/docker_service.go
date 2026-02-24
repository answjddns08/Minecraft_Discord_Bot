package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

type DockerService struct {
	client        *client.Client
	containerName string
}

func NewDockerService() *DockerService {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(fmt.Sprintf("Failed to create Docker client: %v", err))
	}

	return &DockerService{
		client:        cli,
		containerName: "minecraft-server", // 환경 변수로 변경 가능
	}
}

// IsRunning checks if the Minecraft server container is running
func (s *DockerService) IsRunning() (bool, error) {
	ctx := context.Background()
	containers, err := s.client.ContainerList(ctx, container.ListOptions{All: true})
	if err != nil {
		return false, err
	}

	for _, c := range containers {
		for _, name := range c.Names {
			if strings.Contains(name, s.containerName) {
				return c.State == "running", nil
			}
		}
	}
	return false, nil
}

// Start starts the Minecraft server container
func (s *DockerService) Start() error {
	ctx := context.Background()

	// Find container
	containerID, err := s.findContainer()
	if err != nil {
		return err
	}

	// Start container
	if err := s.client.ContainerStart(ctx, containerID, container.StartOptions{}); err != nil {
		return fmt.Errorf("failed to start container: %w", err)
	}

	return nil
}

// Stop stops the Minecraft server container
func (s *DockerService) Stop() error {
	ctx := context.Background()

	// Find container
	containerID, err := s.findContainer()
	if err != nil {
		return err
	}

	// Stop container with timeout
	timeout := 30 // seconds
	if err := s.client.ContainerStop(ctx, containerID, container.StopOptions{Timeout: &timeout}); err != nil {
		return fmt.Errorf("failed to stop container: %w", err)
	}

	return nil
}

// GetStats returns container stats (simplified version)
func (s *DockerService) GetStats() (map[string]interface{}, error) {
	ctx := context.Background()

	containerID, err := s.findContainer()
	if err != nil {
		return nil, err
	}

	stats, err := s.client.ContainerStats(ctx, containerID, false)
	if err != nil {
		return nil, err
	}
	defer stats.Body.Close()

	// Parse stats from response body
	// This is simplified - you'd need to decode JSON from stats.Body
	return map[string]interface{}{}, nil
}

func (s *DockerService) findContainer() (string, error) {
	ctx := context.Background()
	containers, err := s.client.ContainerList(ctx, container.ListOptions{All: true})
	if err != nil {
		return "", err
	}

	for _, c := range containers {
		for _, name := range c.Names {
			if strings.Contains(name, s.containerName) {
				return c.ID, nil
			}
		}
	}
	return "", fmt.Errorf("container %s not found", s.containerName)
}

func (s *DockerService) Close() error {
	return s.client.Close()
}
