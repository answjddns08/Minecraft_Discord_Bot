package utils

import (
	"log"
	"os/exec"
)

// CheckServerStatus checks if the Minecraft server is running by checking if the tmux session exists. It returns true if the server is running, false otherwise.
func CheckServerStatus() bool {
	config := LoadConfig()

	cmd := exec.Command("tmux", "has-session", "-t", config.SessionName)

	err := cmd.Run()

	return err == nil // if err is nil, the session exists, meaning the server is running
}

// StartServer starts the Minecraft server in a new tmux session. It returns an error if the server fails to start.
func StartServer() error {
	config := LoadConfig()

	cmd := exec.Command("tmux", "new-session", "-d", "-s", config.SessionName, "-c", config.MinecraftDir, "bash ./start.sh")

	err := cmd.Run()
	if err != nil {
		log.Printf("Failed to start the server: %v", err)
		return err
	}

	return nil
}

// StopServerWithTmux stops the Minecraft server by killing the tmux session(Use this fn when stopping server by force). It returns an error if the server fails to stop.
func StopServerWithTmux() error {
	config := LoadConfig()

	cmd := exec.Command("tmux", "kill-session", "-t", config.SessionName)

	err := cmd.Run()
	if err != nil {
		log.Printf("Failed to stop the server: %v", err)
		return err
	}

	return nil
}
