from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

router = Router()

# Состояния (этапы)
class SalaryCalc(StatesGroup):
    deposit = State()

# Клавиатура с кнопкой "назад"
back_kb = ReplyKeyboardMarkup(
    keyboard=[[KeyboardButton(text="🔙 Вернуться назад")]],
    resize_keyboard=True
)

# Команда запуска расчета
@router.message(F.text == "/zarplata")
async def start_salary_calc(message: types.Message, state: FSMContext):
    await state.clear()
    await message.answer("💰 Введите сумму депозита в рублях:", reply_markup=back_kb)
    await state.set_state(SalaryCalc.deposit)
