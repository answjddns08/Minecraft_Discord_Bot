# 🎮 Minecraft Server Manager

> Discord 봇과 웹 대시보드를 통해 마인크래프트 서버를 관리하는 통합 솔루션

Discord bot + Web dashboard for managing your Minecraft server with ease.

---

## 📚 프로젝트 구조

```
MC_bot/
├── bot/                    # Discord 봇 (Node.js)
├── server/                 # 백엔드 API (Go + Fiber)
├── web/                    # 프론트엔드 (React + Vite)
├── shared/                 # 공유 코드 및 설정
│   ├── functions/          # 공통 함수
│   └── config/             # 설정 파일
└── docker-compose.full.yml # 전체 스택 Docker Compose
```

## 🚀 주요 기능

### Discord 봇
- ✅ 서버 시작/종료
- ✅ 서버 상태 확인
- ✅ 플레이어 목록 조회
- ✅ 월드 관리 (생성, 삭제, 선택, 복구)
- ✅ 자동 서버 종료

### 웹 대시보드
- ✅ 실시간 서버 상태 모니터링
- ✅ 서버 제어 (시작/종료)
- ✅ 월드 관리 인터페이스
- ✅ WebSocket 실시간 업데이트
- ✅ 반응형 UI (Tailwind CSS)

### 백엔드 API
- ✅ RESTful API (Go + Fiber)
- ✅ Docker 컨테이너 제어
- ✅ RCON을 통한 Minecraft 서버 통신
- ✅ WebSocket 지원
- ✅ 낮은 리소스 사용 (라즈베리파이 최적화)

## 🛠️ 기술 스택

| 구성 요소 | 기술 |
|---------|------|
| Discord Bot | Node.js, Discord.js |
| Backend API | Go 1.21, Fiber, Docker SDK |
| Frontend | React 18, Vite, TailwindCSS, TanStack Query |
| Database | 파일 기반 (JSON) |
| Container | Docker, Docker Compose |
| Server | Minecraft (Paper/Spigot) |

## 📦 빠른 시작

### 1. 환경 변수 설정

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

### 2. 개발 모드 실행

```bash
# 터미널 1 - Go API 서버
cd server && go run ./cmd/api

# 터미널 2 - React 프론트엔드
cd web && npm install && npm run dev

# 터미널 3 - Discord 봇
cd bot && npm install && npm run dev
```

### 3. Docker Compose 실행 (프로덕션)

```bash
docker-compose -f docker-compose.full.yml up -d
```

## 🌐 접속 정보

- **웹 대시보드**: http://localhost:5173
- **API 서버**: http://localhost:3000
- **Minecraft 서버**: localhost:25565
- **RCON**: localhost:25575

## 🎯 API 엔드포인트

### Server Management
- `GET /api/v1/health` - 헬스 체크
- `GET /api/v1/server/status` - 서버 상태
- `GET /api/v1/server/players` - 플레이어 목록
- `POST /api/v1/server/start` - 서버 시작 🔒
- `POST /api/v1/server/stop` - 서버 종료 🔒

### World Management
- `GET /api/v1/worlds` - 월드 목록
- `GET /api/v1/worlds/trash` - 휴지통 목록
- `POST /api/v1/worlds` - 월드 생성 🔒
- `PUT /api/v1/worlds/:name` - 월드 이름 변경 🔒
- `DELETE /api/v1/worlds/:name` - 월드 삭제 🔒
- `POST /api/v1/worlds/:name/restore` - 월드 복구 🔒
- `POST /api/v1/worlds/:name/select` - 월드 선택 🔒

### WebSocket
- `WS /ws` - 실시간 업데이트

🔒 = 인증 필요 (Bearer Token)

## 🐳 라즈베리파이 배포

### 방법 1: Docker Compose (권장)
```bash
docker-compose -f docker-compose.full.yml up -d
```

### 방법 2: 네이티브 바이너리
```bash
# ARM64용 Go 바이너리 빌드 (다른 PC에서)
cd server
GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o server-rpi ./cmd/api

# 라즈베리파이로 복사
scp server-rpi pi@raspberrypi:/home/pi/mc-bot/

# 실행
./server-rpi
```

## ⚡ 성능 특징

### Go 백엔드 (라즈베리파이 최적화)
- 메모리 사용: ~20-30MB
- 시작 시간: ~1초
- CPU 사용: 매우 낮음
- ARM64 네이티브 지원

### 웹 대시보드
- 반응형 디자인
- 실시간 WebSocket 업데이트
- 최적화된 번들 크기

## 📝 할 일 (TODO)

### 인증 & 보안
- [ ] JWT 인증 구현
- [ ] 사용자 관리 시스템
- [ ] 역할 기반 권한 관리

### 대시보드 기능
- [ ] 플레이어 통계
- [ ] 서버 콘솔 로그 스트리밍
- [ ] 서버 메트릭 모니터링 (CPU, RAM, Disk)
- [ ] 파일 관리자

### 맵 & 플러그인
- [ ] Dynmap/BlueMap 통합
- [ ] 청크 프리로딩 제어
- [ ] 플러그인 관리 인터페이스

### 백업 & 관리
- [ ] 자동 백업 시스템
- [ ] 백업 스케줄링
- [ ] 월드 다운로드

### 모바일
- [ ] 모바일 최적화
- [ ] PWA 지원
- [ ] React Native 앱

## 📖 문서

- [개발 가이드](DEVELOPMENT.md)
- [API 문서](server/README.md)
- [Docker 가이드](README.docker.md)

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

ISC License

## 👤 작성자

**Redeyes**

## 🙏 감사

- [Discord.js](https://discord.js.org/)
- [Fiber](https://gofiber.io/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

Made with ❤️ for Minecraft server management on Raspberry Pi
