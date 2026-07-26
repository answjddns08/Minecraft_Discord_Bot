// Package commands handles the commands for the bot
package commands

import (
	"github.com/bwmarrin/discordgo"
)

type Command struct {
	Definition *discordgo.ApplicationCommand
	Handler    func(s *discordgo.Session, i *discordgo.InteractionCreate)
}

var Commands = map[string]*Command{
	"start": StartCommand,
	"check": CheckCommand,
}
