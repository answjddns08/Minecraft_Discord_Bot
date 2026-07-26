package utils

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
)

type RCONConfig struct {
	Host     string `json:"host"`
	Port     string `json:"port"`
	Password string `json:"password"`
}

type ConfigFile struct {
	SessionName    string     `json:"sessionName"`
	MinecraftDir   string     `json:"minecraftDir"`
	ThumbnailFile  string     `json:"thumbnailFile"`
	WorldDir       string     `json:"worldDir"`
	TrashWorldDir  string     `json:"trashWorldDir"`
	WorldAgeDay    int        `json:"worldAgeDay"`
	ServerAddress  string     `json:"serverAddress"`
	WorldLevelName string     `json:"worldLevelName"`
	CurrentVersion string     `json:"currentVersion"`
	RCsettings     RCONConfig `json:"rconSettings"`
	LastWorld      string     `json:"lastWorld"`
}

type WorldConfig struct {
	Difficulty string `json:"difficulty"`
	GameMode   string `json:"gameMode"`
	LevelType  string `json:"level-type"`
	Op         bool   `json:"op"`
}

// LoadConfig reads the configuration from a JSON file and returns a ConfigFile struct. if unsuccessful, it logs the error and terminates the program.
func LoadConfig() ConfigFile {
	configPath := filepath.Join("config", "config.json")
	file, err := os.Open(configPath)
	if err != nil {
		log.Fatalf("Failed to open config.json: %v", err)
	}
	defer func() {
		err := file.Close()
		if err != nil {
			log.Printf("Failed to close config.json: %v", err)
		}
	}()

	var config ConfigFile

	decoder := json.NewDecoder(file)

	err = decoder.Decode(&config)
	if err != nil {
		log.Fatalf("Failed to decode config.json: %v", err)
	}

	return config
}

func SaveConfig(config ConfigFile) error {
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		log.Printf("Failed to marshal config: %v", err)
		return err
	}

	configPath := filepath.Join("config", "config.json")
	err = os.WriteFile(configPath, data, 0o644)
	if err != nil {
		log.Printf("Failed to write config.json: %v", err)
		return err
	}

	return nil
}
