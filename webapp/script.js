
// Telegram Web App initialization
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    
    // Set theme colors
    document.body.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.body.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
}

// Global variables
let currentStep = 1;
const totalSteps = 6; // 5 input steps + 1 result step
let calculationData = {};

// Progress management
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Update progress bar fill
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = progressPercent + '%';
    
    // Update step indicators
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

// Navigation functions
function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById(`step${stepNumber}`) || document.getElementById('result');
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    currentStep = stepNumber;
    updateProgress();
}

function nextStep(step) {
    if (validateStep(step)) {
        if (step < 5) {
            showStep(step + 1);
            updatePreview(step + 1);
        }
    }
}

function prevStep(step) {
    if (step > 1) {
        showStep(step - 1);
        if (step - 1 > 1) {
            updatePreview(step - 1);
        }
    }
}

// Validation
function validateStep(step) {
    const inputs = {
        1: 'deposit',
        2: 'feePercent',
        3: 'usdRate',
        4: 'salaryPercent',
        5: 'participants'
    };
    
    const inputId = inputs[step];
    const input = document.getElementById(inputId);
    const value = parseFloat(input.value);
    
    if (!value || value <= 0) {
        showError(`Пожалуйста, введите корректное значение`);
        input.focus();
        return false;
    }
    
    // Additional validations
    if (step === 2 || step === 4) { // Percentages
        if (value > 100) {
            showError(`Процент не может быть больше 100%`);
            input.focus();
            return false;
        }
    }
    
    if (step === 5) { // Participants must be integer
        if (!Number.isInteger(value)) {
            showError(`Количество участников должно быть целым числом`);
            input.focus();
            return false;
        }
    }
    
    return true;
}

// Preview calculations
function updatePreview(step) {
    const deposit = parseFloat(document.getElementById('deposit').value) || 0;
    const feePercent = parseFloat(document.getElementById('feePercent').value) || 0;
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 0;
    const salaryPercent = parseFloat(document.getElementById('salaryPercent').value) || 0;
    const participants = parseInt(document.getElementById('participants').value) || 0;
    
    if (step === 2 && deposit > 0 && feePercent > 0) {
        const fee = deposit * (feePercent / 100);
        const netAmount = deposit - fee;
        document.getElementById('feePreview').innerHTML = `
            <strong>Расчет:</strong><br>
            Удержание: ${formatCurrency(fee)}<br>
            Чистая сумма: ${formatCurrency(netAmount)}
        `;
    }
    
    if (step === 3 && deposit > 0 && feePercent > 0 && usdRate > 0) {
        const fee = deposit * (feePercent / 100);
        const netAmount = deposit - fee;
        const usdAmount = netAmount / usdRate;
        document.getElementById('usdPreview').innerHTML = `
            <strong>В долларах:</strong><br>
            ${formatCurrency(netAmount)} ÷ ${usdRate} = ${formatUSD(usdAmount)}
        `;
    }
    
    if (step === 4 && deposit > 0 && feePercent > 0 && usdRate > 0 && salaryPercent > 0) {
        const fee = deposit * (feePercent / 100);
        const netAmount = deposit - fee;
        const usdAmount = netAmount / usdRate;
        const salaryFund = usdAmount * (salaryPercent / 100);
        document.getElementById('salaryPreview').innerHTML = `
            <strong>Фонд зарплаты:</strong><br>
            ${formatUSD(usdAmount)} × ${salaryPercent}% = ${formatUSD(salaryFund)}
        `;
    }
    
    if (step === 5 && deposit > 0 && feePercent > 0 && usdRate > 0 && salaryPercent > 0 && participants > 0) {
        const fee = deposit * (feePercent / 100);
        const netAmount = deposit - fee;
        const usdAmount = netAmount / usdRate;
        const salaryFund = usdAmount * (salaryPercent / 100);
        const perPerson = salaryFund / participants;
        document.getElementById('participantsPreview').innerHTML = `
            <strong>На каждого:</strong><br>
            ${formatUSD(salaryFund)} ÷ ${participants} = ${formatUSD(perPerson)}
        `;
    }
}

// Final calculation
function calculateFinal() {
    if (!validateStep(5)) return;
    
    const deposit = parseFloat(document.getElementById('deposit').value);
    const feePercent = parseFloat(document.getElementById('feePercent').value);
    const usdRate = parseFloat(document.getElementById('usdRate').value);
    const salaryPercent = parseFloat(document.getElementById('salaryPercent').value);
    const participants = parseInt(document.getElementById('participants').value);
    
    // Calculations
    const fee = deposit * (feePercent / 100);
    const netAmount = deposit - fee;
    const usdAmount = netAmount / usdRate;
    const salaryFund = usdAmount * (salaryPercent / 100);
    const perPerson = salaryFund / participants;
    
    // Store for potential resend to bot
    calculationData = {
        deposit,
        feePercent,
        fee,
        netAmount,
        usdRate,
        usdAmount,
        salaryPercent,
        salaryFund,
        participants,
        perPerson
    };
    
    // Display results
    document.getElementById('finalResult').textContent = formatUSD(perPerson);
    document.getElementById('summaryDeposit').textContent = formatCurrency(deposit);
    document.getElementById('summaryFeePercent').textContent = feePercent + '%';
    document.getElementById('summaryFee').textContent = formatCurrency(fee);
    document.getElementById('summaryNet').textContent = formatCurrency(netAmount);
    document.getElementById('summaryRate').textContent = usdRate;
    document.getElementById('summaryUsd').textContent = formatUSD(usdAmount);
    document.getElementById('summarySalaryPercent').textContent = salaryPercent + '%';
    document.getElementById('summarySalaryFund').textContent = formatUSD(salaryFund);
    document.getElementById('summaryParticipants').textContent = participants;
    document.getElementById('summaryPerPerson').textContent = formatUSD(perPerson);
    
    // Show result step
    showStep(6);
    
    // Send data to Telegram if available
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(calculationData));
    }
}

// Restart calculation
function restart() {
    currentStep = 1;
    calculationData = {};
    
    // Clear all inputs
    document.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
    
    // Clear all previews
    document.querySelectorAll('.calculation-preview').forEach(preview => {
        preview.innerHTML = '';
    });
    
    // Show first step
    showStep(1);
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatUSD(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function showError(message) {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        z-index: 1000;
        font-weight: 500;
        animation: slideInError 0.3s ease;
    `;

    // Add animation keyframes
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInError {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInError 0.3s ease reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add input event listeners for real-time preview updates
    document.getElementById('feePercent').addEventListener('input', () => updatePreview(2));
    document.getElementById('usdRate').addEventListener('input', () => updatePreview(3));
    document.getElementById('salaryPercent').addEventListener('input', () => updatePreview(4));
    document.getElementById('participants').addEventListener('input', () => updatePreview(5));
    
    // Add Enter key support
    document.querySelectorAll('input').forEach((input, index) => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (currentStep < 5) {
                    nextStep(currentStep);
                } else if (currentStep === 5) {
                    calculateFinal();
                }
            }
        });
    });
    
    // Initialize progress
    updateProgress();
});
