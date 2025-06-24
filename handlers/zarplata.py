
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
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Открыть CASH 💵", web_app=WebAppInfo(url="https://zarplata-one.vercel.app/"))]
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
        
        gross_salary = data.get('grossSalary', 0)
        net_salary = data.get('netSalary', 0)
        income_tax = data.get('incomeTax', 0)
        social_contributions = data.get('socialContributions', 0)
        tax_rate = data.get('taxRate', 13)
        deductions = data.get('deductions', 0)
        
        result_text = (
            f"💰 <b>Результаты расчета зарплаты</b>\n\n"
            f"📊 <b>Зарплата до вычетов:</b> {gross_salary:,.0f} ₽\n"
            f"📋 <b>Налоговая ставка:</b> {tax_rate}%\n"
        )
        
        if deductions > 0:
            result_text += f"💳 <b>Налоговые вычеты:</b> {deductions:,.0f} ₽\n"
        
        result_text += (
            f"\n💸 <b>Удержания:</b>\n"
            f"• НДФЛ: {income_tax:,.0f} ₽\n"
            f"• Соц. взносы: {social_contributions:,.0f} ₽\n\n"
            f"✅ <b>К выдаче на руки: {net_salary:,.0f} ₽</b>"
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
