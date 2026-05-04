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

# PaperMC API endpoints
VERSION_API_BASE="https://fill.papermc.io/v3/projects/paper"
TMP_DIR="/data/server/.paper_api_debug"
mkdir -p "$TMP_DIR"

# VERSION 처리 (기본값: LATEST)
if [ -z "$VERSION" ] || [ "$VERSION" = "LATEST" ]; then
  echo "[Paper Server] 최신 버전 확인 중..."
  API_RAW=$(curl -s "$VERSION_API_BASE")
  echo "$API_RAW" > "$TMP_DIR/base.json"

  VERSION=$(printf '%s' "$API_RAW" | jq -r '
    .versions
    | if type == "array" then . else (to_entries | map(.value) | add) end
    | .[]
    | select(test("^[0-9]+(\\.[0-9]+)*$"))
  ' | sort -u -V | tail -n 1) || {
    echo "[ERROR] 최신 버전 파싱 실패 — 원본 응답 출력 (saved to $TMP_DIR/base.json):"
    cat "$TMP_DIR/base.json"
    echo "--- jq error ---"
    exit 1
  }

  if [ -z "$VERSION" ] || [ "$VERSION" = "null" ]; then
    echo "[ERROR] 최신 버전 조회 실패"
    exit 1
  fi

  echo "[Paper Server] 최신 버전: $VERSION"
fi

# 선택한 버전의 최신 빌드 및 다운로드 메타데이터 가져오기
echo "[Paper Server] 버전 $VERSION의 빌드 정보 확인 중..."
BUILD_RAW=$(curl -s "$VERSION_API_BASE/versions/$VERSION/builds")
echo "$BUILD_RAW" > "$TMP_DIR/version.json"

BUILD_ID=$(printf '%s' "$BUILD_RAW" | jq -r '.[0].id // empty' 2> "$TMP_DIR/jq_builds.err") || {
  echo "[ERROR] 빌드 번호 파싱 실패 — 원본 응답 출력 (saved to $TMP_DIR/version.json):"
  cat "$TMP_DIR/version.json"
  echo "--- jq error ---"
  cat "$TMP_DIR/jq_builds.err" >&2
  exit 1
}

if [ -z "$BUILD_ID" ] || [ "$BUILD_ID" = "null" ]; then
  echo "[ERROR] 버전 $VERSION을 찾을 수 없습니다"
  exit 1
fi

DOWNLOAD_URL=$(printf '%s' "$BUILD_RAW" | jq -r '.[0].downloads."server:default".url // empty' 2> "$TMP_DIR/jq_download.err") || {
  echo "[ERROR] 다운로드 URL 파싱 실패 — 원본 응답 출력 (saved to $TMP_DIR/version.json):"
  cat "$TMP_DIR/version.json"
  echo "--- jq error ---"
  cat "$TMP_DIR/jq_download.err" >&2
  exit 1
}

DOWNLOAD_NAME=$(printf '%s' "$BUILD_RAW" | jq -r '.[0].downloads."server:default".name // empty')

if [ -z "$DOWNLOAD_URL" ] || [ -z "$DOWNLOAD_NAME" ]; then
  echo "[ERROR] 빌드 $BUILD_ID의 다운로드 정보를 가져오지 못했습니다 — 원본 응답 (saved to $TMP_DIR/version.json):"
  cat "$TMP_DIR/version.json"
  echo "--- jq error (download parse) ---"
  cat "$TMP_DIR/jq_download.err" >&2 || true
  exit 1
fi

echo "[Paper Server] 빌드 번호: $BUILD_ID"

JAR_FILE="$DOWNLOAD_NAME"
JAR_PATH="/data/server/$JAR_FILE"

# jar 파일 확인 및 다운로드
if [ ! -f "$JAR_PATH" ]; then
  echo "[Paper Server] jar 파일 다운로드 중... ($JAR_FILE)"
  curl -f -L -o "$JAR_PATH" "$DOWNLOAD_URL" || {
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
