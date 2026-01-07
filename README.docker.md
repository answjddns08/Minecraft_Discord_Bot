# Docker로 Minecraft Discord Bot 실행하기

## 사전 준비

1. **Docker 및 Docker Compose 설치 확인**

   ```bash
   docker --version
   docker compose version
   ```

2. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일을 열어서 실제 값 입력
   nano .env
   ```

## 실행 방법

### 1. 처음 실행 (이미지 빌드 포함)

```bash
# 디스코드 봇만 실행 (마인크래프트 서버는 봇 명령어로 시작)
docker compose up -d --build discord-bot

# 개발 모드로 실행 (코드 변경 시 자동 재시작)
docker compose --profile dev up -d --build discord-bot-dev
```

### 2. 마인크래프트 서버 시작

Discord 봇의 `/start` 명령어를 사용하여 마인크래프트 서버를 시작합니다.
서버는 필요할 때 봇이 `docker compose up`으로 자동 시작합니다.

```bash
# 또는 수동으로 서버 시작
MC_VERSION=1.21.4 MC_LEVEL=my-world docker compose up -d minecraft-server
```

### 3. 로그 확인

```bash
# 모든 서비스 로그
docker compose logs -f

# 봇 로그만
docker compose logs -f discord-bot

# 마인크래프트 서버 로그만 (서버가 실행 중일 때)
docker compose logs -f minecraft-server
```

### 4. 상태 확인

```bash
docker compose ps
```

### 5. 봇 중지

```bash
docker compose stop discord-bot
```

### 6. 완전 종료 (컨테이너 삭제)

```bash
# 봇만 종료
docker compose down

# 모든 컨테이너 종료 (서버 포함)
docker compose down
```

## 유용한 명령어

### 봇 컨테이너 접속

```bash
docker exec -it minecraft-discord-bot sh
```

### 마인크래프트 서버 콘솔 접속

```bash
docker exec -i minecraft-server rcon-cli
```

### 마인크래프트 서버에 명령어 실행

```bash
docker exec minecraft-server rcon-cli "list"
docker exec minecraft-server rcon-cli "say Hello from Docker!"
```

### 실시간 리소스 모니터링

```bash
docker stats
```

## 디렉토리 구조

```
/home/redeyes/Documents/MC_bot/
├── docker-compose.yml       # Docker Compose 설정
├── Dockerfile              # Bot 이미지 설정
├── .env                    # 환경 변수 (비공개)
├── config.json             # 로컬 실행용 설정
├── docker-config.json      # Docker 실행용 설정
└── ...
```

## 주요 기능

### 버전 관리

- `/setversion`: 마인크래프트 서버 버전 설정 (Paper MC 최신 10개 버전 중 선택)
- 버전은 `.env` 파일에 저장되어 봇 재시작 후에도 유지됩니다

### 서버 관리

- `/start`: 서버 시작 (설정된 버전과 월드로 자동 시작)
- `/stop`: 서버 종료 (플레이어가 없을 때만 가능)
- `/check`: 서버 상태, 플레이어 목록, 버전 확인

### 월드 관리

- `/create`: 새 월드 생성
- `/select`: 플레이할 월드 선택
- `/list`: 저장된 월드 목록 확인
- 각 월드마다 난이도, 게임모드, 지형 타입 설정 가능

## 데이터 저장 위치

호스트 디렉토리에 직접 마운트됩니다:

- `/home/redeyes/Documents/mc-data/server`: 마인크래프트 서버 데이터
- `/home/redeyes/Documents/mc-data/worlds`: 월드 데이터
- `/home/redeyes/Documents/mc-data/worlds-trash`: 삭제된 월드

데이터 확인:

```bash
ls -la /home/redeyes/Documents/mc-data/
```

## 문제 해결

### 1. 포트 충돌

이미 25565 포트를 사용 중이라면 docker-compose.yml에서 포트 변경:

```yaml
ports:
  - "25566:25565"
```

### 2. 메모리 부족

docker-compose.yml에서 메모리 설정 조정:

```yaml
environment:
  MEMORY: "1G" # 2G에서 1G로 줄이기
```

### 3. 로그 확인

```bash
docker compose logs -f discord-bot
docker compose logs -f minecraft-server --tail 100
```

### 4. 컨테이너 재시작

```bash
docker compose restart discord-bot
docker compose restart minecraft-server
```

## 백업

### 수동 백업

```bash
# 전체 마인크래프트 데이터 백업
tar czf mc-data-backup-$(date +%Y%m%d).tar.gz /home/redeyes/Documents/mc-data/

# 월드만 백업
tar czf worlds-backup-$(date +%Y%m%d).tar.gz /home/redeyes/Documents/mc-data/worlds/
```

### 복원

```bash
tar xzf mc-data-backup-YYYYMMDD.tar.gz -C /
```

## 업데이트

### 봇 업데이트

```bash
git pull
docker compose up -d --build discord-bot
```

### 마인크래프트 서버 업데이트

```bash
docker compose pull minecraft-server
docker compose up -d minecraft-server
```

## 네트워크

봇과 서버는 다음과 같이 연결됩니다:

- **봇 컨테이너**: `host` 네트워크 모드 사용 (호스트의 Docker 소켓에 직접 접근)
- **서버 컨테이너**: `minecraft-network` 브리지 네트워크 사용
- 봇이 서버를 제어하기 위해 Docker API를 사용합니다

RCON 연결:

- 호스트: `minecraft-server` (컨테이너 이름)
- 포트: `25575`
- 비밀번호: config.json에 설정된 값

## 환경 변수

`.env` 파일에서 설정:

```bash
# 필수
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id

# 선택 (기본값: LATEST)
MC_VERSION=1.21.4
```

버전 변경 방법:

1. Discord에서 `/setversion` 명령어 사용 (권장)
2. `.env` 파일 직접 수정 후 서버 재시작

## 주의사항

1. `.env` 파일은 절대 Git에 커밋하지 마세요
2. RCON 비밀번호는 `config.json`과 `docker-compose.yml`에서 동일해야 합니다
3. 처음 실행 시 마인크래프트 서버 초기화에 1-2분 소요됩니다
4. 서버 메모리는 최소 2GB 이상 권장합니다
