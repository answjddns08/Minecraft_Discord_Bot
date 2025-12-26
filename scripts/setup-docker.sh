#!/bin/bash
# Docker 환경 설정 스크립트

echo "🐳 Docker 환경으로 전환 중..."

# Docker용 config 복원
cat > config.json << 'EOF'
{
	"sessionName": "Minecraft_Server",
	"sessionCommand": "docker exec minecraft-server rcon-cli",
	"minecraftDir": "/minecraft/server",
	"worldDir": "/minecraft/worlds",
	"TrashWorldDir": "/minecraft/worlds-trash",
	"thumbnailDir": "/minecraft/server/server-icon.png",
	"thumbnailFile": "server-icon.png",
	"WorldAgeDay": 7,
	"worldLevelName": "world",
	"RCsettings": {
		"host": "minecraft-server",
		"port": 25575,
		"password": "0808"
	},
	"lastWorld": ""
}
EOF

echo "✅ config.json을 Docker 경로로 변경했습니다."
echo ""
echo "📝 .env 파일에서 토큰을 프로덕션 봇으로 변경하세요:"
echo "   DISCORD_TOKEN=<production_token>"
echo "   DISCORD_CLIENT_ID=<production_id>"
echo ""
echo "🚀 실행: docker compose up -d --build"
