# Node.js 이미지 사용
FROM node:20-alpine

# Docker CLI 설치 (봇이 서버 컨테이너 제어용)
RUN apk add --no-cache docker-cli

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 애플리케이션 파일 복사
COPY . .

# 로그 디렉토리 생성
RUN mkdir -p /app/logs

# 마인크래프트 관련 디렉토리 생성
RUN mkdir -p /minecraft/worlds /minecraft/worlds-trash /minecraft/server

# 포트 노출 (필요한 경우)
# EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production

# 애플리케이션 실행
CMD ["node", "index.js"]
