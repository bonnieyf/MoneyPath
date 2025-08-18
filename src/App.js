import React, { useState, useEffect, useRef } from 'react';
import IncomeSection from './components/IncomeSection';
import ExpenseSection from './components/ExpenseSection';
import SettingsIO from './components/SettingsIO';
import InvestmentSection from './components/InvestmentSection';
import PredictionSettings from './components/PredictionSettings';
import LoanSettings from './components/LoanSettings';
import EarlyPaymentSelection from './components/EarlyPaymentSelection';
import LoanPrepaymentCalculator from './components/LoanPrepaymentCalculator';
import ResultsSection from './components/ResultsSection';
import { calculatePrediction } from './utils/calculations';
import { CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

function App() {
  const [income, setIncome] = useState({
    type: 'monthly',
    amount: 0,
    bonuses: [],
    location: '台北市'
  });

  const [expenses, setExpenses] = useState([
    { 
      id: 1, 
      name: '', 
      amount: 0, 
      type: 'monthly',
      paymentDate: '',
      cycleType: 'fixed',
      cycleDays: 30,
      bank: '',
      paidInstallments: 0,
      totalInstallments: 1
    }
  ]);

  const [investment, setInvestment] = useState({
    monthlySavings: 0,
    monthlyInvestment: 0,
    annualReturn: 7,
    savingsRate: 1.5,
    riskLevel: 'moderate',
    compoundInterest: true,
    autoAllocate: false
  });

  const [predictionMonths, setPredictionMonths] = useState(12);
  const [results, setResults] = useState(null);
  const [loanSettings, setLoanSettings] = useState({
    loanToValueRatio: 80,
    interestRate: 2.5,
    loanTermYears: 30
  });
  const [earlyPaymentSchedule, setEarlyPaymentSchedule] = useState({});
  const [loanPaymentReduction, setLoanPaymentReduction] = useState(0);
  const [loans, setLoans] = useState([
    {
      id: 1,
      name: '信貸-1',
      originalAmount: 0,
      annualRate: 2.5,
      paidPeriods: 0,
      totalPeriods: 84,
      enablePrepayment: false,
      prepaymentAmount: 0,
      prepaymentMonth: 1
    }
  ]);
  const resultsRef = useRef(null);
  const calculateButtonRef = useRef(null);
  const [isCalculateButtonVisible, setIsCalculateButtonVisible] = useState(true);

  const addExpense = () => {
    const newExpense = {
      id: Date.now(),
      name: '',
      amount: 0,
      type: 'monthly',
      paymentDate: '',
      cycleType: 'fixed',
      cycleDays: 30,
      bank: '',
      paidInstallments: 0,
      totalInstallments: 1
    };
    setExpenses([...expenses, newExpense]);
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const updateExpense = (id, field, value) => {
    // 防禦性檢查：確保 value 不是事件對象
    if (value && typeof value === 'object' && value.nativeEvent) {
      console.error('Detected event object being passed as value:', value);
      return;
    }
    
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };


  // 處理完整設定匯入
  const handleSettingsImport = (settings) => {
    if (settings.income) {
      // 確保 income.amount 是數字型別
      const correctedIncome = {
        ...settings.income,
        amount: Number(settings.income.amount) || 0
      };
      console.log('匯入設定 - 原始income.amount:', settings.income.amount, '修正後:', correctedIncome.amount);
      setIncome(correctedIncome);
    }
    if (settings.expenses) {
      setExpenses(settings.expenses);
    }
    if (settings.investment) {
      setInvestment(settings.investment);
    }
    if (settings.predictionMonths) {
      setPredictionMonths(settings.predictionMonths);
    }
    if (settings.loanSettings) {
      setLoanSettings(settings.loanSettings);
    }
    if (settings.earlyPaymentSchedule) {
      setEarlyPaymentSchedule(settings.earlyPaymentSchedule);
    }
    if (settings.loans) {
      setLoans(settings.loans);
    }
  };

  // 計算可用於理財的月淨收入（不包含分紅，因為分紅不是每月都有）
  const calculateAvailableAmount = () => {
    const monthlyIncome = income.type === 'yearly' ? income.amount / 12 : income.amount;
    // 修復：不計算虛假的平均分紅，因為分紅只在特定月份發放
    const totalAverageIncome = monthlyIncome; // 只計算基本月收入
    
    let totalMonthlyExpenses = 0;
    expenses.forEach(expense => {
      if (!expense.name || expense.amount <= 0) return;
      
      switch (expense.type) {
        case 'monthly':
          totalMonthlyExpenses += expense.amount;
          break;
        case 'yearly':
          totalMonthlyExpenses += expense.amount / 12;
          break;
        case 'annual-recurring':
          // 檢查是否啟用年度重複模式
          if (expense.isAnnualRecurring) {
            if (expense.totalInstallments && expense.totalInstallments > 1) {
              // 如果是分期，只計算分期期間的月平均
              const monthsInCycle = Math.min(expense.totalInstallments, 12);
              totalMonthlyExpenses += (expense.amount * monthsInCycle) / 12;
            } else {
              // 一次性年度支出，平攤到每月
              totalMonthlyExpenses += expense.amount / 12;
            }
          } else {
            // 一般分期付款
            const totalInstallments = expense.totalInstallments || 1;
            const paidInstallments = expense.paidInstallments || 0;
            
            // 如果還沒繳完，才計算這筆支出
            if (paidInstallments < totalInstallments) {
              if (expense.cycleType === 'fixed') {
                const monthlyAmount = (expense.amount * 30) / (expense.cycleDays || 30);
                totalMonthlyExpenses += monthlyAmount;
              } else {
                totalMonthlyExpenses += expense.amount;
              }
            }
          }
          break;
        default:
          totalMonthlyExpenses += expense.amount;
      }
    });
    
    return Math.max(0, totalAverageIncome - totalMonthlyExpenses);
  };

  // 監聽計算按鈕的可見性
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCalculateButtonVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (calculateButtonRef.current) {
      observer.observe(calculateButtonRef.current);
    }

    return () => {
      if (calculateButtonRef.current) {
        observer.unobserve(calculateButtonRef.current);
      }
    };
  }, []);

  const calculateResults = (customMonths = null) => {
    // 檢查是否傳入了事件對象而不是數字
    if (customMonths && typeof customMonths === 'object' && 'nativeEvent' in customMonths) {
      customMonths = null;
    }

    try {
      console.log('計算預測開始 - income:', income);
      console.log('income.amount:', income.amount, 'type:', typeof income.amount);
      console.log('income.amount <= 0:', income.amount <= 0);
      console.log('Number(income.amount):', Number(income.amount));
      
      // 確保 income.amount 是數字
      const incomeAmount = Number(income.amount);
      if (isNaN(incomeAmount) || incomeAmount <= 0) {
        alert(`請輸入有效的收入金額 (目前值: ${income.amount}, 轉換後: ${incomeAmount})`);
        return;
      }

      const monthsToUse = customMonths || predictionMonths;
      
      // 驗證預測月份
      if (monthsToUse <= 0 || monthsToUse > 60) {
        alert('預測月份需要在 1-60 個月之間');
        return;
      }

      // 應用提前還款策略到支出中
      const modifiedExpenses = expenses.map(expense => {
        if (earlyPaymentSchedule[expense.id]) {
          return {
            ...expense,
            earlyPayoff: true,
            payoffMonth: earlyPaymentSchedule[expense.id]
          };
        }
        return expense;
      });

      // 創建修正後的 income 對象，確保 amount 是數字
      const correctedIncome = {
        ...income,
        amount: incomeAmount
      };
      
      const results = calculatePrediction(correctedIncome, modifiedExpenses, investment, monthsToUse, loanPaymentReduction, loans);
      setResults(results);

      // 如果使用了自定義月份，也更新預測月份狀態
      if (customMonths && customMonths !== predictionMonths) {
        setPredictionMonths(customMonths);
      }

      // 滾動到結果區域
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } catch (error) {
      console.error('計算預測時發生錯誤:', error);
      console.error('錯誤詳細資訊:', error.message);
      console.error('錯誤堆疊:', error.stack);
      alert(`計算發生錯誤: ${error.message}\n\n請檢查瀏覽器開發者工具的控制台以獲得更多詳細資訊`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頭部標題 */}
        <header className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-6 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <CurrencyDollarIcon className="w-12 h-12" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  個人財務健檢分析系統
                </h1>
              </div>
              <p className="text-xl opacity-90">
                專業債務分析 • 提前清償規劃 • 財務風險評估
              </p>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          {/* 主要輸入區域 */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 space-y-8">
              <IncomeSection income={income} setIncome={setIncome} />
              
              <SettingsIO 
                income={income}
                expenses={expenses}
                investment={investment}
                predictionMonths={predictionMonths}
                loanSettings={loanSettings}
                earlyPaymentSchedule={earlyPaymentSchedule}
                loans={loans}
                onImportSettings={handleSettingsImport}
              />
              
              <ExpenseSection 
                expenses={expenses}
                addExpense={addExpense}
                removeExpense={removeExpense}
                updateExpense={updateExpense}
              />
              
              <InvestmentSection 
                investment={investment}
                setInvestment={setInvestment}
                availableAmount={calculateAvailableAmount()}
              />
              
              <PredictionSettings 
                predictionMonths={predictionMonths}
                setPredictionMonths={setPredictionMonths}
              />

              {/* <LoanSettings 
                loanSettings={loanSettings}
                setLoanSettings={setLoanSettings}
              /> */}
              
              {/* 提前還款策略 */}
              <EarlyPaymentSelection 
                expenses={expenses}
                onPaymentScheduleChange={setEarlyPaymentSchedule}
                isCollapsed={!!results}
                initialSchedule={earlyPaymentSchedule}
              />

              {/* 信貸提前還款計算器 */}
              <LoanPrepaymentCalculator 
                loans={loans}
                setLoans={setLoans}
                onPaymentReductionUpdate={setLoanPaymentReduction}
              />
              
              {/* 計算按鈕 */}
              <div ref={calculateButtonRef} className="pt-6 border-t border-gray-200">
                <button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-lg flex items-center justify-center gap-3"
                  onClick={()=>calculateResults()}
                >
                  <ChartBarIcon className="w-6 h-6" />
                  計算預測
                </button>
              </div>
            </div>
          </div>

          {/* Sticky 計算按鈕 - 只在原按鈕不可見時顯示 */}
          {!isCalculateButtonVisible && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4">
              <div className="max-w-md">
                <button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={()=>calculateResults()}
                >
                  <ChartBarIcon className="w-5 h-5" />
                  計算預測
                </button>
              </div>
            </div>
          )}

          {/* 結果區域 */}
          {results && (
            <div ref={resultsRef}>
              <ResultsSection 
                results={results}
                income={income}
                expenses={expenses}
                investment={investment}
                predictionMonths={predictionMonths}
                loanSettings={loanSettings}
                onRecalculate={calculateResults}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;