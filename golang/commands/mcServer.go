package commands

import (
	"fmt"
	"log"
	"os"

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

		file, err := os.Open(Config.ThumbnailFile)
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
			Title: Config.LastWorld,
			Thumbnail: &discordgo.MessageEmbedThumbnail{
				URL: "attachment://" + file.Name(),
			},
		}

		if !utils.CheckServerStatus() {
			embed.Color = 0xf70707
			embed.Description = "The world is offline! :x:\n **\n**"
			embed.Fields = []*discordgo.MessageEmbedField{
				{Name: "서버 주소", Value: Config.ServerAddress, Inline: true},
				{Name: "버전", Value: Config.CurrentVersion, Inline: true},
			}

			_, _ = s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
				Embeds: &[]*discordgo.MessageEmbed{embed},
				Files:  []*discordgo.File{serverIcon},
			})
			return
		}

		playerCount, players := utils.ListPlayers()

		embed.Color = 0x08f608
		embed.Description = "The world is online! :white_check_mark:\n **\n**"
		embed.Fields = []*discordgo.MessageEmbedField{
			{
				Name:  fmt.Sprintf("플레이어 수: %d", playerCount),
				Value: players + "\n **\n**",
			},
			{
				Name:   "서버 주소",
				Value:  Config.ServerAddress,
				Inline: true,
			},
			{
				Name:   "버전",
				Value:  Config.CurrentVersion,
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

		if Config.LastWorld == "" {
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
				Content: "**" + Config.LastWorld + "** 월드를 시작합니다!\n실행하는데 시간이 좀 걸려요. :hourglass_flowing_sand:",
			},
		})
		if err != nil {
			log.Println("Error responding to start command:", err)
		}

		err = utils.StartServer()
		if err != nil {
			log.Println("Error starting the server:", err)

			_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "오, 이런 서버를 켜는 데에 실패했네요. :cry:",
				},
			})
		}

		usd := discordgo.UpdateStatusData{
			Status: "online",
		}
		usd.Activities = []*discordgo.Activity{
			{
				Name:  Config.LastWorld + "월드 운영",
				Type:  discordgo.ActivityTypeGame,
				State: "평(?)화로운 월드 운영 중",
			},
		}

		_ = s.UpdateStatusComplex(usd)
	},
}

var SetVersionCommand = &Command{
	Definition: &discordgo.ApplicationCommand{
		Name:        "setversion",
		Description: "마크 서버 버전 설정",
	},
	Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		if utils.CheckServerStatus() {
			_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "서버가 실행 중이라 버전을 변경할 수 없어요! :no_entry_sign:",
				},
			})
			return
		}

		_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "버전 설정은 아직 구현 중입니다.",
			},
		})
	},
}


var SetVersionCommand = &Command{
	Definition: &discordgo.ApplicationCommand{
		Name:        "setversion",
		Description: "마크 서버 버전 설정",
	},
	Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		if utils.CheckServerStatus() {
			_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "서버가 실행 중이라 버전을 변경할 수 없어요! :no_entry_sign:",
				},
			})
			return
		}

		_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "버전 설정은 아직 구현 중입니다.",
			},
		})
	},
}

