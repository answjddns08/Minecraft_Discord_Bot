import discord
from discord.ext import commands
import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 불러오기
load_dotenv()

# 환경 변수에서 토큰 값 가져오기
TOKEN = os.getenv('testBot')

# 필요한 intents 설정 (default: 기본 intents만 활성화)
intents = discord.Intents.default()

# 봇 인스턴스 생성
bot = commands.Bot(command_prefix='!', intents=intents)

# 봇이 준비 완료되었을 때 실행되는 이벤트
@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}!')

# hello 명령어
@bot.command()
async def hello(ctx):
    await ctx.send("Hello!")

# 봇 실행
bot.run(TOKEN)