
from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command

router = Router()

# Состояния (этапы)
class SalaryCalc(StatesGroup):
    deposit = State()

# Клавиатура с кнопкой "назад"
back_kb = ReplyKeyboardMarkup(
    keyboard=[[KeyboardButton(text="🔙 Вернуться назад")]],
    resize_keyboard=True
)

# Команда открытия Web App
@router.message(Command("cash"))
async def open_cash_webapp(message: types.Message):
    # Используем домен Replit для Web App  
    repl_url = "https://python-template-paudinulibot.replit.app/webapp/"
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Открыть CASH 💵", web_app=WebAppInfo(url=repl_url))]
    ])
    await message.answer(
        "💼 <b>CASH - Калькулятор зарплаты</b>\n\n"
        "Рассчитайте свою зарплату с учетом:\n"
        "• НДФЛ (13%, 15%, 30%)\n"
        "• Социальных взносов\n"
        "• Налоговых вычетов\n\n"
        "Нажмите кнопку ниже для открытия калькулятора:",
        reply_markup=keyboard,
        parse_mode="HTML"
    )

# Обработчик данных из Web App
@router.message(F.web_app_data)
async def handle_webapp_data(message: types.Message):
    import json
    
    try:
        data = json.loads(message.web_app_data.data)
        
        deposit = data.get('deposit', 0)
        fee_percent = data.get('feePercent', 0)
        fee = data.get('fee', 0)
        net_amount = data.get('netAmount', 0)
        usd_rate = data.get('usdRate', 0)
        usd_amount = data.get('usdAmount', 0)
        salary_percent = data.get('salaryPercent', 0)
        salary_fund = data.get('salaryFund', 0)
        participants = data.get('participants', 0)
        per_person = data.get('perPerson', 0)
        
        result_text = (
            f"💵 <b>Результаты расчета зарплаты</b>\n\n"
            f"💰 <b>Каждому участнику: ${per_person:.2f}</b>\n\n"
            f"📊 <b>Детализация расчета:</b>\n"
            f"• Депозит: {deposit:,.0f} ₽\n"
            f"• Удержание ({fee_percent}%): {fee:,.0f} ₽\n"
            f"• Чистая сумма: {net_amount:,.0f} ₽\n"
            f"• В долларах (курс {usd_rate}): ${usd_amount:.2f}\n"
            f"• Фонд зарплаты ({salary_percent}%): ${salary_fund:.2f}\n"
            f"• Участников: {participants} чел.\n\n"
            f"✅ <b>Итого на каждого: ${per_person:.2f}</b>"
        )
        
        await message.answer(result_text, parse_mode="HTML")
        
    except (json.JSONDecodeError, KeyError) as e:
        await message.answer("❌ Ошибка при обработке данных из калькулятора")

# Команда запуска расчета
@router.message(F.text == "/zarplata")
async def start_salary_calc(message: types.Message, state: FSMContext):
    await state.clear()
    await message.answer("💰 Введите сумму депозита в рублях:", reply_markup=back_kb)
    await state.set_state(SalaryCalc.deposit)
