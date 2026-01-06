#!/bin/sh

# entrypoint.sh - Paper 서버 자동 설정 및 실행

set -e

echo "[Paper Server] 초기화 중..."

# EULA 확인
if [ "$EULA" != "true" ]; then
  echo "[ERROR] EULA=true를 설정해주세요"
  exit 1
fi

# eula.txt 생성
echo "eula=true" > /data/eula.txt

# server.properties 업데이트 (월드 변경 시에도 필요)
WORLD_NAME="${LEVEL:-world}"
DIFFICULTY="3"
GAMEMODE="0"
LEVEL_TYPE="minecraft:normal"

# worldSettings.json에서 설정 읽기
if [ -f /config/worldSettings.json ]; then
  echo "[Paper Server] worldSettings.json에서 '${WORLD_NAME}' 설정 로드 중..."
  
  # jq를 사용해 해당 월드의 설정 추출
  WORLD_SETTINGS=$(jq ".\"${WORLD_NAME}\"" /config/worldSettings.json 2>/dev/null)
  
  if [ "$WORLD_SETTINGS" != "null" ] && [ -n "$WORLD_SETTINGS" ]; then
    # 난이도 변환 (문자열 -> 숫자)
    DIFFICULTY_STR=$(echo "$WORLD_SETTINGS" | jq -r '.difficulty // "hard"')
    case "$DIFFICULTY_STR" in
      peaceful) DIFFICULTY=0 ;;
      easy) DIFFICULTY=1 ;;
      normal) DIFFICULTY=2 ;;
      hard) DIFFICULTY=3 ;;
      *) DIFFICULTY=3 ;;
    esac
    
    # 게임모드 변환 (문자열 -> 숫자)
    GAMEMODE_STR=$(echo "$WORLD_SETTINGS" | jq -r '.gameMode // "survival"')
    case "$GAMEMODE_STR" in
      survival) GAMEMODE=0 ;;
      creative) GAMEMODE=1 ;;
      adventure) GAMEMODE=2 ;;
      spectator) GAMEMODE=3 ;;
      *) GAMEMODE=0 ;;
    esac
    
    # 지형 설정
    LEVEL_TYPE=$(echo "$WORLD_SETTINGS" | jq -r '.["level-type"] // "minecraft:normal"')
    
    echo "[Paper Server] 로드된 설정: 난이도=$DIFFICULTY_STR, 게임모드=$GAMEMODE_STR, 지형=$LEVEL_TYPE"
  else
    echo "[Paper Server] '${WORLD_NAME}' 설정을 찾을 수 없음 (기본값 사용)"
  fi
else
  echo "[Paper Server] worldSettings.json을 찾을 수 없음 (기본값 사용)"
fi

# server.properties 업데이트 (초기 생성 또는 월드 변경 시)
cat > /data/server.properties << EOF
server-port=25565
server-ip=0.0.0.0
max-players=10
enable-rcon=true
rcon.password=0808
rcon.port=25575
level-name=${WORLD_NAME}
difficulty=${DIFFICULTY}
gamemode=${GAMEMODE}
level-type=${LEVEL_TYPE}
EOF

# VERSION 처리 (기본값: LATEST)
if [ "$VERSION" = "LATEST" ] || [ -z "$VERSION" ]; then
  echo "[Paper Server] 최신 버전 확인 중..."
  VERSION=$(curl -s https://api.papermc.io/v2/projects/paper | jq -r '.versions[-1]')
  echo "[Paper Server] 최신 버전: $VERSION"
fi

# jar 파일명
JAR_FILE="paper-$VERSION.jar"
JAR_PATH="/data/$JAR_FILE"

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
find /data -maxdepth 1 -name "paper-*.jar" ! -name "$JAR_FILE" -delete

echo "[Paper Server] 서버 시작 (버전: $VERSION, 메모리: $MEMORY)..."
exec java -Xmx$MEMORY -Xms$MEMORY -XX:+AlwaysPreTouch -XX:+ParallelRefProcEnabled -XX:+UnlockDiagnosticVMOptions -XX:G1SummarizeRSetStatsPeriod=1 -XX:G1HeapRegionSize=8M -XX:MaxGCPauseMillis=200 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1NewCollectionHeuristicPercent=20 -XX:G1ReservePercent=20 -XX:MaxTenuringThreshold=1 -XX:+PerfDisableSharedMem -XX:G1MixedGCCountTarget=8 -XX:MaxMetaspaceSize=2G -XX:+UseG1GC -jar "$JAR_PATH" nogui
