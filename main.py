
import asyncio
import threading
from aiogram import Bot, Dispatcher
from aiogram.types import Message
from config import BOT_TOKEN
from handlers import zarplata
from server import start_server

async def main():
    # Запускаем веб-сервер в отдельном потоке
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Даем серверу время на запуск
    await asyncio.sleep(2)
    
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()

    # Подключаем хендлер из файла zarplata.py
    dp.include_router(zarplata.router)

    # Запуск бота
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
