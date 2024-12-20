import discord
from discord.ext import commands
from mcrcon import MCRcon
import os
from dotenv import load_dotenv
import subprocess

# .env 파일에서 환경 변수 불러오기
load_dotenv()

# RCON 및 디스코드 설정
RCON_HOST = "127.0.0.1"  # 마인크래프트 서버 주소
RCON_PORT = 25575  # RCON 포트
RCON_PASSWORD = "0808"  # RCON 비밀번호

TMUX_SESSION_NAME = "Minecraft_Server"  # 세션 이름
SERVER_COMMAND = "cd /home/redeyes/Documents/Minecraft/ && ./start.sh"  # 서버 실행 명령어

# 환경 변수에서 토큰 값 가져오기
TOKEN = os.getenv('testBot')

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='/', intents=intents)

def execute_command(command):  # 터미널 명령 실행 함수
    try:
        result = subprocess.check_output(command, shell=True, text=True)
        return result.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {e}")
        return None

def is_server_running():  # tmux 세션 상태 확인
    result = execute_command(f"tmux ls | grep {TMUX_SESSION_NAME}")
    return result is not None

def check_players():
    try:
        # MCRcon 객체 사용
        with MCRcon(RCON_HOST, RCON_PASSWORD, port=RCON_PORT) as mcr:
            response = mcr.command("list")  # 서버 상태 확인 명령어 (플레이어 목록)
            if "There are" in response:
                players_list = response.split(": ")[1].strip() if ": " in response else ""
                return players_list
            else:
                return ""
    except Exception as e:
        print(f"Error: {e}")
        return None

@bot.event
async def on_ready():
    await bot.tree.sync()  # 슬래시 명령어 동기화
    print(f"Logged in as {bot.user}")

@bot.tree.command(name="hello", description="Say hello!")
async def hello(interaction: discord.Interaction):
    execute_command("tmux new-session -d -s Minecraft_Server \'cd /home/redeyes/Documents/Minecraft/ && ./start.sh\'")
    await interaction.response.send_message("Hello, World! 👋")

@bot.tree.command(name="check", description="Check the server")
async def check_server(interaction: discord.Interaction):
    if is_server_running():
        await interaction.response.send_message("🎮 마인크래프트 서버가 켜져 있습니다!")
    else:
        await interaction.response.send_message("🛑 마인크래프트 서버가 꺼져 있습니다.")

@bot.tree.command(name="players", description="Check the players on the Minecraft server")
async def check_server_players(interaction: discord.Interaction):
    if not is_server_running():
        await interaction.response.send_message("서버가 켜져있지 않아요")
        return

    response = check_players()

    if response:
        await interaction.response.send_message(f"현재 서버 인원: {len(response.split(', '))}명\n플레이어 목록: {response}")
    elif response == "":
        await interaction.response.send_message("현재 서버에 플레이어가 없습니다.")
    else:
        await interaction.response.send_message("이런! 문제가 생겼네요!")

@bot.tree.command(name="start", description="Turn on the Minecraft server")
async def start_server(interaction: discord.Interaction):
    if is_server_running():
        await interaction.response.send_message("서버가 이미 실행 중입니다. 🔄")
    else:
        execute_command(f"tmux new-session -d -s {TMUX_SESSION_NAME} \'{SERVER_COMMAND}\'")
        await interaction.response.send_message("마인크래프트 서버를 시작했습니다. ⏳")

@bot.tree.command(name="stop", description="Turn off the server")
async def stop_server(interaction: discord.Interaction):
    if is_server_running():
        if not check_players():  # 서버에 플레이어가 없을 때만 종료
            execute_command(f"tmux kill-session -t {TMUX_SESSION_NAME}")
            await interaction.response.send_message("마인크래프트 서버를 종료했습니다. 🛑")
        else:
            await interaction.response.send_message("플레이어가 존재하므로 서버를 종료할 수 없습니다. ⚠️")
    else:
        await interaction.response.send_message("서버가 실행 중이지 않습니다. ❌")

bot.run(TOKEN)