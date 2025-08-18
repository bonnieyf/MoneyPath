import React, { useState } from 'react';
import { 
  CalculatorIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { calculatePrediction } from '../utils/calculations';

const SimpleDebtStrategy = ({ income, expenses, investment, predictionMonths, onRecalculate }) => {
  const [customMonths, setCustomMonths] = useState(predictionMonths);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  // 錯誤處理：確保必要的 props 存在
  if (!income || !expenses || !investment || !predictionMonths) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mt-8">
        <div className="p-8 text-center">
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  // 確保 expenses 是陣列
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  
  // 確保 income 有必要的屬性
  const safeIncome = {
    amount: income.amount || 0,
    type: income.type || 'monthly',
    bonuses: Array.isArray(income.bonuses) ? income.bonuses : [],
    location: income.location || '台北市'
  };

  // 確保 investment 有必要的屬性
  const safeInvestment = {
    monthlySavings: investment.monthlySavings || 0,
    monthlyInvestment: investment.monthlyInvestment || 0,
    annualReturn: investment.annualReturn || 7,
    savingsRate: investment.savingsRate || 1.5,
    compoundInterest: investment.compoundInterest || false,
    autoAllocate: investment.autoAllocate || false,
    ...investment
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return 'NT$ 0';
    }
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 獲取有債務的項目
  const getDebtExpenses = () => {
    return safeExpenses.filter(expense => 
      expense.type === 'annual-recurring' && 
      expense.totalInstallments > 1 && 
      (expense.paidInstallments || 0) < expense.totalInstallments
    );
  };

  const debtExpenses = getDebtExpenses();

  // 預設策略選項
  const strategies = [
    {
      id: 'extend_6m',
      name: '延長預測 (6個月)',
      description: `將預測期間延長到 ${predictionMonths + 6} 個月`,
      months: predictionMonths + 6,
      type: 'extend'
    },
    {
      id: 'extend_12m',
      name: '延長預測 (12個月)',
      description: `將預測期間延長到 ${predictionMonths + 12} 個月`,
      months: predictionMonths + 12,
      type: 'extend'
    }
  ];

  // 如果有債務，添加提前還款選項
  if (debtExpenses.length > 0) {
    debtExpenses.forEach(debt => {
      const remainingInstallments = debt.totalInstallments - (debt.paidInstallments || 0);
      if (remainingInstallments > 2) {
        strategies.push({
          id: `payoff_${debt.id}`,
          name: `提前還清 ${debt.name}`,
          description: `在第3個月一次性還清剩餘債務`,
          months: Math.max(predictionMonths, 6),
          type: 'payoff',
          targetDebt: debt
        });
      }
    });
  }

  // 執行策略模擬
  const executeStrategy = (strategy) => {
    setSelectedStrategy(strategy);
    
    // 根據策略類型執行不同操作
    switch (strategy.type) {
      case 'extend':
        try {
          // 延長預測時間 - 通過回調讓主應用重新計算
          if (onRecalculate && strategy.months > 0) {
            onRecalculate(strategy.months);
          }
        } catch (error) {
          console.error('延長預測計算錯誤:', error);
          alert('延長預測計算發生錯誤，請重試');
        }
        break;
      case 'payoff':
        try {
          // 提前還款 - 創建修改過的支出列表
          const modifiedExpenses = safeExpenses.map(expense => {
            if (expense.id === strategy.targetDebt.id) {
              return {
                ...expense,
                // 標記為在第3個月還清
                earlyPayoff: true,
                payoffMonth: 3
              };
            }
            return expense;
          });
          
          // 使用修改過的支出重新計算
          const results = calculatePrediction(safeIncome, modifiedExpenses, safeInvestment, strategy.months);
          setSelectedStrategy({
            ...strategy,
            results
          });
        } catch (error) {
          console.error('策略模擬計算錯誤:', error);
          alert('策略模擬計算發生錯誤，請檢查設定');
        }
        break;
      default:
        break;
    }
  };

  // 自定義時間模擬
  const simulateCustomTime = () => {
    try {
      if (onRecalculate && customMonths > 0) {
        onRecalculate(customMonths);
      }
    } catch (error) {
      console.error('自定義時間模擬錯誤:', error);
      alert('計算發生錯誤，請檢查設定並重試');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mt-8">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CalculatorIcon className="w-8 h-8" />
          策略模擬器
        </h2>
        <p className="text-gray-600 mt-2">調整預測時間或模擬提前還款策略</p>
      </div>

      <div className="p-8 space-y-6">
        {/* 自定義時間選擇 */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            自定義預測時間
          </h3>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                預測月份
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={customMonths}
                onChange={(e) => setCustomMonths(parseInt(e.target.value) || 12)}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
              />
            </div>
            <button
              onClick={simulateCustomTime}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <CalculatorIcon className="w-4 h-4" />
              重新計算
            </button>
          </div>
        </div>

        {/* 策略選項 */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            快速策略選項
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedStrategy?.id === strategy.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
                onClick={() => executeStrategy(strategy)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{strategy.name}</h4>
                  <div className="text-sm text-purple-600 font-medium">
                    {strategy.months}個月
                  </div>
                </div>
                <p className="text-sm text-gray-600">{strategy.description}</p>
                
                {strategy.type === 'payoff' && (
                  <div className="mt-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                    💡 模擬提前還款效果
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 策略執行結果 */}
        {selectedStrategy?.results && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ArrowRightIcon className="w-5 h-5" />
              策略效果預覽：{selectedStrategy.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-green-100 text-center">
                <div className="text-sm text-gray-600 mb-1">期末總資產</div>
                <div className="text-xl font-bold text-green-600">
                  {selectedStrategy.results?.finalAmounts?.total ? formatCurrency(selectedStrategy.results.finalAmounts.total) : 'N/A'}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-100 text-center">
                <div className="text-sm text-gray-600 mb-1">月淨收入</div>
                <div className="text-xl font-bold text-blue-600">
                  {selectedStrategy.results?.summary?.monthlyNet ? formatCurrency(selectedStrategy.results.summary.monthlyNet) : 'N/A'}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-100 text-center">
                <div className="text-sm text-gray-600 mb-1">預測期間</div>
                <div className="text-xl font-bold text-purple-600">
                  {selectedStrategy?.months || 0} 個月
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-lg p-4 border border-green-100">
              <p className="text-sm text-gray-700">
                💡 <strong>策略說明：</strong> {selectedStrategy.description}
                {selectedStrategy.type === 'payoff' && (
                  <span className="text-orange-600"> - 此為模擬結果，實際執行需要足夠的現金流支持。</span>
                )}
              </p>
            </div>
          </div>
        )}

        {debtExpenses.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">🎉</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">目前沒有分期債務</h4>
            <p className="text-gray-600">您可以使用自定義時間功能來調整預測期間</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDebtStrategy;