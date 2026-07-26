// Package utils provides utility functions for interacting with a Minecraft server
package utils

import (
	"fmt"
	"log"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/Sch8ill/rcon"
)

type PlayerList struct {
	Count   int
	Max     int
	Players []string
}

// CheckServerStatus checks if the Minecraft server is running by checking if the tmux session exists. It returns true if the server is running, false otherwise.
func CheckServerStatus() bool {
	config := LoadConfig()

	cmd := exec.Command("tmux", "has-session", "-t", config.SessionName)

	err := cmd.Run()

	return err == nil // if err is nil, the session exists, meaning the server is running
}

// CheckPlayers connects to the Minecraft server via RCON and retrieves the list of online players. if not successful, it logs the error and returns an empty string.
func CheckPlayers() string {
	config := LoadConfig()

	client, err := rcon.Dial(config.RCsettings.Host+":"+config.RCsettings.Port, config.RCsettings.Password, time.Second*5)
	if err != nil {
		log.Printf("Failed to connect to RCON: %v", err)
		return ""
	}

	output, err := client.ExecuteCmd("list")
	if err != nil {
		log.Printf("Failed to execute RCON command: %v", err)
		return ""
	}

	fmt.Println("list OUTPUT:", output)

	return output
}

func ListPlayers() (PlayerList, error) {
	config := LoadConfig()

	client, err := rcon.Dial(config.RCsettings.Host+":"+config.RCsettings.Port, config.RCsettings.Password, time.Second*5)
	if err != nil {
		log.Printf("Failed to connect to RCON: %v", err)
		return PlayerList{}, err
	}
	defer client.Close()

	output, err := client.ExecuteCmd("list")
	if err != nil {
		log.Printf("Failed to execute RCON command: %v", err)
		return PlayerList{}, err
	}

	pattern := regexp.MustCompile(`There are (\d+) of a max of (\d+) players online:?\s*(.*)`)
	match := pattern.FindStringSubmatch(output)
	if len(match) == 0 {
		return PlayerList{Count: 0, Max: 0, Players: []string{}}, nil
	}

	count, _ := strconv.Atoi(match[1])
	max, _ := strconv.Atoi(match[2])
	playersText := strings.TrimSpace(match[3])
	players := make([]string, 0)
	if playersText != "" {
		for _, player := range strings.Split(playersText, ",") {
			name := strings.TrimSpace(player)
			if name != "" {
				players = append(players, name)
			}
		}
	}

	return PlayerList{Count: count, Max: max, Players: players}, nil
}

// StopServer connects to the Minecraft server via RCON and sends the "stop" command to gracefully shut down the server.
func StopServer() error {
	config := LoadConfig()

	client, err := rcon.Dial(config.RCsettings.Host+":"+config.RCsettings.Port, config.RCsettings.Password, time.Second*5)
	if err != nil {
		log.Printf("Failed to connect to RCON: %v", err)
		return err
	}

	output, err := client.ExecuteCmd("stop")
	if err != nil {
		log.Printf("Failed to execute RCON command: %v", err)
		return err
	}

	fmt.Println("stop OUTPUT:", output)

	return nil
}
