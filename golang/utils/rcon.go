// Package utils provides utility functions for interacting with a Minecraft server
package utils

import (
	"fmt"
	"log"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/Sch8ill/rcon"
)

// ListPlayers retrieves the number of players currently online on the Minecraft server and returns the count along with a string of player names.
func ListPlayers() (int, string) {
	config := LoadConfig()

	client, err := rcon.Dial(config.RCsettings.Host+":"+config.RCsettings.Port, config.RCsettings.Password, time.Second*5)
	if err != nil {
		log.Printf("Failed to connect to RCON: %v", err)
		return 0, ""
	}
	defer client.Close()

	output, err := client.ExecuteCmd("list")
	if err != nil {
		log.Printf("Failed to execute RCON command: %v", err)
		return 0, ""
	}

	pattern := regexp.MustCompile(`There are (\d+) of a max of (\d+) players online:?\s*(.*)`)
	match := pattern.FindStringSubmatch(output)
	if len(match) == 0 {
		return 0, ""
	}

	count, _ := strconv.Atoi(match[1])
	playersText := strings.TrimSpace(match[3])

	return count, playersText
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
