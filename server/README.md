# Go Backend Server

Minecraft 서버 관리를 위한 Go 백엔드 API 서버입니다.

## 기능

- ✅ RESTful API
- ✅ WebSocket 실시간 통신
- ✅ Docker 컨테이너 제어
- ✅ RCON을 통한 Minecraft 서버 제어
- ✅ 월드 관리 (생성, 삭제, 복구, 선택)
- ✅ JWT 인증 (구현 예정)

## 설치

```bash
# 의존성 설치
go mod download

# 빌드
go build -o server ./cmd/api

# 실행
./server
```

## 환경 변수

`.env.example`을 `.env`로 복사하고 적절한 값을 설정하세요.

```bash
cp .env.example .env
```

## API 엔드포인트

### 서버 관리

- `GET /api/v1/health` - 헬스 체크
- `GET /api/v1/server/status` - 서버 상태 조회
- `GET /api/v1/server/players` - 플레이어 목록 조회
- `POST /api/v1/server/start` - 서버 시작 (인증 필요)
- `POST /api/v1/server/stop` - 서버 종료 (인증 필요)

### 월드 관리

- `GET /api/v1/worlds` - 월드 목록
- `GET /api/v1/worlds/trash` - 휴지통 목록
- `POST /api/v1/worlds` - 월드 생성 (인증 필요)
- `PUT /api/v1/worlds/:name` - 월드 이름 변경 (인증 필요)
- `DELETE /api/v1/worlds/:name` - 월드 삭제 (인증 필요)
- `POST /api/v1/worlds/:name/restore` - 월드 복구 (인증 필요)
- `POST /api/v1/worlds/:name/select` - 월드 선택 (인증 필요)

### WebSocket

- `WS /ws` - 실시간 업데이트

## 개발

```bash
# 개발 모드 (hot reload with air)
air

# 테스트
go test ./...

# 포맷팅
go fmt ./...
```

## 라즈베리파이 빌드

```bash
# ARM64용 크로스 컴파일
GOOS=linux GOARCH=arm64 go build -o server-arm64 ./cmd/api

# 라즈베리파이로 복사
scp server-arm64 pi@raspberrypi:/home/pi/mc-bot/server
```
