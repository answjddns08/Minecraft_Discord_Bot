package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"MCbot/commands"
	"MCbot/utils"

	"github.com/bwmarrin/discordgo"
	"github.com/joho/godotenv"
)

// TODO: 웹 서버는 아주아주 나중에, 일단 마이그레이션부터

// TODO: config 파일에서 계속 읽고 쓰는 부분과 한번 읽기만 하면 되는 것들이 있는데,
// 그거 구분해서 구조체 만들어서 일부분은 캐싱해서 쓰도록 하면 괜찮을듯?
// 그리고 추가로 log.Fatal도 안 쓰도록 해야 할것 같음. (에러를 반환하고, main에서 처리하도록)

func main() {
	err := godotenv.Load() // loads env
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	dg, err := discordgo.New("Bot " + os.Getenv("DISCORD_TOKEN"))
	if err != nil {
		log.Fatal("Error creating Discord session:", err)
	}

	// load config from config.json (if fails, log.Fatal will be called in LoadConfig)
	commands.Config = utils.LoadConfig()

	// cuz don't need to store all messages in memory
	dg.State.MaxMessageCount = 20

	// intents for receiving messages and message content ( for slash commands and button clicks )
	dg.Identify.Intents = discordgo.IntentsGuildMessages | discordgo.IntentsMessageContent | discordgo.IntentsGuilds

	dg.AddHandler(handleReady)
	dg.AddHandler(handleInteraction)

	err = dg.Open()
	if err != nil {
		log.Fatal("Error opening connection:", err)
	}

	fmt.Println("Bot is now running. Press Ctrl+C to exit.")

	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)

	<-sc

	fmt.Println("\nShutting down bot...")

	_ = dg.Close()
}

func handleReady(s *discordgo.Session, r *discordgo.Ready) {
	fmt.Println("Bot(" + r.User.Username + ") is ready. Registering commands...")

	appID := r.User.ID

	// delete all existing commands to avoid duplicates
	// s.ApplicationCommandBulkOverwrite(appID, os.Getenv("DISCORD_GUILD_ID"), []*discordgo.ApplicationCommand{})

	for _, cmd := range commands.Commands {
		_, err := s.ApplicationCommandCreate(appID, os.Getenv("DISCORD_GUILD_ID"), cmd.Definition)
		if err != nil {
			log.Println("Error creating command:", err)
		}
	}

	usd := discordgo.UpdateStatusData{
		Status: "idle",
	}
	usd.Activities = []*discordgo.Activity{
		{
			Name:  "휴식 시간",
			Type:  discordgo.ActivityTypeCustom,
			State: "쉬는 중...",
		},
	}

	_ = s.UpdateStatusComplex(usd)

	fmt.Println("Commands registered successfully.")
}

func handleInteraction(s *discordgo.Session, i *discordgo.InteractionCreate) {
	switch i.Type {
	case discordgo.InteractionApplicationCommand: // handle slash commands
		cmdName := i.ApplicationCommandData().Name

		if cmd, ok := commands.Commands[cmdName]; ok {
			cmd.Handler(s, i)
		}
	case discordgo.InteractionMessageComponent: // handle button clicks and select menus
		customID := i.MessageComponentData().CustomID
		if handler, ok := commands.ComponentHandlers[customID]; ok {
			handler(s, i)
		}
	}
}
