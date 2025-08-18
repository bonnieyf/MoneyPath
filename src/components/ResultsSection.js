import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ResultsSection = ({ 
  results, 
  income, 
  expenses, 
  investment, 
  predictionMonths, 
  loanSettings, 
  onRecalculate 
}) => {
  const [activeTab, setActiveTab] = useState('debt-analysis'); // 債務分析頁籤狀態
  
  // 安全檢查：確保 results 對象存在且結構正確
  if (!results || typeof results !== 'object') {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <p className="text-gray-500 text-center">載入結果中...</p>
      </div>
    );
  }
  
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

  const getRowClass = (month) => {
    const hasCompletions = month.expenseDetails?.some(detail => 
      detail.completionInfo?.includes('✅')
    );
    return hasCompletions ? 'completion-month' : '';
  };

  const renderExpenseDetails = (expenseDetails, monthIndex, month) => {
    const hasRegularExpenses = expenseDetails && expenseDetails.length > 0;
    const hasLoanExpenses = month.loanDetails && month.loanDetails.length > 0;
    const hasEarlyPayoffs = month.earlyPayoffs > 0;
    
    if (!hasRegularExpenses && !hasLoanExpenses && !hasEarlyPayoffs) {
      return <span className="no-details">無特殊支出</span>;
    }

    const activeExpenses = hasRegularExpenses ? expenseDetails.filter(detail => 
      detail.completionInfo && (detail.amount > 0 || detail.completionInfo.includes('✅'))
    ) : [];

    if (activeExpenses.length === 0 && !hasLoanExpenses && !hasEarlyPayoffs) {
      return <span className="no-details">無特殊支出</span>;
    }

    // 分離不同類型的項目
    const earlyPayoffItems = activeExpenses.filter(detail => 
      detail.completionInfo?.includes('💰') && detail.completionInfo?.includes('提前還清')
    );
    const completedItems = activeExpenses.filter(detail => 
      detail.completionInfo?.includes('✅') && !detail.completionInfo?.includes('💰')
    );
    const ongoingItems = activeExpenses.filter(detail => 
      !detail.completionInfo?.includes('✅') && !detail.completionInfo?.includes('💰')
    );

    return (
      <ExpenseDetailsDisplay 
        earlyPayoffItems={earlyPayoffItems}
        completedItems={completedItems}
        ongoingItems={ongoingItems}
        loanDetails={month.loanDetails || []}
        earlyPayoffDetails={month.earlyPayoffDetails || []}
        monthIndex={monthIndex}
      />
    );
  };

  // 支出明細顯示組件
  const ExpenseDetailsDisplay = ({ earlyPayoffItems, completedItems, ongoingItems, loanDetails, earlyPayoffDetails, monthIndex }) => {
    const [isExpanded, setIsExpanded] = useState({});
    
    const toggleExpanded = (monthIdx) => {
      setIsExpanded(prev => ({
        ...prev,
        [monthIdx]: !prev[monthIdx]
      }));
    };

    return (
      <div className="expense-details">
        {/* 提前結清項目（始終顯示，橙色背景） */}
        {earlyPayoffItems.map((detail, index) => (
          <div key={`early-${index}`} className="expense-detail-item early-payoff-item" style={{
            backgroundColor: '#fff7ed',
            borderLeft: '3px solid #f97316',
            padding: '4px 8px',
            marginBottom: '2px',
            fontSize: '11px',
            borderRadius: '4px'
          }}>
            {detail.completionInfo}
          </div>
        ))}
        
        {/* 分期完成項目（始終顯示，綠色背景） */}
        {completedItems.map((detail, index) => (
          <div key={`completed-${index}`} className="expense-detail-item completion-item" style={{
            backgroundColor: '#f0fdf4',
            borderLeft: '3px solid #22c55e',
            padding: '4px 8px',
            marginBottom: '2px',
            fontSize: '11px',
            borderRadius: '4px'
          }}>
            {detail.completionInfo}
          </div>
        ))}
        
        {/* 進行中的項目（可收起/展開，藍色背景） */}
        {ongoingItems.length > 0 && (
          <div className="ongoing-expenses">
            <div 
              className="expense-toggle-header"
              onClick={() => toggleExpanded(monthIndex)}
              style={{
                cursor: 'pointer',
                backgroundColor: '#eff6ff',
                borderLeft: '3px solid #3b82f6',
                padding: '4px 8px',
                marginBottom: '2px',
                fontSize: '11px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span className="toggle-icon" style={{ fontSize: '10px' }}>
                {isExpanded[monthIndex] ? '▼' : '▶'}
              </span>
              <span className="toggle-text">
                進行中分期 ({ongoingItems.length}項)
              </span>
            </div>
            
            {isExpanded[monthIndex] && (
              <div className="ongoing-items-list" style={{ marginLeft: '12px' }}>
                {ongoingItems.map((detail, index) => (
                  <div key={`ongoing-${index}`} className="expense-detail-item payment-item" style={{
                    backgroundColor: '#f8fafc',
                    borderLeft: '2px solid #94a3b8',
                    padding: '3px 6px',
                    marginBottom: '1px',
                    fontSize: '10px',
                    borderRadius: '3px'
                  }}>
                    {detail.completionInfo || `${detail.name} - ${detail.amount}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 信貸支出項目（始終顯示，紫色背景） */}
        {loanDetails && loanDetails.length > 0 && (
          <div className="loan-expenses">
            {loanDetails.map((loan, index) => (
              <div key={`loan-${index}`} className="expense-detail-item loan-item" style={{
                backgroundColor: '#faf5ff',
                borderLeft: '3px solid #a855f7',
                padding: '4px 8px',
                marginBottom: '2px',
                fontSize: '11px',
                borderRadius: '4px'
              }}>
                💳 {loan.loanName}: {formatCurrency(loan.payment)}
                {loan.isLastMonth && <span style={{ color: '#059669', fontWeight: '600' }}> (完)</span>}
              </div>
            ))}
          </div>
        )}

        {/* 提前還清項目（使用資產，橙色背景，特殊標記） */}
        {earlyPayoffDetails && earlyPayoffDetails.length > 0 && (
          <div className="early-payoff-asset-usage">
            {earlyPayoffDetails.map((payoff, index) => (
              <div key={`asset-payoff-${index}`} className="expense-detail-item asset-usage-item" style={{
                backgroundColor: '#fef3c7',
                borderLeft: '3px solid #f59e0b',
                padding: '4px 8px',
                marginBottom: '2px',
                fontSize: '11px',
                borderRadius: '4px',
                position: 'relative'
              }}>
                <span style={{ color: '#d97706', fontWeight: '600', fontSize: '10px' }}>
                  🏦 資產運用
                </span>
                <br />
                {payoff.completionInfo}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const formatMonthLabel = (monthData, index) => {
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + index, 1);
    return `${targetMonth.getFullYear()}/${String(targetMonth.getMonth() + 1).padStart(2, '0')}`;
  };

  const chartData = {
    labels: (results.monthlyData || []).map((monthData, index) => formatMonthLabel(monthData, index)),
    datasets: [
      {
        label: '💰 現金累積',
        data: (results.monthlyData || []).map(month => month.cumulativeCash || month.cumulative || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
        fill: false
      },
      {
        label: '🏦 存款累積',
        data: (results.monthlyData || []).map(month => month.cumulativeSavings || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: false
      },
      {
        label: '📈 投資累積',
        data: (results.monthlyData || []).map(month => month.cumulativeInvestment || 0),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.1,
        fill: false
      },
      {
        label: '💯 總資產',
        data: (results.monthlyData || []).map(month => month.totalAssets || month.cumulative || 0),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.1,
        fill: false,
        borderWidth: 3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: '投資理財預測分析',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. 整合的財務分析區域 */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            財務分析總覽
          </h2>
          <p className="text-gray-600 mt-2">核心指標、資產配置與投資趨勢</p>
        </div>
        
        <div className="p-8 space-y-8">
          {/* 核心財務指標 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              核心財務指標
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`text-3xl font-bold mb-2 ${results.summary.monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(results.summary.monthlyNet)}
                </div>
                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  月淨收入
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(results.summary.monthlySavings || 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  月存款
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {formatCurrency(results.summary.monthlyInvestment || 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  月投資
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatCurrency(results.finalAmounts?.total || results.finalAmount || 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  期末總資產
                </div>
              </div>
            </div>
          </div>

          {/* 期末資產配置 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💎</span>
              期末資產配置
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-gray-700 mb-2">
                  {formatCurrency(results.finalAmounts?.cash || 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  期末現金
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 text-center hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(results.finalAmounts?.savings || 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  期末存款
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 text-center hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {formatCurrency(results.finalAmounts?.investment || 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  期末投資
                </div>
              </div>
            </div>
            
            {results.investmentStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 text-center hover:shadow-lg transition-all duration-300">
                  <div className={`text-3xl font-bold mb-2 ${results.investmentStats.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(results.investmentStats.totalReturns)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                    投資收益
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 text-center hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(results.investmentStats.savingsInterest)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                    存款利息
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 投資趨勢圖表 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              投資趨勢圖表
            </h3>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. 月度明細表格 */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">📋</span>
            月度明細
          </h2>
          <p className="text-gray-600 mt-2">詳細的月度收支與資產累積明細</p>
        </div>
        <div className="p-8">
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-4 text-center font-semibold text-sm text-gray-700 border-b-2 border-gray-200">月份</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm text-gray-700 border-b-2 border-gray-200">收入</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm text-gray-700 border-b-2 border-gray-200">支出</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm text-gray-700 border-b-2 border-gray-200">當月淨收入</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm text-gray-700 border-b-2 border-gray-200">累積存款</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm text-gray-700 border-b-2 border-gray-200">累積投資</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm text-gray-700 border-b-2 border-gray-200">總資產</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm text-gray-700 border-b-2 border-gray-200">支出明細</th>
                </tr>
              </thead>
              <tbody>
                {(results.monthlyData || []).map((month, index) => (
                  <tr key={index} className={`transition-colors hover:bg-gray-50 ${month.expenseDetails?.some(detail => detail.completionInfo?.includes('✅')) ? 'bg-green-50 hover:bg-green-100' : ''}`}>
                    <td className="px-4 py-4 text-center text-sm text-gray-900 border-b border-gray-100">{formatMonthLabel(month, index)}</td>
                    <td className="px-4 py-4 text-right text-sm text-gray-900 border-b border-gray-100">
                  <div>
                    {formatCurrency(month.income)}
                    {month.bonusIncome > 0 && (
                      <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '500', marginTop: '2px' }}>
                        🎁 +{formatCurrency(month.bonusIncome)}
                        {month.bonusDetails && month.bonusDetails.length > 0 && (
                          <div style={{ fontSize: '10px', marginTop: '2px', lineHeight: '1.2' }}>
                            {month.bonusDetails.map((bonus, bonusIndex) => (
                              <div key={bonusIndex} style={{ color: '#92400e' }}>
                                {bonus.name}: 
                                {bonus.allocation.savings > 0 && ` 🏦${Math.round(bonus.allocation.savings).toLocaleString()}`}
                                {bonus.allocation.investment > 0 && ` 📈${Math.round(bonus.allocation.investment).toLocaleString()}`}
                                {bonus.allocation.consumption > 0 && ` 💳${Math.round(bonus.allocation.consumption).toLocaleString()}`}
                                {bonus.allocation.special > 0 && ` 🎯${Math.round(bonus.allocation.special).toLocaleString()}`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-900 border-b border-gray-100">
                      <div>
                        <div>{formatCurrency(month.expenses)}</div>
                        {month.earlyPayoffs > 0 && (
                          <div style={{ fontSize: '10px', color: '#d97706', fontWeight: '500', marginTop: '2px', lineHeight: '1.2' }}>
                            🏦 資產運用
                          </div>
                        )}
                        {month.earlyPayoffs > 0 && (
                          <div style={{ fontSize: '10px', color: '#d97706', marginTop: '1px' }}>
                            -{formatCurrency(month.earlyPayoffs)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-right text-sm border-b border-gray-100 ${month.net >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}`}>
                      {formatCurrency(month.net)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-blue-600 font-medium border-b border-gray-100">{formatCurrency(month.cumulativeSavings || 0)}</td>
                    <td className="px-4 py-4 text-right text-sm text-amber-600 font-medium border-b border-gray-100">{formatCurrency(month.cumulativeInvestment || 0)}</td>
                    <td className={`px-4 py-4 text-right text-sm border-b border-gray-100 ${month.totalAssets >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}`}>
                      {formatCurrency(month.totalAssets || month.cumulative || 0)}
                    </td>
                    <td className="px-4 py-4 text-left text-sm text-gray-900 border-b border-gray-100 min-w-[250px] max-w-[350px]">
                      {renderExpenseDetails(month.expenseDetails, index, month)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Debt Analysis and Housing Affordability */}
      {results.debtAnalysis && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-8 py-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-4xl">📊</span>
              債務負擔分析
            </h2>
            <p className="text-gray-600 mt-2">基於提前清償策略的債務負擔評估</p>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium">
                <span>⚠️</span>
                重要聲明
              </div>
              <p className="text-yellow-700 text-xs mt-1">
                本分析工具僅供個人財務規劃參考，實際投資與信貸決策請諮詢專業理財顧問
              </p>
            </div>
          </div>

          {/* 頁籤導航 */}
          {/* <div className="px-8 pt-6">
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('debt-analysis')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'debt-analysis'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>📊</span>
                債務分析
              </button>
            </div>
          </div> */}

          {/* 頁籤內容 */}
          <div className="p-8 pt-6">
            {/* 財務健康評估 */}
            {activeTab === 'debt-analysis' && (
              <div className="space-y-10">
                {/* 核心財務指標 */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-3xl p-8 border border-gray-200">
                  
                  {/* 主要指標 */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* 負債比率（銀行審核用）*/}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                      <div className="text-3xl mb-3">🏦</div>
                      <div className="text-sm text-gray-600 mb-3 font-medium">負債比率</div>
                      <div className="mb-4">
                        <div className="text-3xl font-bold mb-1" style={{ 
                          color: results.debtAnalysisWithStrategy && results.debtAnalysisWithStrategy.hasEarlyPayoffStrategy 
                            ? results.debtAnalysisWithStrategy.debtComparison.after.riskLevel.color
                            : results.debtAnalysis.generalDebtAnalysis.riskLevel.color 
                        }}>
                          {results.debtAnalysisWithStrategy && results.debtAnalysisWithStrategy.hasEarlyPayoffStrategy 
                            ? results.debtAnalysisWithStrategy.debtComparison.after.debtRatio
                            : results.debtAnalysis.generalDebtAnalysis.ratio
                          }%
                        </div>
                        <div className="text-sm font-medium" style={{ 
                          color: results.debtAnalysisWithStrategy && results.debtAnalysisWithStrategy.hasEarlyPayoffStrategy 
                            ? results.debtAnalysisWithStrategy.debtComparison.after.riskLevel.color
                            : results.debtAnalysis.generalDebtAnalysis.riskLevel.color 
                        }}>
                          {results.debtAnalysisWithStrategy && results.debtAnalysisWithStrategy.hasEarlyPayoffStrategy 
                            ? results.debtAnalysisWithStrategy.debtComparison.after.riskLevel.label
                            : results.debtAnalysis.generalDebtAnalysis.riskLevel.label
                          }
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 leading-tight">
                        貸款分期 ÷ 月收入<br/>
                        銀行審核標準: &lt;30%
                      </div>
                    </div>

                    {/* 財務緩衝 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                      <div className="text-3xl mb-3">🛡️</div>
                      <div className="text-sm text-gray-600 mb-3 font-medium">財務緩衝</div>
                      <div className="mb-4">
                        {(() => {
                          const availableAmount = results.debtAnalysis.monthlyIncome - (
                            results.debtAnalysisWithStrategy && results.debtAnalysisWithStrategy.hasEarlyPayoffStrategy 
                              ? results.debtAnalysisWithStrategy.debtComparison.after.monthlyDebt
                              : results.debtAnalysis.debt.total
                          );
                          const bufferRatio = (availableAmount / results.debtAnalysis.monthlyIncome) * 100;
                          const isHealthy = bufferRatio >= 50;
                          const isGood = bufferRatio >= 30;
                          
                          return (
                            <>
                              <div className="text-3xl font-bold mb-1" style={{ 
                                color: isHealthy ? '#10b981' : isGood ? '#f59e0b' : '#ef4444'
                              }}>
                                {Math.round(bufferRatio)}%
                              </div>
                              <div className="text-sm font-medium" style={{ 
                                color: isHealthy ? '#10b981' : isGood ? '#f59e0b' : '#ef4444'
                              }}>
                                {isHealthy ? '健康' : isGood ? '良好' : '需改善'}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div className="text-xs text-gray-500 leading-tight">
                        可用餘額 ÷ 月收入<br/>
                        標準: ≥50% 健康
                      </div>
                    </div>

                    {/* 支出負擔比（個人理財用）*/}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                      <div className="text-3xl mb-3">📈</div>
                      <div className="text-sm text-gray-600 mb-3 font-medium">支出負擔比</div>
                      <div className="mb-4">
                        {(() => {
                          const expenseRatio = results.debtAnalysisWithStrategy && results.debtAnalysisWithStrategy.hasEarlyPayoffStrategy 
                            ? results.debtAnalysisWithStrategy.debtComparison.after.expenseRatio
                            : (results.debtAnalysisWithStrategy?.debtComparison?.before?.expenseRatio || 0);
                          const isHealthy = expenseRatio <= 60;
                          const isGood = expenseRatio <= 70;
                          
                          return (
                            <>
                              <div className="text-3xl font-bold mb-1" style={{ 
                                color: isHealthy ? '#10b981' : isGood ? '#f59e0b' : '#ef4444'
                              }}>
                                {expenseRatio}%
                              </div>
                              <div className="text-sm font-medium" style={{ 
                                color: isHealthy ? '#10b981' : isGood ? '#f59e0b' : '#ef4444'
                              }}>
                                {isHealthy ? '健康' : isGood ? '良好' : '需改善'}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div className="text-xs text-gray-500 leading-tight">
                        總支出 ÷ 月收入<br/>
                        (含房租、生活費等)<br/>
                        個人理財標準: ≤60%
                      </div>
                    </div>

                    {/* 月現金流 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                      <div className="text-3xl mb-3">💰</div>
                      <div className="text-sm text-gray-600 mb-3 font-medium">月現金流</div>
                      <div className="mb-4">
                        <div className="text-3xl font-bold mb-1 text-blue-600">
                          {formatCurrency(results.debtAnalysis.monthlyIncome - (
                            results.debtAnalysisWithStrategy && results.debtAnalysisWithStrategy.hasEarlyPayoffStrategy 
                              ? results.debtAnalysisWithStrategy.debtComparison.after.monthlyDebt
                              : results.debtAnalysis.debt.total
                          ))}
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          可用餘額
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 leading-tight">
                        收入 - 債務負擔<br/>
                        可用於投資與儲蓄
                      </div>
                    </div>
                  </div>

                  {/* 財務概況總結 */}
                  <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span>📋</span> 財務狀況總結
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">月收入</div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(results.debtAnalysis.monthlyIncome)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">月債務負擔</div>
                        <div className="text-xs text-gray-500 mb-2">(純債務：貸款+分期)</div>
                        <div className="text-lg font-bold text-red-600">
                          {results.debtAnalysisWithStrategy && results.debtAnalysisWithStrategy.hasEarlyPayoffStrategy 
                            ? formatCurrency(results.debtAnalysisWithStrategy.debtComparison.after.monthlyDebt)
                            : formatCurrency(results.debtAnalysis.debt.total)
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">淨現金流</div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(results.debtAnalysis.monthlyIncome - (
                            results.debtAnalysisWithStrategy && results.debtAnalysisWithStrategy.hasEarlyPayoffStrategy 
                              ? results.debtAnalysisWithStrategy.debtComparison.after.monthlyDebt
                              : results.debtAnalysis.debt.total
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* 提前清償策略效果 */}
                {results.debtAnalysisWithStrategy && results.debtAnalysisWithStrategy.hasEarlyPayoffStrategy && (
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-3xl p-8 border border-gray-200">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">提前清償策略效果</h3>
                      <p className="text-gray-600">執行策略前後的財務狀況對比分析</p>
                    </div>

                    {/* 策略前後對比 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* 策略前 */}
                      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="text-center mb-6">
                          <div className="text-3xl mb-3">📊</div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">策略前狀況</h4>
                          <p className="text-sm text-gray-600">維持原還款計畫</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="text-center bg-red-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">月債務負擔</div>
                            <div className="text-xs text-gray-500 mb-2">(純債務：貸款+分期)</div>
                            <div className="text-2xl font-bold text-red-600">
                              {formatCurrency(results.debtAnalysisWithStrategy.debtComparison.before.monthlyDebt)}
                            </div>
                          </div>
                          
                          <div className="text-center bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">負債比率</div>
                            <div className="text-xl font-bold" style={{ color: results.debtAnalysisWithStrategy.debtComparison.before.riskLevel.color }}>
                              {results.debtAnalysisWithStrategy.debtComparison.before.debtRatio}%
                            </div>
                            <div className="text-sm" style={{ color: results.debtAnalysisWithStrategy.debtComparison.before.riskLevel.color }}>
                              {results.debtAnalysisWithStrategy.debtComparison.before.riskLevel.label}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 策略後 */}
                      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="text-center mb-6">
                          <div className="text-3xl mb-3">✨</div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">策略後狀況</h4>
                          <p className="text-sm text-gray-600">執行提前清償策略</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="text-center bg-green-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">月債務負擔</div>
                            <div className="text-xs text-gray-500 mb-2">(純債務：貸款+分期)</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(results.debtAnalysisWithStrategy.debtComparison.after.monthlyDebt)}
                            </div>
                          </div>
                          
                          <div className="text-center bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">負債比率</div>
                            <div className="text-xl font-bold" style={{ color: results.debtAnalysisWithStrategy.debtComparison.after.riskLevel.color }}>
                              {results.debtAnalysisWithStrategy.debtComparison.after.debtRatio}%
                            </div>
                            <div className="text-sm" style={{ color: results.debtAnalysisWithStrategy.debtComparison.after.riskLevel.color }}>
                              {results.debtAnalysisWithStrategy.debtComparison.after.riskLevel.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 改善效果總結 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
                        <span>📈</span> 策略改善效果
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center bg-blue-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-2">負債比改善</div>
                          <div className="text-2xl font-bold text-blue-600">
                            -{results.debtAnalysisWithStrategy.debtComparison.improvement.debtRatioReduction}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">降低負債壓力</div>
                        </div>
                        
                        <div className="text-center bg-green-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-2">月負擔減少</div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(results.debtAnalysisWithStrategy.debtComparison.improvement.monthlyDebtReduction)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">增加可用現金流</div>
                        </div>
                        
                        <div className="text-center bg-orange-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-2">總節省金額</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(results.debtAnalysisWithStrategy.debtComparison.improvement.totalSavings)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">節省利息支出</div>
                        </div>
                      </div>
                    </div>

                    {/* 清償計劃時程 */}
                    <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📅</span> 提前清償時程
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.debtAnalysisWithStrategy.payoffSchedule.map((payoff, index) => (
                          <div key={index} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                            <div className="font-semibold text-sm text-gray-900 mb-1">{payoff.name}</div>
                            <div className="text-xs text-orange-600">
                              第{payoff.payoffMonth}個月清償
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              節省: {formatCurrency(payoff.totalSavings)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 房貸能力頁籤 - 已隱藏 */}
            {false && activeTab === 'housing-affordability' && results.housingAffordability && (
              <div className="space-y-8">
                {results.housingAffordability.isAffordable ? (
                  // 有房貸能力的情況
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>🏠</span>
                        房貸能力評估
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 text-center hover:shadow-lg transition-all duration-300">
                          <div className="text-sm text-gray-600 mb-2 font-medium">可負擔房價</div>
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(results.housingAffordability.affordableHousePrice)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200 text-center hover:shadow-lg transition-all duration-300">
                          <div className="text-sm text-gray-600 mb-2 font-medium">月房貸負擔</div>
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(results.housingAffordability.affordableMonthlyPayment)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 text-center hover:shadow-lg transition-all duration-300">
                          <div className="text-sm text-gray-600 mb-2 font-medium">可貸金額</div>
                          <div className="text-2xl font-bold text-purple-600">{formatCurrency(results.housingAffordability.affordableLoanAmount)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 text-center hover:shadow-lg transition-all duration-300">
                          <div className="text-sm text-gray-600 mb-2 font-medium">所需自備款</div>
                          <div className="text-2xl font-bold text-amber-600">{formatCurrency(results.housingAffordability.requiredDownPayment)}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📊</span>
                        建議房價區間
                      </h3>
                      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-green-200">
                            <div className="text-sm text-green-700 font-medium mb-2">保守建議</div>
                            <div className="text-lg font-bold text-green-600">{formatCurrency(results.housingAffordability.recommendations.suggestedPriceRange.conservative)}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-blue-200">
                            <div className="text-sm text-blue-700 font-medium mb-2">適中建議</div>
                            <div className="text-lg font-bold text-blue-600">{formatCurrency(results.housingAffordability.recommendations.suggestedPriceRange.recommended)}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-purple-200">
                            <div className="text-sm text-purple-700 font-medium mb-2">積極建議</div>
                            <div className="text-lg font-bold text-purple-600">{formatCurrency(results.housingAffordability.recommendations.suggestedPriceRange.aggressive)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 無房貸能力的情況
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-200">
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4">⚠️</div>
                      <h3 className="text-xl font-bold text-red-700 mb-2">目前無法負擔房貸</h3>
                      <p className="text-gray-700">根據台銀標準，您的月收入在扣除最低生活費和現有債務後，沒有餘力負擔房貸。</p>
                      <div className="mt-4 bg-white rounded-lg p-4 inline-block">
                        <div className="text-sm text-gray-600 mb-1">月收支缺口</div>
                        <div className="text-xl font-bold text-red-600">{formatCurrency(results.housingAffordability.deficit)}</div>
                      </div>
                    </div>
                    
                    {results.housingAffordability.improvementSuggestions && results.housingAffordability.improvementSuggestions.length > 0 && (
                      <div className="bg-white rounded-xl p-6 border border-orange-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <span>💡</span> 改善建議
                        </h4>
                        <ul className="space-y-2">
                          {results.housingAffordability.improvementSuggestions.map((suggestion, index) => (
                            <li key={index} className="text-gray-700 flex items-start gap-2">
                              <span className="text-orange-500 mt-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>⚙️</span>
                    貸款條件設定
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">貸款成數</div>
                        <div className="text-lg font-bold text-gray-900">{results.housingAffordability.loanToValueRatio}%</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">利率</div>
                        <div className="text-lg font-bold text-gray-900">{results.housingAffordability.interestRate}%</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">貸款年限</div>
                        <div className="text-lg font-bold text-gray-900">{results.housingAffordability.loanTermYears}年</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}



    </div>
  );
};

export default ResultsSection;