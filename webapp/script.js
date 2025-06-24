
// Telegram Web App initialization
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    
    // Set theme colors
    document.body.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.body.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
}

// DOM elements
const form = document.getElementById('salaryForm');
const resultsDiv = document.getElementById('results');
const deductionsCheckbox = document.getElementById('hasDeductions');
const deductionsGroup = document.getElementById('deductionsGroup');

// Show/hide deductions input
deductionsCheckbox.addEventListener('change', function() {
    deductionsGroup.style.display = this.checked ? 'block' : 'none';
    if (!this.checked) {
        document.getElementById('deductionAmount').value = '';
    }
});

// Form submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSalary();
});

// Input validation and real-time formatting
document.getElementById('grossSalary').addEventListener('input', function(e) {
    const value = parseFloat(e.target.value);
    if (value < 0) e.target.value = 0;
});

document.getElementById('socialDeductions').addEventListener('input', function(e) {
    const value = parseFloat(e.target.value);
    if (value < 0) e.target.value = 0;
    if (value > 100) e.target.value = 100;
});

document.getElementById('deductionAmount').addEventListener('input', function(e) {
    const value = parseFloat(e.target.value);
    if (value < 0) e.target.value = 0;
});

function calculateSalary() {
    // Get form values
    const grossSalary = parseFloat(document.getElementById('grossSalary').value) || 0;
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 13;
    const socialRate = parseFloat(document.getElementById('socialDeductions').value) || 22;
    const hasDeductions = document.getElementById('hasDeductions').checked;
    const deductionAmount = hasDeductions ? (parseFloat(document.getElementById('deductionAmount').value) || 0) : 0;

    // Validation
    if (grossSalary <= 0) {
        showError('Пожалуйста, введите корректную сумму зарплаты');
        return;
    }

    // Calculate taxes and deductions
    const taxableIncome = Math.max(0, grossSalary - deductionAmount);
    const incomeTax = (taxableIncome * taxRate) / 100;
    const socialContributions = (grossSalary * socialRate) / 100;
    const netSalary = grossSalary - incomeTax - socialContributions;

    // Display results
    displayResults({
        gross: grossSalary,
        tax: incomeTax,
        social: socialContributions,
        net: Math.max(0, netSalary),
        deductions: deductionAmount
    });

    // Show results section
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Send data to Telegram if available
    if (window.Telegram && window.Telegram.WebApp) {
        const resultData = {
            grossSalary: grossSalary,
            netSalary: Math.max(0, netSalary),
            incomeTax: incomeTax,
            socialContributions: socialContributions,
            taxRate: taxRate,
            deductions: deductionAmount
        };
        
        window.Telegram.WebApp.sendData(JSON.stringify(resultData));
    }
}

function displayResults(data) {
    document.getElementById('resultGross').textContent = formatCurrency(data.gross);
    document.getElementById('resultTax').textContent = formatCurrency(data.tax);
    document.getElementById('resultSocial').textContent = formatCurrency(data.social);
    document.getElementById('resultNet').textContent = formatCurrency(data.net);

    // Add animation
    const resultItems = document.querySelectorAll('.result-item');
    resultItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
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
        animation: slideIn 0.3s ease;
    `;

    // Add animation keyframes
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add loading state to calculate button
const calculateBtn = document.querySelector('.calculate-btn');
const originalBtnText = calculateBtn.innerHTML;

function showLoading() {
    calculateBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="animation: spin 1s linear infinite;">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="12 12" stroke-linecap="round"/>
        </svg>
        <span>Рассчитываем...</span>
    `;
    calculateBtn.disabled = true;
}

function hideLoading() {
    calculateBtn.innerHTML = originalBtnText;
    calculateBtn.disabled = false;
}

// Add spinning animation
if (!document.querySelector('#loading-styles')) {
    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Enhance form submission with loading state
const originalCalculateSalary = calculateSalary;
calculateSalary = function() {
    showLoading();
    
    // Simulate small delay for better UX
    setTimeout(() => {
        originalCalculateSalary();
        hideLoading();
    }, 500);
};
