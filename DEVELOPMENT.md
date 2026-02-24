# Development Environment Setup

## Quick Start Guide

### 1. 프로젝트 구조 확인

```bash
tree -L 2 -I 'node_modules|dist|build'
```

### 2. 환경 변수 설정

```bash
# Bot
cp bot/.env.example bot/.env
# 수정: DISCORD_TOKEN, DISCORD_CLIENT_ID

# Server
cp server/.env.example server/.env
# 수정: API_KEY, RCON_PASSWORD

# Web
cp web/.env.example web/.env
# 수정: VITE_API_KEY
```

### 3. 개발 서버 실행

**터미널 1 - Go API 서버**

```bash
cd server
go run ./cmd/api
```

**터미널 2 - React 프론트엔드**

```bash
cd web
npm run dev
```

**터미널 3 - Discord 봇**

```bash
cd bot
npm run dev
```

## 라즈베리파이 최적화 팁

### Go 백엔드

- 메모리 사용량: ~20-30MB
- 시작 시간: ~1초
- CPU 사용량: 매우 낮음

### 크로스 컴파일

```bash
# 라즈베리파이용 빌드 (다른 PC에서)
cd server
GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o server-rpi ./cmd/api

# 바이너리 압축 (선택사항)
upx --best --lzma server-rpi

# 복사
scp server-rpi pi@raspberrypi:/home/pi/mc-bot/
```

## 웹 대시보드 기능

### 현재 구현됨

- [x] 서버 상태 실시간 모니터링
- [x] 서버 시작/종료 제어
- [x] 월드 목록 확인
- [x] 월드 생성/삭제/선택
- [x] WebSocket 실시간 업데이트

### 곧 구현 예정

- [ ] 플레이어 목록 및 상세 정보
- [ ] 서버 콘솔 로그 스트리밍
- [ ] 월드 맵 뷰어 (Dynmap 연동)
- [ ] 서버 성능 메트릭
- [ ] 파일 관리자
- [ ] 플러그인 관리

## 플러그인 추천

### 맵 시각화

- **Dynmap**: 2D 맵, 웹 인터페이스
- **BlueMap**: 3D 맵, 모던한 UI
- **Pl3xMap**: 경량, 빠른 렌더링

### 청크 프리로딩

- **Chunky**: 월드 프리로드
- **ChunkMaster**: 자동 청크 생성

## 문제 해결

### Go 서버가 Docker에 연결 안됨

```bash
# Docker 소켓 권한 확인
ls -la /var/run/docker.sock
sudo chmod 666 /var/run/docker.sock
```

### RCON 연결 실패

```bash
# Minecraft 서버 설정 확인
docker exec minecraft-server cat /data/server.properties | grep rcon
```

### WebSocket 연결 안됨

- 방화벽 확인
- CORS 설정 확인
- 브라우저 콘솔 에러 확인
