import os
import discord
from discord.ext import commands
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import datetime

# Try loading from local .env first, fallback to Next.js .env.local
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

TOKEN = os.getenv('DISCORD_BOT_TOKEN')
MONGO_URI = os.getenv('MONGODB_URI')

if not TOKEN or not MONGO_URI:
    print("Error: DISCORD_BOT_TOKEN and MONGODB_URI must be set.")
    exit(1)

# Setup MongoDB
mongo_client = AsyncIOMotorClient(MONGO_URI)
# Explicitly use 'myfolio' DB as defined in Next.js src/lib/db.ts
db = mongo_client['myfolio']

chat_threads = db['chatthreads']
chat_messages = db['chatmessages']

# Setup Discord Bot
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user.name} ({bot.user.id})')
    print('Ready to sync live chat messages.')

@bot.event
async def on_message(message):
    # Ignore messages from the bot itself
    if message.author == bot.user:
        return

    # Check if the message is in a Thread
    if isinstance(message.channel, discord.Thread):
        thread_id = str(message.channel.id)
        
        # Look up the thread in MongoDB to see if it's an active website chat
        db_thread = await chat_threads.find_one({"discordThreadId": thread_id, "status": "open"})
        
        if db_thread:
            # It's an active chat thread! Save the admin's reply to DB
            new_msg = {
                "threadId": str(db_thread['_id']),
                "discordMessageId": str(message.id),
                "sender": "admin",
                "content": message.content,
                "createdAt": datetime.datetime.utcnow()
            }
            await chat_messages.insert_one(new_msg)
            print(f"Synced message from admin {message.author.name} to thread {thread_id}")

    await bot.process_commands(message)

if __name__ == "__main__":
    bot.run(TOKEN)
