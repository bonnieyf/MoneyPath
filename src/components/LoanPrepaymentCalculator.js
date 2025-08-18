import React, { useState, useEffect } from 'react';
import { CalculatorIcon, BanknotesIcon, ArrowTrendingDownIcon, PlusIcon, XMarkIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';

const LoanPrepaymentCalculator = ({ loans, setLoans, onPaymentReductionUpdate }) => {

  const [calculationResults, setCalculationResults] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // PMT 公式計算月付款
  const calculateMonthlyPayment = (principal, annualRate, months) => {
    if (principal <= 0 || months <= 0) return 0;
    if (annualRate === 0) return principal / months;
    
    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  };

  // 計算剩餘本金（根據已繳期數）
  const calculateRemainingBalance = (originalAmount, annualRate, totalPeriods, paidPeriods) => {
    if (paidPeriods >= totalPeriods) return 0;
    if (annualRate === 0) {
      return originalAmount * (totalPeriods - paidPeriods) / totalPeriods;
    }
    
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = calculateMonthlyPayment(originalAmount, annualRate, totalPeriods);
    
    // 計算剩餘本金 = 原始本金 * ((1+r)^n - (1+r)^p) / ((1+r)^n - 1)
    const factor1 = Math.pow(1 + monthlyRate, totalPeriods);
    const factor2 = Math.pow(1 + monthlyRate, paidPeriods);
    const remainingBalance = originalAmount * (factor1 - factor2) / (factor1 - 1);
    
    return Math.max(0, remainingBalance);
  };

  // 計算單一貸款的詳細信息
  const calculateLoanDetails = (loan) => {
    const { originalAmount, annualRate, totalPeriods, paidPeriods, enablePrepayment, prepaymentAmount } = loan;
    
    if (!originalAmount || originalAmount <= 0 || totalPeriods <= 0) {
      return {
        ...loan,
        originalMonthlyPayment: 0,
        currentRemainingBalance: 0,
        currentMonthlyPayment: 0,
        newRemainingBalance: 0,
        newMonthlyPayment: 0,
        paymentReduction: 0,
        interestSaved: 0
      };
    }

    // 原始月付金額
    const originalMonthlyPayment = calculateMonthlyPayment(originalAmount, annualRate, totalPeriods);
    
    // 目前剩餘本金
    const currentRemainingBalance = calculateRemainingBalance(originalAmount, annualRate, totalPeriods, paidPeriods);
    
    // 目前的月付金額（基於剩餘期數）
    const remainingPeriods = Math.max(0, totalPeriods - paidPeriods);
    const currentMonthlyPayment = remainingPeriods > 0 ? calculateMonthlyPayment(currentRemainingBalance, annualRate, remainingPeriods) : 0;
    
    // 如果沒有啟用提前還款，就維持現狀
    if (!enablePrepayment || !prepaymentAmount || prepaymentAmount <= 0) {
      return {
        ...loan,
        originalMonthlyPayment,
        currentRemainingBalance,
        currentMonthlyPayment,
        newRemainingBalance: currentRemainingBalance,
        newMonthlyPayment: currentMonthlyPayment,
        paymentReduction: 0,
        interestSaved: 0
      };
    }

    // 提前還款後的剩餘本金
    const newRemainingBalance = Math.max(0, currentRemainingBalance - prepaymentAmount);
    
    // 如果完全清償
    if (newRemainingBalance === 0) {
      return {
        ...loan,
        originalMonthlyPayment,
        currentRemainingBalance,
        currentMonthlyPayment,
        newRemainingBalance: 0,
        newMonthlyPayment: 0,
        paymentReduction: currentMonthlyPayment,
        interestSaved: currentMonthlyPayment * remainingPeriods - currentRemainingBalance,
        isFullyPaid: true
      };
    }

    // 部分提前還款後的新月付金額
    const newMonthlyPayment = calculateMonthlyPayment(newRemainingBalance, annualRate, remainingPeriods);
    
    // 計算節省效果
    const paymentReduction = currentMonthlyPayment - newMonthlyPayment;
    const originalTotalPayment = currentMonthlyPayment * remainingPeriods;
    const newTotalPayment = newMonthlyPayment * remainingPeriods + prepaymentAmount;
    const interestSaved = originalTotalPayment - newTotalPayment;

    return {
      ...loan,
      originalMonthlyPayment,
      currentRemainingBalance,
      currentMonthlyPayment,
      newRemainingBalance,
      newMonthlyPayment,
      paymentReduction,
      interestSaved
    };
  };

  // 計算當月信貸支出（提供給主預測系統使用）
  const calculateMonthlyLoanPayment = (month) => {
    let totalPayment = 0;
    const loanDetails = [];

    loans.forEach(loan => {
      const loanDetail = calculateLoanDetails(loan);
      const { totalPeriods, paidPeriods, enablePrepayment, prepaymentMonth } = loan;
      
      // 計算這個月該筆貸款的期數
      const currentPeriod = paidPeriods + month;
      const remainingPeriods = Math.max(0, totalPeriods - paidPeriods);
      
      if (month <= remainingPeriods) {
        let monthPayment = 0;
        
        // 如果啟用提前還款且在指定月份
        if (enablePrepayment && month === prepaymentMonth) {
          monthPayment = loanDetail.currentMonthlyPayment + (loan.prepaymentAmount || 0);
        } else if (enablePrepayment && month > prepaymentMonth) {
          monthPayment = loanDetail.newMonthlyPayment;
        } else {
          monthPayment = loanDetail.currentMonthlyPayment;
        }
        
        totalPayment += monthPayment;
        loanDetails.push({
          loanName: loan.name,
          payment: monthPayment,
          isLastMonth: currentPeriod === totalPeriods || (enablePrepayment && loanDetail.isFullyPaid && month === prepaymentMonth),
          remainingPeriods: totalPeriods - currentPeriod + 1
        });
      }
    });

    return {
      totalPayment,
      loanDetails
    };
  };

  // 計算總效果
  const calculateTotalEffect = () => {
    const results = loans.map(loan => calculateLoanDetails(loan));
    
    const totalPaymentReduction = results.reduce((sum, result) => sum + (result.paymentReduction || 0), 0);
    const totalInterestSaved = results.reduce((sum, result) => sum + (result.interestSaved || 0), 0);
    const totalCurrentMonthly = results.reduce((sum, result) => sum + (result.currentMonthlyPayment || 0), 0);
    
    return {
      results,
      totalPaymentReduction,
      totalInterestSaved,
      totalCurrentMonthly
    };
  };

  // 當貸款數據變化時重新計算
  useEffect(() => {
    const { results, totalPaymentReduction } = calculateTotalEffect();
    
    setCalculationResults(results);
    
    // 通知父組件月付款減少金額
    if (onPaymentReductionUpdate) {
      onPaymentReductionUpdate(totalPaymentReduction);
    }
  }, [loans, onPaymentReductionUpdate]);

  const handleLoanInputChange = (loanId, field, value) => {
    setLoans(prev => prev.map(loan => 
      loan.id === loanId 
        ? { ...loan, [field]: field.includes('Period') || field === 'prepaymentMonth' ? parseInt(value) || 0 : parseFloat(value) || 0 }
        : loan
    ));
  };

  const handlePrepaymentToggle = (loanId) => {
    setLoans(prev => prev.map(loan => 
      loan.id === loanId 
        ? { ...loan, enablePrepayment: !loan.enablePrepayment }
        : loan
    ));
  };

  const addLoan = () => {
    const newLoan = {
      id: Date.now(),
      name: `信貸-${loans.length + 1}`,
      originalAmount: 0,
      annualRate: 2.5,
      totalPeriods: 84,
      paidPeriods: 0,
      enablePrepayment: false,
      prepaymentAmount: 0,
      prepaymentMonth: 1
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const removeLoan = (loanId) => {
    if (loans.length > 1) {
      setLoans(prev => prev.filter(loan => loan.id !== loanId));
    }
  };

  const updateLoanName = (loanId, name) => {
    setLoans(prev => prev.map(loan => 
      loan.id === loanId 
        ? { ...loan, name }
        : loan
    ));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const { totalPaymentReduction, totalInterestSaved, totalCurrentMonthly } = calculateTotalEffect();

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
      <div 
        className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalculatorIcon className="w-8 h-8" />
              信貸管理與預測
            </h2>
            <p className="text-gray-600 mt-2">
              {isExpanded ? '輸入原始貸款金額、利率、期數，系統自動計算月付金額與提前還款效果' : '管理信貸本金、利率，計算真實月付金額'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {totalCurrentMonthly > 0 && (
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                月繳 {formatCurrency(totalCurrentMonthly)}
              </span>
            )}
            {totalPaymentReduction > 0 && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                可減 {formatCurrency(totalPaymentReduction)}
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
          {/* 貸款管理按鈕 */}
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">信貸管理</h3>
            <button 
              onClick={addLoan}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              新增信貸
            </button>
          </div>

          {/* 貸款列表 */}
          {loans.map((loan, index) => {
            const loanDetail = calculateLoanDetails(loan);
            return (
              <div key={loan.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    value={loan.name}
                    onChange={(e) => updateLoanName(loan.id, e.target.value)}
                    className="text-lg font-semibold bg-transparent border-none outline-none text-gray-800 hover:bg-white hover:border hover:border-gray-300 rounded px-2 py-1"
                  />
                  {loans.length > 1 && (
                    <button
                      onClick={() => removeLoan(loan.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 基本貸款資訊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      原始貸款金額
                    </label>
                    <input
                      type="number"
                      value={loan.originalAmount || ''}
                      onChange={(e) => handleLoanInputChange(loan.id, 'originalAmount', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="貸款總額"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      年利率 (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={loan.annualRate || ''}
                      onChange={(e) => handleLoanInputChange(loan.id, 'annualRate', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="例如: 2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      已繳期數
                    </label>
                    <input
                      type="number"
                      value={loan.paidPeriods || ''}
                      onChange={(e) => handleLoanInputChange(loan.id, 'paidPeriods', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="已繳幾期"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      總期數
                    </label>
                    <input
                      type="number"
                      value={loan.totalPeriods || ''}
                      onChange={(e) => handleLoanInputChange(loan.id, 'totalPeriods', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="總共幾期"
                    />
                  </div>
                </div>

                {/* 貸款狀態顯示 */}
                {loan.originalAmount > 0 && loan.totalPeriods > 0 && (
                  <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-xs text-blue-700 mb-1">原始月付款</div>
                        <div className="text-sm font-bold text-blue-700">
                          {formatCurrency(loanDetail.originalMonthlyPayment)}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-700 mb-1">目前剩餘本金</div>
                        <div className="text-sm font-bold text-gray-700">
                          {formatCurrency(loanDetail.currentRemainingBalance)}
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-xs text-yellow-700 mb-1">目前月付款</div>
                        <div className="text-sm font-bold text-yellow-700">
                          {formatCurrency(loanDetail.currentMonthlyPayment)}
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="text-xs text-purple-700 mb-1">剩餘期數</div>
                        <div className="text-sm font-bold text-purple-700">
                          {Math.max(0, loan.totalPeriods - loan.paidPeriods)} 期
                        </div>
                      </div>
                    </div>

                    {/* 進度條 */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">還款進度</span>
                        <span className="text-sm text-gray-600">
                          {((loan.paidPeriods / loan.totalPeriods) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${loan.totalPeriods > 0 ? (loan.paidPeriods / loan.totalPeriods) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 提前還款設定 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-orange-500" />
                      <span className="font-medium text-gray-700">提前還款規劃</span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loan.enablePrepayment}
                        onChange={() => handlePrepaymentToggle(loan.id)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                      />
                      <span className="ml-2 text-sm text-gray-700">啟用提前還款</span>
                    </label>
                  </div>

                  {loan.enablePrepayment && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            提前還款金額
                          </label>
                          <input
                            type="number"
                            value={loan.prepaymentAmount || ''}
                            onChange={(e) => handleLoanInputChange(loan.id, 'prepaymentAmount', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                            placeholder="額外還款金額"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            還款月份
                          </label>
                          <select
                            value={loan.prepaymentMonth || 1}
                            onChange={(e) => handleLoanInputChange(loan.id, 'prepaymentMonth', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                第 {i + 1} 個月
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 提前還款效果預覽 */}
                      {loan.prepaymentAmount > 0 && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <h4 className="text-sm font-semibold text-green-800 mb-3">提前還款效果預覽</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-green-200">
                              <div className="text-xs text-green-700 mb-1">還款後剩餘本金</div>
                              <div className="text-sm font-bold text-green-700">
                                {formatCurrency(loanDetail.newRemainingBalance)}
                              </div>
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-green-200">
                              <div className="text-xs text-green-700 mb-1">新月付款</div>
                              <div className="text-sm font-bold text-green-700">
                                {formatCurrency(loanDetail.newMonthlyPayment)}
                              </div>
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-green-200">
                              <div className="text-xs text-green-700 mb-1">每月節省</div>
                              <div className="text-sm font-bold text-green-700">
                                {formatCurrency(loanDetail.paymentReduction)}
                              </div>
                            </div>
                          </div>
                          
                          {loanDetail.isFullyPaid && (
                            <div className="mt-3 bg-green-100 border border-green-300 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
                                <span>🎉</span>
                                完全清償！此筆貸款將完全結清
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}


          {/* 提前還款效果總結 */}
          {(totalPaymentReduction > 0 || totalInterestSaved > 0) && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BanknotesIcon className="w-6 h-6" />
                提前還款效果總覽
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {totalPaymentReduction > 0 && (
                  <div className="bg-white p-6 rounded-lg border border-green-200">
                    <div className="text-sm text-green-700 mb-2">總月支出減少</div>
                    <div className="text-3xl font-bold text-green-700 flex items-center gap-2">
                      <ArrowTrendingDownIcon className="w-6 h-6" />
                      {formatCurrency(totalPaymentReduction)}
                    </div>
                  </div>
                )}
                
                {totalInterestSaved > 0 && (
                  <div className="bg-white p-6 rounded-lg border border-green-200">
                    <div className="text-sm text-green-700 mb-2">總節省金額</div>
                    <div className="text-3xl font-bold text-green-700">
                      {formatCurrency(totalInterestSaved)}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-2">
                  <span>✅</span>
                  智慧提前還款建議
                </div>
                <p className="text-green-700 text-sm">
                  根據利率計算，您的提前還款規劃可以有效降低債務負擔。
                  {totalPaymentReduction > 0 && (
                    <>每月減少 <strong>{formatCurrency(totalPaymentReduction)}</strong> 的支出，</>
                  )}
                  {totalInterestSaved > 0 && (
                    <>總共節省 <strong>{formatCurrency(totalInterestSaved)}</strong> 的利息，</>
                  )}
                  大幅提升您的財務彈性和投資能力。
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanPrepaymentCalculator;