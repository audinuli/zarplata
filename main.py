import asyncio
from aiogram import Bot, Dispatcher
from aiogram.types import Message
from config import BOT_TOKEN
from handlers import zarplata

async def main():
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()

    # Подключаем хендлер из файла zarplata.py
    dp.include_router(zarplata.router)

    # Запуск бота
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
