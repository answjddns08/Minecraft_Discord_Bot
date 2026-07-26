package commands

import (
	"fmt"
	"log"
	"os"
	"strings"

	"MCbot/utils"

	"github.com/bwmarrin/discordgo"
)

var CheckCommand = &Command{
	Definition: &discordgo.ApplicationCommand{
		Name:        "check",
		Description: "마크 서버 상태 확인",
	},
	Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
		})
		if err != nil {
			log.Println("Deferred response error:", err)
		}

		config := utils.LoadConfig()

		file, err := os.Open(config.ThumbnailFile)
		if err != nil {
			log.Println("Error opening thumbnail file:", err)
			return
		}
		defer func() {
			err := file.Close()
			if err != nil {
				log.Println("Error closing thumbnail file:", err)
			}
		}()

		serverIcon := &discordgo.File{
			Name:        file.Name(),
			ContentType: "image/png",
			Reader:      file,
		}

		embed := &discordgo.MessageEmbed{
			Title: config.LastWorld,
			Thumbnail: &discordgo.MessageEmbedThumbnail{
				URL: "attachment://" + file.Name(),
			},
		}

		if !utils.CheckServerStatus() {
			embed.Color = 0xf70707
			embed.Description = "The world is offline! :x:\n **\n**"
			embed.Fields = []*discordgo.MessageEmbedField{
				{Name: "서버 주소", Value: config.ServerAddress, Inline: true},
				{Name: "버전", Value: config.CurrentVersion, Inline: true},
			}

			_, _ = s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
				Embeds: &[]*discordgo.MessageEmbed{embed},
				Files:  []*discordgo.File{serverIcon},
			})
			return
		}

		players := utils.CheckPlayers()
		playerCount := strings.Count(players, ",") + 1
		if players == "" {
			playerCount = 0
		}

		embed.Color = 0x08f608
		embed.Description = "The world is online! :white_check_mark:\n **\n**"
		embed.Fields = []*discordgo.MessageEmbedField{
			{
				Name:  fmt.Sprintf("플레이어 수: %d", playerCount),
				Value: players + "\n **\n**",
			},
			{
				Name:   "서버 주소",
				Value:  config.ServerAddress,
				Inline: true,
			},
			{
				Name:   "버전",
				Value:  config.CurrentVersion,
				Inline: true,
			},
		}

		_, _ = s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
			Embeds: &[]*discordgo.MessageEmbed{embed},
			Files:  []*discordgo.File{serverIcon},
		})
	},
}

var StartCommand = &Command{
	Definition: &discordgo.ApplicationCommand{
		Name:        "start",
		Description: "마크 서버 시작",
	},
	Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		if utils.CheckServerStatus() {
			err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "이미 월드가 실행 중이에요! :arrows_counterclockwise:",
				},
			})
			if err != nil {
				log.Println("Error responding to start command:", err)
			}

			return
		}

		config := utils.LoadConfig()

		if config.LastWorld == "" {
			err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "월드가 정해져 있지 않습니다 :x:",
				},
			})
			if err != nil {
				log.Println("Error responding to start command:", err)
			}

			return
		}

		err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "**" + config.LastWorld + "** 월드를 시작합니다!\n실행하는데 시간이 좀 걸려요. :hourglass_flowing_sand:",
			},
		})
		if err != nil {
			log.Println("Error responding to start command:", err)
		}

		// TODO: make Start function
	},
}
