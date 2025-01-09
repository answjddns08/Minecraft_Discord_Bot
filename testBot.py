import discord
from discord.ext import commands
from mcrcon import MCRcon
import dotenv
import os
import subprocess

# .env 파일에서 환경 변수 불러오기
dotenv.load_dotenv()

# RCON 및 디스코드 설정
RCON_HOST = "127.0.0.1"  # 마인크래프트 서버 주소
RCON_PORT = 25575  # RCON 포트
RCON_PASSWORD = "0808"  # RCON 비밀번호

TMUX_SESSION_NAME = "Minecraft_Server"  # 세션 이름
SERVER_COMMAND = "cd /home/redeyes/Documents/Minecraft/ && ./start.sh"  # 서버 실행 명령어

WORLDS_DIR = "/home/redeyes/Documents/MinecraftWorlds"  # 월드 파일들이 있는 디렉토리

# 환경 변수에서 토큰 값 가져오기
TOKEN = dotenv.get_key(".env","testBot")

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
    await interaction.response.send_message("Hello, World! 👋")

@bot.tree.command(name="check", description="서버 이름과 상태 확인")
async def check_server(interaction: discord.Interaction):
    lastWorld = os.getenv('lastWorld')
    if is_server_running():
        await interaction.response.send_message("월드 이름: " + lastWorld + "\n" + "🎮 마인크래프트 서버가 켜져 있습니다!")
    else:
        await interaction.response.send_message("월드 이름: " + lastWorld + "\n" +  "🛑 마인크래프트 서버가 꺼져 있습니다.")

@bot.tree.command(name="players", description="마크 서버에 있는 플레이어 확인")
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

@bot.tree.command(name="start", description="마크 서버 시작")
async def start_server(interaction: discord.Interaction):
    if is_server_running():
        await interaction.response.send_message("서버가 이미 실행 중입니다. 🔄")
    else:
        execute_command(f"tmux new-session -d -s {TMUX_SESSION_NAME} \'{SERVER_COMMAND}\'")
        await interaction.response.send_message("마인크래프트 서버를 시작합니다. ⏳")

@bot.tree.command(name="stop", description="마크 서버 종료")
async def stop_server(interaction: discord.Interaction):
    if is_server_running():
        if not check_players():  # 서버에 플레이어가 없을 때만 종료
            execute_command(f"tmux kill-session -t {TMUX_SESSION_NAME}")
            await interaction.response.send_message("마인크래프트 서버를 종료합니다. 🛑")
        else:
            await interaction.response.send_message("플레이어가 존재하므로 서버를 종료할 수 없습니다. ⚠️")
    else:
        await interaction.response.send_message("서버가 실행 중이지 않습니다. ❌")

@bot.tree.command(name="list", description="저장된 월드 목록 확인")
async def list_worlds(interaction: discord.Interaction):
    try:
        # 디렉토리 내의 폴더 목록 가져오기
        worlds = [d for d in os.listdir(WORLDS_DIR) if os.path.isdir(os.path.join(WORLDS_DIR, d))]
        
        if worlds:
            # 월드 목록을 깔끔하게 포맷팅
            worlds_list = "\n".join([f"📁 {world}" for world in worlds])
            await interaction.response.send_message(f"**저장된 월드 목록:**\n{worlds_list}")
        else:
            await interaction.response.send_message("저장된 월드가 없습니다. 🤔")
    except Exception as e:
        print(f"Error listing worlds: {e}")
        await interaction.response.send_message("월드 목록을 가져오는 중 오류가 발생했습니다. ❌")

@bot.tree.command(name="select", description="월드 선택")
async def select_world(interaction: discord.Interaction, world_name: str):
    
    # 서버가 켜져있는지 확인
    if is_server_running():
        await interaction.response.send_message("서버가 실행 중이므로 설정할 수 없습니다. ❌")
        return
    
    # 현재 월드가 존재하는지 확인
    if not execute_command(f"ls ~/Documents/MinecraftWorlds/ | grep {world_name}"):
        await interaction.response.send_message(f"**{world_name}** 월드를 찾을 수 없습니다. ❌")
        return
    

    # 기존 월드 파일들을 lastWorld 폴더로 이동
    last_world = dotenv.get_key(".env", "lastWorld").strip("'")
    try:
        execute_command(f"mv ~/Documents/Minecraft/world* ~/Documents/MinecraftWorlds/{last_world}/ 2>/dev/null")
    except Exception as e:
        print(f"Error uploading world: {e}")
        await interaction.response.send_message("현재 월드 업로드 실패 ❌") 
        return
    
    # 선택된 월드의 파일들을 Minecraft 폴더로 이동
    try:
        execute_command(f"mv ~/Documents/MinecraftWorlds/{world_name}/world* ~/Documents/Minecraft/ 2>/dev/null")
    except Exception as e:
        print(f"Error uploading world: {e}")
        await interaction.response.send_message("선택된 월드 다운로드 실패 ❌") 
        return
    
    # .env 파일 업데이트
    dotenv.set_key(".env","lastWorld",world_name)

    await interaction.response.send_message(f"설정된 월드 : **{world_name}**")

@bot.tree.command(name="rename", description="월드 이름 변경")
async def rename_world(interaction: discord.Interaction, current_name: str, new_name: str):
    try:

        # 현재 월드가 존재하는지 확인
        if not execute_command(f"ls ~/Documents/MinecraftWorlds/ | grep {current_name}"):
            await interaction.response.send_message(f"'{current_name}' 월드를 찾을 수 없습니다. ❌")
            return

        # lastWorld인지 확인
        last_world = dotenv.get_key(".env", "lastWorld").strip("'")
        if current_name == last_world and is_server_running():
            await interaction.response.send_message("현재 사용중인 월드의 이름은 변경할 수 없습니다. ❌")
            return

        # 새 이름으로 된 월드가 이미 존재하는지 확인
        if execute_command(f"ls ~/Documents/MinecraftWorlds/ | grep {new_name}"):
            await interaction.response.send_message(f"'{new_name}' 이름의 월드가 이미 존재합니다. ❌")
            return

        # 월드 이름 변경
        execute_command(f"mv ~/Documents/MinecraftWorlds/{current_name} ~/Documents/MinecraftWorlds/{new_name}")

        if (current_name == last_world):
            dotenv.set_key(".env","lastWorld",new_name)

        await interaction.response.send_message(
            f"월드 이름을 변경했습니다:\n"
            f"**{current_name}**  ➡️  **{new_name}**  ✅"
        )

    except Exception as e:
        print(f"Error renaming world: {e}")
        await interaction.response.send_message("월드 이름을 변경하는 중 오류가 발생했습니다. ❌")

@bot.tree.command(name="create", description="새로운 월드 생성")
async def create_world(interaction: discord.Interaction, world_name: str):
    try:

        # 동일한 이름의 월드가 이미 존재하는지 확인
        if execute_command(f"ls ~/Documents/MinecraftWorlds/ | grep {world_name}"):
            await interaction.response.send_message(f"'{world_name}' 이름의 월드가 이미 존재합니다. ❌")
            return

        # 새 월드 디렉토리 생성
        execute_command(f"mkdir ~/Documents/MinecraftWorlds/{world_name}")
        
        await interaction.response.send_message(f"새로운 월드 **{world_name}**가 생성되었습니다. ✅")

    except Exception as e:
        print(f"Error creating world: {e}")
        await interaction.response.send_message("월드를 생성하는 중 오류가 발생했습니다. ❌")


bot.run(TOKEN)
