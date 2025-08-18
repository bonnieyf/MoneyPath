import React from 'react';
import { 
  HomeIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const LoanSettings = ({ loanSettings, setLoanSettings }) => {

  return (
    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
          <HomeIcon className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">房貸條件設定</h2>
      </div>

      {/* 貸款條件設定 */}
      <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CogIcon className="w-5 h-5" />
          貸款參數設定
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              貸款成數 (%)
            </label>
            <input
              type="number"
              min="60"
              max="90"
              step="5"
              value={loanSettings.loanToValueRatio}
              onChange={(e) => setLoanSettings({
                ...loanSettings,
                loanToValueRatio: parseInt(e.target.value) || 80
              })}
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">通常為60-90%</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年利率 (%)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={loanSettings.interestRate}
              onChange={(e) => setLoanSettings({
                ...loanSettings,
                interestRate: parseFloat(e.target.value) || 2.5
              })}
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">當前市場約1.5-3%</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              貸款年限 (年)
            </label>
            <input
              type="number"
              min="10"
              max="40"
              step="5"
              value={loanSettings.loanTermYears}
              onChange={(e) => setLoanSettings({
                ...loanSettings,
                loanTermYears: parseInt(e.target.value) || 30
              })}
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">通常為20-40年</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <p className="text-sm text-gray-600">
          💡 設定完成後，按下「計算預測」即可查看基於這些條件的房貸能力評估結果
        </p>
      </div>
    </div>
  );
};

export default LoanSettings;