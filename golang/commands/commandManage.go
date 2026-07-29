// Package commands handles the commands for the bot
package commands

import (
	"sync"

	"MCbot/utils"

	"github.com/bwmarrin/discordgo"
)

type Command struct {
	Definition *discordgo.ApplicationCommand
	Handler    func(s *discordgo.Session, i *discordgo.InteractionCreate)
}

// Config is the global configuration variable that holds the configuration settings for the bot.

var (
	Config      utils.ConfigFile
	ConfigMutex sync.RWMutex
)

type ComponentHandler func(s *discordgo.Session, i *discordgo.InteractionCreate)

var Commands = map[string]*Command{
	"start":      StartCommand,
	"check":      CheckCommand,
	"stop":       StopCommand,
	"list":       ListCommand,
	"setversion": SetVersionCommand,
}

var ComponentHandlers = map[string]ComponentHandler{
	difficultySelectID: handleCreateSelectMenu,
	gamemodeSelectID:   handleCreateSelectMenu,
	leveltypeSelectID:  handleCreateSelectMenu,
	opConfirmID:        handleCreateOpButton,
	opCancelID:         handleCreateOpButton,
}
