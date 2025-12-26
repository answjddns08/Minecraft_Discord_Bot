#!/bin/bash
# 로컬 개발 환경 설정 스크립트

echo "🔧 로컬 개발 환경으로 전환 중..."

# config 파일 교체
cp config.local.json config.json

echo "✅ config.json을 로컬 경로로 변경했습니다."
echo ""
echo "📝 .env 파일에서 토큰을 테스트봇으로 변경하세요:"
echo "   DISCORD_TOKEN=<testbot_token>"
echo "   DISCORD_CLIENT_ID=<testbot_id>"
echo ""
echo "🚀 실행: npm run dev 또는 node index.js"
