# Minecraft_discord_bot
마인크래프트 서버를 관리하기 귀찮아 만든 디스코드 봇

서버 상태 확인, 플레이어 목록 조회, 서버 시작 및 종료, 월드 관리, squaremap 플러그인 관리 등의 기능이 있음

# 주요 기능

- 서버 관리
	- 서버 이름과 상태 확인 (`/chech`)
	- 플레이어 목록 확인 (`/players`)
	- 서버 시작 (`/start`)
	- 서버 종료 (`/stop`)
	- 서버 자동 종료 기능
- 월드 관리
	- 저장된 월드 목록 확인 (`/list`)
	- 삭제된 월드 목록 확인 (`/trashlist`)
	- 월드 생성 (`/create <월드 이름>`)
	- 월드 선택 (`/select <월드 이름>`)
	- 월드 이름 변경 (`/rename <현재 이름> <새 이름>`)
	- 월드 삭제 (`/remove <월드 이름>`)
	- 월드 복구 (`/restore <월드 이름>`)
	- 삭제된 월드는 최대 30일 동안 보관
- squaremap 플러그인 관리
	- 지도 확인 (`/map`)
	- 지도 렌더 시작 (`/maprender`)
	- 지도 렌더 취소 (`/cancelrender`)
	- 지도 리셋 (`/resetmap`)

# 요구 사항

- python 3.8 이상
- discord.py 라이브러리
- mcrcon 라이브러리
- .env 파일 (디스코드 봇 토큰,마지막으로 선택된 월드 등의 변수 설정)
- tmux 프로그램 (세션을 확인하여 서버 켜짐 여부 확인)

# 주의 사항

- 봇이 제대로 작동하려면 마인크래프트 서버가 RCON을 활성화해야 합니다
- 서버가 실행 중일 때 월드를 변경하거나 삭제할 수 없습니다
