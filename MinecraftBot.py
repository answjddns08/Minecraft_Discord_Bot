import discord
from discord.ext import commands
from mcrcon import MCRcon
import os
from dotenv import load_dotenv
import subprocess

# RCON 및 디스코드 설정
RCON_HOST = "127.0.0.1"  # 마인크래프트 서버 주소
RCON_PORT = 25575  # RCON 포트
RCON_PASSWORD = "0808"  # RCON 비밀번호

load_dotenv()

TOKEN = os.getenv('MinecraftBot')
CHANNEL_ID = 1080485159696089170  # 메시지를 보낼 채널 ID

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="/", intents=intents)

server_up = False

async def check_server_status(): #마크 서버 상태 확인 함수
    global server_up
    try:
        with MCRcon(RCON_HOST, RCON_PASSWORD, port=RCON_PORT) as mcr:
            response = mcr.command("list")  # 서버 상태 확인 명령어 (플레이어 목록)
            if "players" in response:
                server_up = True
            else:
                server_up = False
    except Exception as e:
        print(f"서버 상태 확인 중 오류 발생: {e}")
        server_up = False


async def send_discord_message(message): # 특정 체널에 메세지 보내는 함수
    channel = bot.get_channel(CHANNEL_ID)
    if channel and isinstance(channel, discord.TextChannel):
        await channel.send(message)
    else:
        print("⚠️ 오류: 채널이 TextChannel이 아닙니다")


@bot.event
async def on_ready():
    await bot.tree.sync()  # 슬래시 명령어 동기화
    print(f"Logged in as {bot.user}")

@bot.command()
async def bye(ctx):
    print("activated")
    await ctx.send("Goodbye!")

@bot.tree.command(name="hello", description="Say hello!")
async def hello(interaction: discord.Interaction):
    await interaction.response.send_message("Hello, World! 👋")

@bot.tree.command(name="check", description="Check the server")
async def check_server(interaction: discord.Interaction):
    await check_server_status()
    if server_up:
        await interaction.response.send_message("🎮 마인크래프트 서버가 켜져 있습니다!")
    else:
        await interaction.response.send_message("🛑 마인크래프트 서버가 꺼져 있습니다.")

bot.run(TOKEN)