# 🎮 Minecraft Discord Bot

> Discord에서 마인크래프트 서버를 편하게 관리할 수 있는 봇입니다.

A Discord bot that allows you to manage your Minecraft server directly from Discord.

---

## 📚 Language / 언어

- [한글](#한글)
- [English](#english)

---

## 한글

### 소개

이 프로젝트는 마인크래프트 서버 관리를 자동화하고 간편하게 하기 위해 만들어진 **Discord 봇**입니다.

- **모듈화된 구조**: 각 기능이 독립적으로 분리되어 있어 가독성과 유지보수성이 우수합니다
- **Docker 지원**: Docker 환경과 로컬 환경 모두에서 실행 가능합니다
- **자동화 기능**: 스케줄된 작업으로 서버를 자동으로 관리할 수 있습니다

### 🎯 주요 기능

#### 🖥️ 서버 관리

- **상태 확인** (`/check`) - 서버 이름, 플레이 중인 플레이어, 버전, 상태를 확인합니다
- **플레이어 조회** (`/players`) - 현재 접속한 플레이어 목록을 확인합니다
- **서버 시작** (`/start`) - 서버를 시작합니다
- **서버 종료** (`/stop`) - 서버를 정상 종료합니다

#### 🌍 월드 관리

- **월드 목록** (`/list`) - 생성된 모든 월드를 확인합니다
- **휴지통 목록** (`/trashlist`) - 삭제된 월드를 확인합니다
- **월드 생성** (`/create <월드 이름>`) - 새로운 월드를 생성합니다
- **월드 선택** (`/select`) - 활성화할 월드를 선택합니다
- **월드 이름 변경** (`/rename <현재 이름> <새 이름>`) - 월드 이름을 변경합니다
- **월드 삭제** (`/remove`) - 월드를 휴지통으로 이동합니다
- **월드 복구** (`/restore`) - 휴지통의 월드를 복구합니다

#### ⚙️ 월드별 설정

각 월드마다 개별적으로 설정할 수 있습니다:

- **지형 생성 방식** (평지, 초대형 숲, 산맥 등)
- **난이도** (평화, 쉬움, 보통, 어려움)
- **게임 모드** (생존 모드, 창의 모드, 모험 모드, 관찰자 모드)
- **OP 권한 설정** - 플레이어에게 관리자 권한을 부여합니다

#### 🤖 자동화 기능

- **자동 종료** - 플레이어가 없을 때 서버를 자동으로 종료합니다
- **스케줄 관리** - 정해진 시간에 자동으로 작업을 실행합니다
- **휴지통 정리** - 오래된 삭제된 월드를 자동으로 제거합니다

### 📋 요구 사항

- **Node.js** v14 이상
- **Discord 봇** (Discord Developer Portal에서 생성)
- **마인크래프트 서버** (RCON 활성화 필수)

**의존 라이브러리:**

- `discord.js` - Discord API 통합
- `rcon-client` - 마인크래프트 RCON 연결
- `node-schedule` - 자동 작업 스케줄링
- `dotenv` - 환경 변수 관리
- `dockerode` - Docker 컨테이너 관리 (Docker 사용 시)

### 🚀 설치 및 실행

#### 1. 프로젝트 클론 및 설치

```bash
git clone https://github.com/yourname/minecraft-discord-bot.git
cd minecraft-discord-bot
npm install
```

#### 2. 환경 설정

**.env 파일 생성:**

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
DOCKER_ENV=false  # Docker 환경이면 true로 설정
```

**config.json 수정:**

```json
{
	"sessionName": "Minecraft_Server", // tmux 세션 이름 (로컬 환경)
	"sessionCommand": "docker exec minecraft-server mcrcon ...", // Docker 명령어
	"minecraftDir": "/path/to/minecraft/server", // 마인크래프트 서버 디렉토리
	"worldDir": "/path/to/worlds", // 월드 저장 디렉토리
	"TrashWorldDir": "/path/to/worlds-trash", // 삭제된 월드 저장 디렉토리
	"WorldAgeDay": 7, // 휴지통 월드 자동 삭제 기간 (일)
	"worldLevelName": "world", // 기본 월드 이름
	"currentVersion": "1.21.11", // 마인크래프트 버전
	"RCsettings": {
		"host": "localhost", // RCON 호스트
		"port": 25575, // RCON 포트
		"password": "your_rcon_password" // RCON 비밀번호
	}
}
```

#### 3. 실행

**개발 환경:**

```bash
npm run dev:watch  # nodemon 사용 (파일 변경 시 자동 재시작)
```

**프로덕션 환경:**

```bash
npm start
```

**Docker에서 실행:**

```bash
docker-compose up -d
```

### ⚠️ 주의 사항

1. **RCON 활성화 필수** - 마인크래프트 server.properties에서 RCON을 활성화해야 합니다:

   ```properties
   enable-rcon=true
   rcon.port=25575
   rcon.password=your_password
   ```

2. **서버 상태 확인** - 서버가 실행 중일 때 월드를 변경하거나 삭제할 수 없습니다

3. **권한 설정** - 봇이 서버 디렉토리와 파일에 접근할 수 있는 권한이 필요합니다

### 📁 프로젝트 구조

```
.
├── commands/              # Discord 슬래시 명령어
│   ├── MCserver/          # 서버 관리 명령어
│   └── world/             # 월드 관리 명령어
├── events/                # Discord 이벤트 핸들러
├── functions/             # 핵심 기능 함수
├── logs/                  # 로그 파일
├── config.json            # 설정 파일
├── config.local.json      # 로컬 환경 설정 (선택사항)
├── index.js               # 메인 진입점
├── Dockerfile             # Docker 설정
├── docker-compose.yml     # Docker Compose 설정
└── package.json           # Node.js 패키지 설정
```

### 👨‍💻 개발자

- **Redeyes** - 주요 개발자

### 📄 라이선스

ISC License

---

## English

### Introduction

This project is a **Discord bot** designed to automate and simplify Minecraft server management.

- **Modular Architecture**: Each feature is independently separated for excellent readability and maintainability
- **Docker Support**: Can run on both Docker and local environments
- **Automation Features**: Automatically manage your server with scheduled tasks

### 🎯 Key Features

#### 🖥️ Server Management

- **Check Status** (`/check`) - View server name, online players, version, and status
- **List Players** (`/players`) - See currently connected players
- **Start Server** (`/start`) - Start the server
- **Stop Server** (`/stop`) - Gracefully stop the server

#### 🌍 World Management

- **List Worlds** (`/list`) - View all created worlds
- **List Trash** (`/trashlist`) - View deleted worlds
- **Create World** (`/create <world_name>`) - Create a new world
- **Select World** (`/select`) - Choose which world to activate
- **Rename World** (`/rename <old_name> <new_name>`) - Rename a world
- **Delete World** (`/remove`) - Move a world to trash
- **Restore World** (`/restore`) - Restore a world from trash

#### ⚙️ Per-World Settings

Customize each world individually:

- **Terrain Type** (Flat, Large Biomes, Mountains, etc.)
- **Difficulty** (Peaceful, Easy, Normal, Hard)
- **Game Mode** (Survival, Creative, Adventure, Spectator)
- **OP Permissions** - Grant admin rights to players

#### 🤖 Automation Features

- **Auto Shutdown** - Automatically stop the server when no players are online
- **Scheduled Tasks** - Run tasks at specified times
- **Trash Cleanup** - Automatically remove old deleted worlds

### 📋 Requirements

- **Node.js** v14 or higher
- **Discord Bot** (created from Discord Developer Portal)
- **Minecraft Server** (RCON must be enabled)

**Dependencies:**

- `discord.js` - Discord API integration
- `rcon-client` - Minecraft RCON connection
- `node-schedule` - Automated task scheduling
- `dotenv` - Environment variable management
- `dockerode` - Docker container management (for Docker usage)

### 🚀 Installation & Setup

#### 1. Clone and Install

```bash
git clone https://github.com/yourname/minecraft-discord-bot.git
cd minecraft-discord-bot
npm install
```

#### 2. Configuration

**Create .env file:**

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
DOCKER_ENV=false  # Set to true if running in Docker
```

**Update config.json:**

```json
{
	"sessionName": "Minecraft_Server", // tmux session name (local)
	"sessionCommand": "docker exec minecraft-server mcrcon ...", // Docker command
	"minecraftDir": "/path/to/minecraft/server", // Server directory
	"worldDir": "/path/to/worlds", // World save directory
	"TrashWorldDir": "/path/to/worlds-trash", // Deleted world directory
	"WorldAgeDay": 7, // Auto-delete trash worlds after N days
	"worldLevelName": "world", // Default world name
	"currentVersion": "1.21.11", // Minecraft version
	"RCsettings": {
		"host": "localhost", // RCON host
		"port": 25575, // RCON port
		"password": "your_rcon_password" // RCON password
	}
}
```

#### 3. Run

**Development:**

```bash
npm run dev:watch  # Auto-restart on file changes with nodemon
```

**Production:**

```bash
npm start
```

**Docker:**

```bash
docker-compose up -d
```

### ⚠️ Important Notes

1. **RCON Must Be Enabled** - Enable RCON in server.properties:

   ```properties
   enable-rcon=true
   rcon.port=25575
   rcon.password=your_password
   ```

2. **Active Server** - Cannot change or delete worlds while the server is running

3. **File Permissions** - The bot needs read/write access to the server directories

### 📁 Project Structure

```
.
├── commands/              # Discord slash commands
│   ├── MCserver/          # Server management commands
│   └── world/             # World management commands
├── events/                # Discord event handlers
├── functions/             # Core functionality functions
├── logs/                  # Log files
├── config.json            # Configuration file
├── config.local.json      # Local configuration (optional)
├── index.js               # Main entry point
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── package.json           # Node.js package configuration
```

### 👨‍💻 Developer

- **Redeyes** - Main Developer

### 📄 License

ISC License
