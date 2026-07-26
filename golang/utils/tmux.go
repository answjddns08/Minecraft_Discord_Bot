package utils

import (
	"errors"
	"os/exec"
)

func IsServerRunning() bool {
	config := LoadConfig()

	cmd := exec.Command("tmux", "has-session", "-t", config.SessionName)
	return cmd.Run() == nil
}

func StartMinecraftServer(worldName string, mcVersion string) error {
	// TODO: tmux 세션 생성, 서버 실행 스크립트 연결, worldName/mcVersion 주입 처리
	return errors.New("TODO: StartMinecraftServer is not implemented yet")
}

func StopMinecraftServer() error {
	// TODO: tmux 세션에 종료 신호를 보내고 세션 정리 로직 추가
	return errors.New("TODO: StopMinecraftServer is not implemented yet")
}
