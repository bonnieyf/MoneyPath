import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const EarlyPaymentSelection = ({ expenses, onPaymentScheduleChange, isCollapsed = false, initialSchedule = {} }) => {
  const [selectedPayments, setSelectedPayments] = useState(initialSchedule);
  const [isEnabled, setIsEnabled] = useState(Object.keys(initialSchedule).length > 0);
  const [isExpanded, setIsExpanded] = useState(!isCollapsed);

  // 同步初始排程變更
  useEffect(() => {
    setSelectedPayments(initialSchedule);
    setIsEnabled(Object.keys(initialSchedule).length > 0);
  }, [initialSchedule]);

  // 獲取有債務的項目
  const getDebtExpenses = () => {
    return expenses.filter(expense => 
      expense.type === 'annual-recurring' && 
      expense.totalInstallments > 1 && 
      (expense.paidInstallments || 0) < expense.totalInstallments
    );
  };

  const debtExpenses = getDebtExpenses();

  const handlePaymentSelection = (expenseId, payoffMonth) => {
    const newSelections = {
      ...selectedPayments,
      [expenseId]: payoffMonth
    };
    setSelectedPayments(newSelections);
    
    // 通知父組件
    if (onPaymentScheduleChange) {
      onPaymentScheduleChange(isEnabled ? newSelections : {});
    }
  };

  const handleToggleEarlyPayment = (enabled) => {
    setIsEnabled(enabled);
    const paymentSchedule = enabled ? selectedPayments : {};
    if (!enabled) {
      setSelectedPayments({});
    }
    
    // 通知父組件
    if (onPaymentScheduleChange) {
      onPaymentScheduleChange(paymentSchedule);
    }
  };

  const handlePresetSelection = (preset) => {
    const newSelections = {};
    debtExpenses.forEach(debt => {
      const remainingInstallments = debt.totalInstallments - (debt.paidInstallments || 0);
      const maxMonth = Math.min(remainingInstallments, 12); // 最多選到第12個月或剩餘期數
      
      switch (preset) {
        case 'immediate':
          newSelections[debt.id] = 1; // 第1個月還清
          break;
        case 'quarter':
          newSelections[debt.id] = Math.min(3, maxMonth); // 第3個月或最大可選月份
          break;
        case 'half-year':
          newSelections[debt.id] = Math.min(6, maxMonth); // 第6個月或最大可選月份
          break;
        default:
          break;
      }
    });
    
    setSelectedPayments(newSelections);
    if (onPaymentScheduleChange) {
      onPaymentScheduleChange(isEnabled ? newSelections : {});
    }
  };

  if (debtExpenses.length === 0) {
    return null; // 沒有債務時不顯示
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
      <div 
        className="bg-gradient-to-r from-orange-50 to-amber-50 px-8 py-6 border-b border-gray-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCardIcon className="w-8 h-8" />
              債務優化策略規劃
            </h2>
            <p className="text-gray-600 mt-2">
              {isExpanded ? '透過提前清償降低利息負擔，改善債務結構' : '點擊展開設計專屬債務優化方案'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {Object.keys(selectedPayments).length > 0 && isEnabled && (
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {Object.keys(selectedPayments).length} 項策略
              </span>
            )}
            <span className="text-2xl text-gray-600">
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 space-y-6">
          {/* 啟用開關 */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => handleToggleEarlyPayment(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-800">啟用提前還款規劃</span>
              </div>
            </label>
            <p className="text-sm text-gray-600 mt-2 ml-8">選擇要提前清償的債務及時間</p>
          </div>

          {isEnabled && (
            <>
              {/* 快速設定 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  快速設定 (全部債務)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handlePresetSelection('immediate')}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    第1個月還清
                  </button>
                  <button
                    onClick={() => handlePresetSelection('quarter')}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    第3個月還清
                  </button>
                  <button
                    onClick={() => handlePresetSelection('half-year')}
                    className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    第6個月還清
                  </button>
                </div>
              </div>

              {/* 個別設定 */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  個別設定
                </h3>
                
                <div className="space-y-4">
                  {debtExpenses.map((debt) => {
                    const remainingInstallments = debt.totalInstallments - (debt.paidInstallments || 0);
                    return (
                      <div key={debt.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{debt.name}</h4>
                            <p className="text-sm text-gray-600">
                              剩餘 {remainingInstallments} 期 • {debt.bank}
                            </p>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            NT$ {debt.amount.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <label className="text-sm font-medium text-gray-700 min-w-0">
                            提前還清時間：
                          </label>
                          <select
                            value={selectedPayments[debt.id] || ''}
                            onChange={(e) => handlePaymentSelection(debt.id, parseInt(e.target.value) || null)}
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                          >
                            <option value="">維持原定還款計劃 (剩餘{remainingInstallments}期)</option>
                            {Array.from({ length: Math.min(remainingInstallments, 12) }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                第{i + 1}個月 (提前{remainingInstallments - (i + 1)}期)
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {selectedPayments[debt.id] && (
                          <div className="mt-3 text-sm text-orange-600 bg-orange-50 rounded px-3 py-2">
                            💡 將在第{selectedPayments[debt.id]}個月一次性還清剩餘款項
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 摘要 */}
              {Object.keys(selectedPayments).length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">提前還款摘要</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedPayments).map(([expenseId, month]) => {
                      const debt = debtExpenses.find(d => d.id === parseInt(expenseId));
                      if (!debt || !month) return null;
                      
                      return (
                        <div key={expenseId} className="text-sm text-gray-700">
                          • <span className="font-medium">{debt.name}</span> 將在第{month}個月還清
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EarlyPaymentSelection;