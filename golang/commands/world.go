package commands

import (
	"fmt"
	"log"
	"os"
	"path"
	"regexp"
	"strings"

	"github.com/bwmarrin/discordgo"
)

var ListCommand = &Command{
	Definition: &discordgo.ApplicationCommand{
		Name:        "list",
		Description: "월드 목록 보기",
	},
	Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		worldList, err := os.ReadDir(Config.WorldDir)
		if err != nil {
			_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "월드 목록을 불러오는 데 실패했어요. :cry:",
				},
			})
			return
		}

		if len(worldList) == 0 {
			_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "원드가 없습니다\n하나라도 만드십시오 휴먼",
				},
			})
			return
		}

		var sb strings.Builder
		for _, world := range worldList {
			fmt.Fprintf(&sb, "- :file_folder: %s\n", world.Name())
		}

		_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: fmt.Sprintf("현재 선택된 월드: **%s**\n\n월드 목록\n%s", Config.LastWorld, strings.TrimSpace(sb.String())),
			},
		})
	},
}

type WorldSettings struct {
	Difficulty string
	GameMode   string
	LevelType  string
	Options    *bool // use pointer for null check
}

const (
	difficultySelectID = "difficultySelect"
	gamemodeSelectID   = "gamemodeSelect"
	leveltypeSelectID  = "leveltypeSelect"
	opConfirmID        = "opConfirm"
	opCancelID         = "opCancel"
)

var CreateCommand = &Command{
	Definition: &discordgo.ApplicationCommand{
		Name:        "create",
		Description: "새 월드 생성",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "worldname",
				Description: "생성할 월드 이름",
				Required:    true,
				MaxLength:   20,
			},
		},
	},
	Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		worldName := i.ApplicationCommandData().Options[0].StringValue()

		matched, _ := regexp.MatchString(`^[a-zA-Z0-9_-]+$`, worldName)
		if !matched {
			// check if the world name contains only allowed characters
			_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "월드 이름은 영문자, 숫자, 밑줄(_) 및 하이픈(-)만 포함할 수 있습니다.",
				},
			})
			return
		}

		worldPath := path.Join(Config.WorldDir, worldName)

		if dir, err := os.Stat(worldPath); err == nil && dir.IsDir() {
			// check if the world directory already exists
			_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "이미 존재하는 월드입니다. 다른 이름을 선택해주세요.",
				},
			})
			return
		}
		difficultymenu := discordgo.ActionsRow{
			Components: []discordgo.MessageComponent{
				discordgo.SelectMenu{
					CustomID:    difficultySelectID,
					Placeholder: "난이도 선택",
					Options: []discordgo.SelectMenuOption{
						{Label: "평화로움", Value: "peaceful", Description: "응애 모드"},
						{Label: "쉬움", Value: "easy", Description: "죽기엔 아직 어림"},
						{Label: "보통", Value: "normal", Description: "적당함(기본 설정)", Default: true},
						{Label: "어려움", Value: "hard", Description: "악몽의 시간!"},
					},
				},
			},
		}

		gamemodeMenu := discordgo.ActionsRow{
			Components: []discordgo.MessageComponent{
				discordgo.SelectMenu{
					CustomID:    gamemodeSelectID,
					Placeholder: "게임 모드 선택",
					Options: []discordgo.SelectMenuOption{
						{Label: "서바이벌", Value: "survival", Description: "생존(기본 설정)", Default: true},
						{Label: "크리에이티브", Value: "creative", Description: "gun축가"},
						{Label: "어드벤처", Value: "adventure", Description: "핀과 제이크의 어드벤쳐 타임"},
					},
				},
			},
		}

		worldTypeMenu := discordgo.ActionsRow{
			Components: []discordgo.MessageComponent{
				discordgo.SelectMenu{
					CustomID:    leveltypeSelectID,
					Placeholder: "지형 선택",
					Options: []discordgo.SelectMenuOption{
						{Label: "기본 월드", Value: "default", Description: "언덕, 계곡, 물 등이 생성되는 일반적인 월드 (기본 설정)", Default: true},
						{Label: "평지", Value: "flat", Description: "마을밖에 없는 평평한 땅(주로 건축용으로 사용)"},
					},
				},
			},
		}

		opButtons := discordgo.ActionsRow{
			Components: []discordgo.MessageComponent{
				discordgo.Button{
					CustomID: opConfirmID,
					Label:    "OP 허용하는 허졉쉑",
					Style:    discordgo.SuccessButton,
				},
				discordgo.Button{
					CustomID: opCancelID,
					Label:    "OP 거부하는 10상남자 (기본 설정)",
					Style:    discordgo.DangerButton,
				},
			},
		}

		err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: fmt.Sprintf("🌍 **[%s]** 월드가 생성되었습니다! 아래 설정을 완료해주세요", worldName),
				Components: []discordgo.MessageComponent{
					difficultymenu, gamemodeMenu, worldTypeMenu, opButtons,
				},
			},
		})
		if err != nil {
			log.Printf("Failed to send interaction response: %v", err)
		}
	},
}

func handleCreateSelectMenu(s *discordgo.Session, i *discordgo.InteractionCreate) {
	data := i.MessageComponentData()
	selectedValue := data.Values[0] // the value selected by the user

	var responseContent string
	switch data.CustomID {
	case difficultySelectID:
		responseContent = fmt.Sprintf("난이도가 **%s**(으)로 설정되었습니다.", selectedValue)
	case gamemodeSelectID:
		responseContent = fmt.Sprintf("게임 모드가 **%s**(으)로 설정되었습니다.", selectedValue)
	case leveltypeSelectID:
		responseContent = fmt.Sprintf("지형이 **%s**(으)로 설정되었습니다.", selectedValue)
	}

	_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseUpdateMessage,
		Data: &discordgo.InteractionResponseData{
			Content:    i.Message.Content + "\n" + responseContent,
			Components: i.Message.Components, // keep the same components
		},
	})
}

func handleCreateOpButton(s *discordgo.Session, i *discordgo.InteractionCreate) {
	data := i.MessageComponentData()
	isOpAllowed := data.CustomID == opConfirmID

	status := "거부"
	if isOpAllowed {
		status = "허용"
	}

	_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseUpdateMessage,
		Data: &discordgo.InteractionResponseData{
			Content:    fmt.Sprintf("✅ 월드 설정 완료! (OP 권한: %s)", status),
			Components: []discordgo.MessageComponent{}, // remove components after selection
		},
	})
}
