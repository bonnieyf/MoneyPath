document.addEventListener('DOMContentLoaded', function() {
    const addExpenseBtn = document.getElementById('add-expense');
    const expensesList = document.getElementById('expenses-list');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsSection = document.getElementById('results-section');

    addExpenseBtn.addEventListener('click', addExpenseItem);
    calculateBtn.addEventListener('click', calculatePrediction);

    function addExpenseItem() {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.innerHTML = `
            <input type="text" placeholder="支出項目名稱" class="expense-name">
            <input type="number" placeholder="金額 (NTD)" class="expense-amount" min="0">
            <select class="expense-frequency">
                <option value="monthly">每月</option>
                <option value="yearly">每年</option>
            </select>
            <button type="button" class="remove-expense">刪除</button>
        `;
        
        const removeBtn = expenseItem.querySelector('.remove-expense');
        removeBtn.addEventListener('click', function() {
            expenseItem.remove();
        });
        
        expensesList.appendChild(expenseItem);
    }

    expensesList.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-expense')) {
            e.target.parentElement.remove();
        }
    });

    function calculatePrediction() {
        const incomeType = document.querySelector('input[name="income-type"]:checked').value;
        const incomeAmount = parseFloat(document.getElementById('income-amount').value) || 0;
        const predictionMonths = parseInt(document.getElementById('prediction-months').value) || 12;

        if (incomeAmount <= 0) {
            alert('請輸入有效的收入金額');
            return;
        }

        const monthlyIncome = incomeType === 'yearly' ? incomeAmount / 12 : incomeAmount;

        const expenses = [];
        const expenseItems = document.querySelectorAll('.expense-item');
        let totalMonthlyExpenses = 0;

        expenseItems.forEach(item => {
            const name = item.querySelector('.expense-name').value.trim();
            const amount = parseFloat(item.querySelector('.expense-amount').value) || 0;
            const frequency = item.querySelector('.expense-frequency').value;

            if (name && amount > 0) {
                const monthlyAmount = frequency === 'yearly' ? amount / 12 : amount;
                expenses.push({
                    name: name,
                    amount: amount,
                    frequency: frequency,
                    monthlyAmount: monthlyAmount
                });
                totalMonthlyExpenses += monthlyAmount;
            }
        });

        const monthlyNet = monthlyIncome - totalMonthlyExpenses;

        updateSummary(monthlyIncome, totalMonthlyExpenses, monthlyNet);
        generatePredictionTable(predictionMonths, monthlyIncome, totalMonthlyExpenses, monthlyNet);
        drawPredictionChart(predictionMonths, monthlyNet);
        
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function updateSummary(monthlyIncome, monthlyExpenses, monthlyNet) {
        document.getElementById('monthly-income').textContent = formatCurrency(monthlyIncome);
        document.getElementById('monthly-expenses').textContent = formatCurrency(monthlyExpenses);
        
        const netElement = document.getElementById('monthly-net');
        netElement.textContent = formatCurrency(monthlyNet);
        netElement.className = monthlyNet >= 0 ? 'value positive' : 'value negative';
    }

    function generatePredictionTable(months, monthlyIncome, monthlyExpenses, monthlyNet) {
        const tbody = document.getElementById('prediction-tbody');
        tbody.innerHTML = '';

        let cumulativeAmount = 0;

        for (let i = 1; i <= months; i++) {
            cumulativeAmount += monthlyNet;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>第 ${i} 月</td>
                <td>${formatCurrency(monthlyIncome)}</td>
                <td>${formatCurrency(monthlyExpenses)}</td>
                <td class="${monthlyNet >= 0 ? 'positive' : 'negative'}">${formatCurrency(monthlyNet)}</td>
                <td class="${cumulativeAmount >= 0 ? 'positive' : 'negative'}">${formatCurrency(cumulativeAmount)}</td>
            `;
            tbody.appendChild(row);
        }
    }

    function drawPredictionChart(months, monthlyNet) {
        const canvas = document.getElementById('prediction-canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 800;
        canvas.height = 400;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const padding = 60;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        let cumulativeAmounts = [];
        let cumulative = 0;
        for (let i = 0; i <= months; i++) {
            cumulativeAmounts.push(cumulative);
            if (i < months) cumulative += monthlyNet;
        }

        const maxAmount = Math.max(...cumulativeAmounts, 0);
        const minAmount = Math.min(...cumulativeAmounts, 0);
        const range = Math.max(Math.abs(maxAmount), Math.abs(minAmount)) || 1;

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
            const y = padding + (chartHeight * i) / 10;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();

            const value = range - (2 * range * i) / 10;
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(formatCurrency(value), padding - 10, y + 4);
        }

        for (let i = 0; i <= months; i++) {
            const x = padding + (chartWidth * i) / months;
            if (i % Math.ceil(months / 10) === 0 || i === months) {
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, padding + chartHeight);
                ctx.stroke();

                ctx.fillStyle = '#666';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(i.toString(), x, padding + chartHeight + 20);
            }
        }

        const zeroY = padding + chartHeight / 2;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, zeroY);
        ctx.lineTo(padding + chartWidth, zeroY);
        ctx.stroke();

        ctx.strokeStyle = monthlyNet >= 0 ? '#48bb78' : '#e53e3e';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let i = 0; i <= months; i++) {
            const x = padding + (chartWidth * i) / months;
            const normalizedAmount = cumulativeAmounts[i] / range;
            const y = padding + chartHeight / 2 - (normalizedAmount * chartHeight) / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        for (let i = 0; i <= months; i++) {
            const x = padding + (chartWidth * i) / months;
            const normalizedAmount = cumulativeAmounts[i] / range;
            const y = padding + chartHeight / 2 - (normalizedAmount * chartHeight) / 2;

            ctx.fillStyle = monthlyNet >= 0 ? '#48bb78' : '#e53e3e';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('累積財務狀況 (月)', canvas.width / 2, 30);

        ctx.save();
        ctx.translate(20, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('累積金額 (NTD)', 0, 0);
        ctx.restore();
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    const firstRemoveBtn = document.querySelector('.remove-expense');
    if (firstRemoveBtn) {
        firstRemoveBtn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    }
});