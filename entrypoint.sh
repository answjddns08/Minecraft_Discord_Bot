#!/bin/sh

# entrypoint.sh - Paper 서버 자동 설정 및 실행

set -e

echo "[Paper Server] 초기화 중..."

mkdir -p /data/server /data/worlds /data/worlds-trash
cd /data/server

# EULA 확인
EULA_VALUE=$(printf '%s' "$EULA" | tr '[:upper:]' '[:lower:]')
if [ "$EULA_VALUE" != "true" ]; then
  echo "[ERROR] EULA=true를 설정해주세요"
  exit 1
fi

# eula.txt 생성
echo "eula=true" > /data/server/eula.txt

# server.properties 초기 생성만 (없을 때만)
if [ ! -f /data/server/server.properties ]; then
  echo "[Paper Server] server.properties 초기 생성..."
  cat > /data/server/server.properties << EOF
server-port=25565
server-ip=0.0.0.0
max-players=10
enable-rcon=true
rcon.password=0808
rcon.port=25575
level-name=world
difficulty=3
gamemode=0
level-type=minecraft:normal
EOF
else
  echo "[Paper Server] server.properties 이미 존재 (Discord 봇이 관리)"
fi

# VERSION 처리 (기본값: LATEST)
if [ "$VERSION" = "LATEST" ] || [ -z "$VERSION" ]; then
  echo "[Paper Server] 최신 버전 확인 중..."
  VERSION=$(curl -s https://api.papermc.io/v2/projects/paper | jq -r '.versions[-1]')
  echo "[Paper Server] 최신 버전: $VERSION"
fi

# jar 파일명
JAR_FILE="paper-$VERSION.jar"
JAR_PATH="/data/server/$JAR_FILE"

# jar 파일 확인 및 다운로드
if [ ! -f "$JAR_PATH" ]; then
  echo "[Paper Server] 버전 $VERSION의 빌드 정보 확인 중..."
  
  # 최신 빌드 번호 가져오기
  BUILD=$(curl -s https://api.papermc.io/v2/projects/paper/versions/$VERSION | jq -r '.builds[-1]')
  
  if [ -z "$BUILD" ] || [ "$BUILD" = "null" ]; then
    echo "[ERROR] 버전 $VERSION을 찾을 수 없습니다"
    exit 1
  fi
  
  echo "[Paper Server] 빌드 번호: $BUILD"
  echo "[Paper Server] jar 파일 다운로드 중... ($JAR_FILE)"
  
  DOWNLOAD_URL="https://api.papermc.io/v2/projects/paper/versions/$VERSION/builds/$BUILD/downloads/paper-$VERSION-$BUILD.jar"
  
  curl -f -o "$JAR_PATH" "$DOWNLOAD_URL" || {
    echo "[ERROR] jar 파일 다운로드 실패"
    exit 1
  }
  
  echo "[Paper Server] 다운로드 완료!"
else
  echo "[Paper Server] jar 파일 이미 존재: $JAR_FILE"
fi

# 기존 jar 파일 정리 (다른 버전 제거)
echo "[Paper Server] 다른 버전의 jar 파일 제거 중..."
find /data/server -maxdepth 1 -name "paper-*.jar" ! -name "$JAR_FILE" -delete

echo "[Paper Server] 서버 시작 (버전: $VERSION, 메모리: $MEMORY)..."
exec java -Xmx$MEMORY -Xms$MEMORY \
  -XX:+AlwaysPreTouch \
  -XX:+DisableExplicitGC \
  -XX:+ParallelRefProcEnabled \
  -XX:+PerfDisableSharedMem \
  -XX:+UnlockExperimentalVMOptions \
  -XX:+UseG1GC \
  -XX:G1HeapRegionSize=8M \
  -XX:G1HeapWastePercent=5 \
  -XX:G1MaxNewSizePercent=40 \
  -XX:G1MixedGCCountTarget=4 \
  -XX:G1MixedGCLiveThresholdPercent=90 \
  -XX:G1NewSizePercent=30 \
  -XX:G1RSetUpdatingPauseTimePercent=5 \
  -XX:G1ReservePercent=20 \
  -XX:InitiatingHeapOccupancyPercent=15 \
  -XX:MaxGCPauseMillis=200 \
  -XX:MaxTenuringThreshold=1 \
  -XX:SurvivorRatio=32 \
  -Dusing.aikars.flags=https://mcflags.emc.gs \
  -Daikars.new.flags=true \
  -jar "$JAR_PATH" nogui
