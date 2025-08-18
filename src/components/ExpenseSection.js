import React from 'react';
import { 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  CalendarIcon,
  BanknotesIcon,
  MapPinIcon,
  GiftIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  ArrowTrendingUpIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ExpenseSection = ({ expenses, addExpense, removeExpense, updateExpense }) => {

  return (
    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-xl">💳</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">固定支出管理</h2>
      </div>
      
      <div className="flex flex-col gap-5 mb-6">
        {expenses.map((expense) => (
          <div key={expense.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                  {expense.type === 'annual-recurring' ? '💰' : expense.type === 'yearly' ? '📅' : '📝'}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-800">
                    {expense.name || '未命名項目'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {expense.type === 'monthly' ? '每月固定支出' : 
                     expense.type === 'yearly' ? '每年固定支出' : 
                     '分期付款項目'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => removeExpense(expense.id)}
                title="刪除此項目"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-3">
                <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                  <span className="text-sm">✏️</span>
                  項目名稱
                </label>
                <input
                  type="text"
                  placeholder="請輸入支出項目名稱"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 hover:border-red-300 bg-gray-50 focus:bg-white"
                  value={expense.name}
                  onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                  <span className="text-sm">💰</span>
                  金額 (NTD)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10">
                    <span className="text-red-600 font-bold text-base">NT$</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 hover:border-red-300 bg-gray-50 focus:bg-white font-semibold"
                    min="0"
                    value={expense.amount || ''}
                    onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                  <span className="text-sm">📋</span>
                  支出類型
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 hover:border-red-300 bg-gray-50 focus:bg-white"
                  value={expense.type}
                  onChange={(e) => updateExpense(expense.id, 'type', e.target.value)}
                >
                  <option value="monthly">📝 每月固定</option>
                  <option value="yearly">📅 每年固定</option>
                  <option value="annual-recurring">💰 分期付款</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                  <span className="text-sm">🏦</span>
                  銀行/機構
                </label>
                <input
                  type="text"
                  placeholder="例: 中國信託、台新銀行"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 hover:border-red-300 bg-gray-50 focus:bg-white"
                  value={expense.bank}
                  onChange={(e) => updateExpense(expense.id, 'bank', e.target.value)}
                />
              </div>
            </div>

            {expense.type === 'annual-recurring' && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200 mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">⚙️</span>
                  <h4 className="text-lg font-semibold text-gray-800">分期付款詳細設定</h4>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-sm">📅</span>
                      繳費日期
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 hover:border-purple-300 bg-white"
                      value={expense.paymentDate}
                      onChange={(e) => updateExpense(expense.id, 'paymentDate', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-sm">🔄</span>
                      計算方式
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 hover:border-purple-300 bg-white"
                      value={expense.cycleType}
                      onChange={(e) => updateExpense(expense.id, 'cycleType', e.target.value)}
                    >
                      <option value="statement">🗓️ 帳單周期</option>
                      <option value="fixed">🔄 固定周期</option>
                    </select>
                  </div>

                  {expense.cycleType === 'fixed' && (
                    <div>
                      <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                        <span className="text-sm">📊</span>
                        周期天數
                      </label>
                      <input
                        type="number"
                        placeholder="30"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 hover:border-purple-300 bg-white"
                        min="1"
                        max="365"
                        value={expense.cycleDays || ''}
                        onChange={(e) => updateExpense(expense.id, 'cycleDays', parseInt(e.target.value) || 30)}
                      />
                    </div>
                  )}
                </div>

                {expense.type === 'annual-recurring' && (
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="mb-4">
                      <span className="text-lg font-semibold text-purple-700">💰 分期付款設定</span>
                    </div>
                    
                    {/* 統一的已繳期數/總期數界面 */}
                    <div className="flex items-end gap-4 mb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">已繳期數</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                          min="0"
                          value={expense.paidInstallments || ''}
                          onChange={(e) => updateExpense(expense.id, 'paidInstallments', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-center text-2xl font-bold text-purple-600 px-2">/</div>
                      
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">總期數</label>
                        <input
                          type="number"
                          placeholder="1"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                          min="1"
                          value={expense.totalInstallments || ''}
                          onChange={(e) => updateExpense(expense.id, 'totalInstallments', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                    
                    {/* 統一的進度條 */}
                    {(expense.paidInstallments > 0 || expense.totalInstallments > 1) && (
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div 
                            className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(((expense.paidInstallments || 0) / (expense.totalInstallments || 1)) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-sm text-purple-700 font-medium text-center">
                          已完成 {expense.paidInstallments || 0}/{expense.totalInstallments || 1} 期 
                          ({Math.round(((expense.paidInstallments || 0) / (expense.totalInstallments || 1)) * 100)}%)
                          {(expense.paidInstallments || 0) >= (expense.totalInstallments || 1) && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">✅ 已完成</span>
                          )}
                          {expense.isAnnualRecurring && (
                            <span className="text-gray-600"> (當年度進度)</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 年度重複模式選擇 */}
                    <div className="mb-4">
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <input
                          type="checkbox"
                          checked={expense.isAnnualRecurring || false}
                          onChange={(e) => updateExpense(expense.id, 'isAnnualRecurring', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-400"
                        />
                        <span className="text-sm font-medium text-purple-800">
                          🔄 每年重新開始分期 (適用於保險、繳稅等年度重複項目)
                        </span>
                      </label>
                    </div>

                    {/* 年度重複模式的進階設定 */}
                    {expense.isAnnualRecurring && (
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold text-purple-800">🔧 進階設定 - 跨年度期數調整</span>
                          <button
                            type="button"
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                            onClick={() => {
                              const currentYear = new Date().getFullYear();
                              const yearlyConfigs = expense.yearlyConfigs || {};
                              // 從下一年開始配置，或者找到還沒配置的最近年份
                              let nextYear = currentYear + 1;
                              while (yearlyConfigs[nextYear]) {
                                nextYear++;
                              }
                              updateExpense(expense.id, 'yearlyConfigs', {
                                ...yearlyConfigs,
                                [nextYear]: {
                                  year: nextYear,
                                  installments: expense.totalInstallments || 6,
                                  bank: expense.bank || '',
                                  amount: expense.amount || 0
                                }
                              });
                            }}
                          >
                            + 新增年度配置
                          </button>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 border border-purple-100 mb-4">
                          <p className="text-sm text-purple-700 mb-2">💡 當前年度使用上方的分期設定，下方可為未來年度設定不同的分期條件</p>
                          <p className="text-xs text-purple-600">例如：2025年用上方設定（凱基6期），2026年改用國泰12期</p>
                        </div>
                        
                        <div className="">
                          {expense.yearlyConfigs && Object.keys(expense.yearlyConfigs).length > 0 ? (
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-purple-800">📅 未來年度分期配置</h4>
                              {Object.entries(expense.yearlyConfigs).map(([year, config]) => (
                                <div key={year} className="bg-white rounded-lg p-4 border border-purple-200">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">{config.year}年</span>
                                    <button
                                      type="button"
                                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors duration-200"
                                      onClick={() => {
                                        const newConfigs = { ...expense.yearlyConfigs };
                                        delete newConfigs[year];
                                        updateExpense(expense.id, 'yearlyConfigs', newConfigs);
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  
                                  <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">分期期數</label>
                                      <input
                                        type="number"
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                                        placeholder="12"
                                        min="1"
                                        max="36"
                                        value={config.installments || ''}
                                        onChange={(e) => {
                                          updateExpense(expense.id, 'yearlyConfigs', {
                                            ...expense.yearlyConfigs,
                                            [year]: {
                                              ...config,
                                              installments: parseInt(e.target.value) || 1
                                            }
                                          });
                                        }}
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">銀行/信用卡</label>
                                      <input
                                        type="text"
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                                        placeholder="例：國泰世華"
                                        value={config.bank || ''}
                                        onChange={(e) => {
                                          updateExpense(expense.id, 'yearlyConfigs', {
                                            ...expense.yearlyConfigs,
                                            [year]: {
                                              ...config,
                                              bank: e.target.value
                                            }
                                          });
                                        }}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">每期金額 (NTD)</label>
                                      <input
                                        type="number"
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                                        placeholder="1544"
                                        min="0"
                                        value={config.amount || ''}
                                        onChange={(e) => {
                                          updateExpense(expense.id, 'yearlyConfigs', {
                                            ...expense.yearlyConfigs,
                                            [year]: {
                                              ...config,
                                              amount: parseFloat(e.target.value) || 0
                                            }
                                          });
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-white rounded-lg border border-purple-200">
                              <p className="text-purple-700">📋 未來年度將沿用當前設定（每年{expense.totalInstallments || 1}期），可新增不同年度的配置</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button 
        type="button" 
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-xl shadow-md hover:shadow-lg transition-colors duration-200 flex items-center justify-center gap-3" 
        onClick={addExpense}
      >
        <span className="text-xl">+</span>
        新增支出項目
      </button>
    </div>
  );
};

export default ExpenseSection;