package services

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"time"

	"mc-bot-server/internal/models"
)

type WorldService struct {
	worldsPath string
	trashPath  string
	configPath string
}

func NewWorldService() *WorldService {
	basePath := getEnv("MINECRAFT_DATA_PATH", "/minecraft/data")

	return &WorldService{
		worldsPath: filepath.Join(basePath, "worlds"),
		trashPath:  filepath.Join(basePath, "trash"),
		configPath: getEnv("WORLD_SETTINGS_PATH", "../shared/config/worldSettings.json"),
	}
}

// List returns all available worlds
func (s *WorldService) List() ([]*models.World, error) {
	files, err := ioutil.ReadDir(s.worldsPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read worlds directory: %w", err)
	}

	worlds := make([]*models.World, 0)
	activeWorld := s.getActiveWorld()

	for _, file := range files {
		if !file.IsDir() {
			continue
		}

		world := &models.World{
			Name:         file.Name(),
			Size:         s.getDirectorySize(filepath.Join(s.worldsPath, file.Name())),
			CreatedAt:    time.Now(), // Get from folder metadata
			LastModified: file.ModTime(),
			IsActive:     file.Name() == activeWorld,
		}

		worlds = append(worlds, world)
	}

	return worlds, nil
}

// ListTrash returns all worlds in trash
func (s *WorldService) ListTrash() ([]*models.World, error) {
	files, err := ioutil.ReadDir(s.trashPath)
	if err != nil {
		if os.IsNotExist(err) {
			return []*models.World{}, nil
		}
		return nil, fmt.Errorf("failed to read trash directory: %w", err)
	}

	worlds := make([]*models.World, 0)

	for _, file := range files {
		if !file.IsDir() {
			continue
		}

		world := &models.World{
			Name:         file.Name(),
			Size:         s.getDirectorySize(filepath.Join(s.trashPath, file.Name())),
			LastModified: file.ModTime(),
			IsActive:     false,
		}

		worlds = append(worlds, world)
	}

	return worlds, nil
}

// Create creates a new world
func (s *WorldService) Create(name string, settings *models.WorldSettings) error {
	worldPath := filepath.Join(s.worldsPath, name)

	// Check if world already exists
	if _, err := os.Stat(worldPath); !os.IsNotExist(err) {
		return fmt.Errorf("world %s already exists", name)
	}

	// Create world directory
	if err := os.MkdirAll(worldPath, 0755); err != nil {
		return fmt.Errorf("failed to create world directory: %w", err)
	}

	// Save world settings
	if settings != nil {
		if err := s.saveWorldSettings(name, settings); err != nil {
			return fmt.Errorf("failed to save world settings: %w", err)
		}
	}

	return nil
}

// Rename renames a world
func (s *WorldService) Rename(oldName, newName string) error {
	oldPath := filepath.Join(s.worldsPath, oldName)
	newPath := filepath.Join(s.worldsPath, newName)

	// Check if old world exists
	if _, err := os.Stat(oldPath); os.IsNotExist(err) {
		return fmt.Errorf("world %s does not exist", oldName)
	}

	// Check if new world name already exists
	if _, err := os.Stat(newPath); !os.IsNotExist(err) {
		return fmt.Errorf("world %s already exists", newName)
	}

	// Rename directory
	if err := os.Rename(oldPath, newPath); err != nil {
		return fmt.Errorf("failed to rename world: %w", err)
	}

	return nil
}

// Remove moves a world to trash
func (s *WorldService) Remove(name string) error {
	worldPath := filepath.Join(s.worldsPath, name)
	trashWorldPath := filepath.Join(s.trashPath, name)

	// Check if world exists
	if _, err := os.Stat(worldPath); os.IsNotExist(err) {
		return fmt.Errorf("world %s does not exist", name)
	}

	// Create trash directory if it doesn't exist
	if err := os.MkdirAll(s.trashPath, 0755); err != nil {
		return fmt.Errorf("failed to create trash directory: %w", err)
	}

	// Move to trash
	if err := os.Rename(worldPath, trashWorldPath); err != nil {
		return fmt.Errorf("failed to move world to trash: %w", err)
	}

	return nil
}

// Restore restores a world from trash
func (s *WorldService) Restore(name string) error {
	trashWorldPath := filepath.Join(s.trashPath, name)
	worldPath := filepath.Join(s.worldsPath, name)

	// Check if world exists in trash
	if _, err := os.Stat(trashWorldPath); os.IsNotExist(err) {
		return fmt.Errorf("world %s not found in trash", name)
	}

	// Check if world already exists in worlds directory
	if _, err := os.Stat(worldPath); !os.IsNotExist(err) {
		return fmt.Errorf("world %s already exists", name)
	}

	// Restore from trash
	if err := os.Rename(trashWorldPath, worldPath); err != nil {
		return fmt.Errorf("failed to restore world: %w", err)
	}

	return nil
}

// Select sets a world as the active world
func (s *WorldService) Select(name string) error {
	worldPath := filepath.Join(s.worldsPath, name)

	// Check if world exists
	if _, err := os.Stat(worldPath); os.IsNotExist(err) {
		return fmt.Errorf("world %s does not exist", name)
	}

	// Save active world to config
	// This is simplified - implement proper config management
	config := map[string]interface{}{
		"activeWorld": name,
		"lastChanged": time.Now(),
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	configFile := filepath.Join(s.configPath, "active-world.json")
	if err := ioutil.WriteFile(configFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	return nil
}

func (s *WorldService) getActiveWorld() string {
	configFile := filepath.Join(s.configPath, "active-world.json")
	data, err := ioutil.ReadFile(configFile)
	if err != nil {
		return ""
	}

	var config map[string]interface{}
	if err := json.Unmarshal(data, &config); err != nil {
		return ""
	}

	if active, ok := config["activeWorld"].(string); ok {
		return active
	}

	return ""
}

func (s *WorldService) getDirectorySize(path string) string {
	var size int64
	filepath.Walk(path, func(_ string, info os.FileInfo, err error) error {
		if err == nil && !info.IsDir() {
			size += info.Size()
		}
		return nil
	})

	// Convert to human readable format
	const unit = 1024
	if size < unit {
		return fmt.Sprintf("%d B", size)
	}
	div, exp := int64(unit), 0
	for n := size / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(size)/float64(div), "KMGTPE"[exp])
}

func (s *WorldService) saveWorldSettings(name string, settings *models.WorldSettings) error {
	// Implement world settings persistence
	// This would integrate with your existing worldSettings.json structure
	return nil
}
