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
docker compose up -d --build
```

### 2. 일반 실행

```bash
docker compose up -d
```

### 3. 로그 확인

```bash
# 모든 서비스 로그
docker compose logs -f

# 봇 로그만
docker compose logs -f discord-bot

# 마인크래프트 서버 로그만
docker compose logs -f minecraft-server
```

### 4. 상태 확인

```bash
docker compose ps
```

### 5. 중지

```bash
docker compose stop
```

### 6. 완전 종료 (컨테이너 삭제)

```bash
docker compose down
```

### 7. 완전 초기화 (볼륨까지 삭제)

```bash
docker compose down -v
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

## 데이터 저장 위치

Docker 볼륨에 데이터가 저장됩니다:

- `minecraft-server`: 마인크래프트 서버 데이터
- `minecraft-worlds`: 월드 데이터
- `minecraft-worlds-trash`: 삭제된 월드

볼륨 확인:

```bash
docker volume ls
docker volume inspect mc_bot_minecraft-worlds
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
# 월드 데이터 백업
docker run --rm -v mc_bot_minecraft-worlds:/data -v $(pwd):/backup alpine tar czf /backup/worlds-backup-$(date +%Y%m%d).tar.gz -C /data .

# 서버 데이터 백업
docker run --rm -v mc_bot_minecraft-server:/data -v $(pwd):/backup alpine tar czf /backup/server-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### 복원

```bash
docker run --rm -v mc_bot_minecraft-worlds:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/worlds-backup-YYYYMMDD.tar.gz"
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

봇과 서버는 `minecraft-network`라는 브리지 네트워크로 연결되어 있습니다.
봇에서 서버에 접근할 때는 `minecraft-server`라는 호스트명을 사용합니다.

## 주의사항

1. `.env` 파일은 절대 Git에 커밋하지 마세요
2. RCON 비밀번호는 `config.json`과 `docker-compose.yml`에서 동일해야 합니다
3. 처음 실행 시 마인크래프트 서버 초기화에 1-2분 소요됩니다
4. 서버 메모리는 최소 2GB 이상 권장합니다
