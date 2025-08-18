import { calculatePrediction } from './src/utils/calculations.js';

// 測試富邦產險分期的案例
const testData = {
  income: {
    type: 'monthly',
    amount: 45000,
    bonuses: [],
    location: '台北市'
  },
  expenses: [
    {
      id: 1,
      paymentDate: '2025-03-31',
      name: '富邦產險',
      amount: 2666,
      type: 'annual-recurring',
      bank: '聯邦',
      paidInstallments: 3,
      totalInstallments: 12,
      cycleType: 'statement',
      cycleDays: 30,
      isAnnualRecurring: true
    }
  ],
  investment: {
    monthlySavings: 13693.45,
    monthlyInvestment: 31951.38,
    annualReturn: 5,
    savingsRate: 1.5,
    riskLevel: 'moderate',
    compoundInterest: true,
    autoAllocate: false
  }
};

console.log('測試富邦產險分期計算...');
const results = calculatePrediction(testData.income, testData.expenses, testData.investment, 6);

results.monthlyData.forEach((month, index) => {
  console.log(`\n月份 ${index + 1} (${month.month}):`);
  console.log(`支出總額: ${month.expenses}`);
  
  month.expenseDetails.forEach(detail => {
    if (detail.name === '富邦產險' && detail.completionInfo) {
      console.log(`- ${detail.completionInfo}`);
    }
  });
});