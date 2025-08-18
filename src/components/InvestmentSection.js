import React from 'react';

const InvestmentSection = ({ investment, setInvestment, availableAmount = 0 }) => {
  const handleInputChange = (field, value) => {
    setInvestment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 安全的百分比計算
  const getSavingsPercentage = () => {
    if (!availableAmount || availableAmount <= 0) return 0;
    return Math.round(((investment.monthlySavings || 0) / availableAmount) * 100);
  };

  const getInvestmentPercentage = () => {
    if (!availableAmount || availableAmount <= 0) return 0;
    return Math.round(((investment.monthlyInvestment || 0) / availableAmount) * 100);
  };


  return (
    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-xl">💎</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">投資理財計劃</h2>
      </div>
      
      <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg text-blue-600">💰</span>
              <span className="text-sm font-medium text-blue-700">可用於理財的月淨收入</span>
            </div>
            <span className="text-xl font-bold text-blue-700">
              {availableAmount > 0 ? `NT$ ${availableAmount.toLocaleString()}` : 'NT$ 0'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎯</span>
          <h3 className="text-lg font-semibold text-gray-800">月淨收入分配</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              🏦 存款比例
            </label>
            <div className="relative mb-2">
              <input
                type="number"
                className="w-full pr-8 pl-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                placeholder="30"
                min="0"
                max="100"
                value={investment.savingsPercentage || ''}
                onChange={(e) => {
                  const percentage = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                  handleInputChange('savingsPercentage', percentage);
                  handleInputChange('monthlySavings', (availableAmount * percentage) / 100);
                }}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
            </div>
            <div className="text-xs text-purple-600 font-semibold">
              約 NT$ {investment.monthlySavings ? Math.round(investment.monthlySavings).toLocaleString() : '0'}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              📈 投資比例
            </label>
            <div className="relative mb-2">
              <input
                type="number"
                className="w-full pr-8 pl-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                placeholder="50"
                min="0"
                max="100"
                value={investment.investmentPercentage || ''}
                onChange={(e) => {
                  const percentage = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                  handleInputChange('investmentPercentage', percentage);
                  handleInputChange('monthlyInvestment', (availableAmount * percentage) / 100);
                }}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
            </div>
            <div className="text-xs text-purple-600 font-semibold">
              約 NT$ {investment.monthlyInvestment ? Math.round(investment.monthlyInvestment).toLocaleString() : '0'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 border border-gray-300">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              💵 保留現金
            </label>
            <div className="text-lg font-bold text-gray-800 mb-1">
              {100 - (investment.savingsPercentage || 0) - (investment.investmentPercentage || 0)}%
            </div>
            <div className="text-xs text-gray-600 font-semibold">
              約 NT$ {Math.round(availableAmount - (investment.monthlySavings || 0) - (investment.monthlyInvestment || 0)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-blue-100">
          <label className="flex items-center gap-2 mb-3 font-medium text-gray-700">
            <span className="text-lg">📊</span>
            年化報酬率
          </label>
          <div className="relative">
            <input
              type="number"
              className="w-full pr-8 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white font-semibold"
              placeholder="7.0"
              min="0"
              max="50"
              step="0.1"
              value={investment.annualReturn || ''}
              onChange={(e) => handleInputChange('annualReturn', parseFloat(e.target.value) || 0)}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-bold">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">預期投資年化報酬率</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-blue-100">
          <label className="flex items-center gap-2 mb-3 font-medium text-gray-700">
            <span className="text-lg">🏦</span>
            存款利率
          </label>
          <div className="relative">
            <input
              type="number"
              className="w-full pr-8 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white font-semibold"
              placeholder="1.5"
              min="0"
              max="10"
              step="0.1"
              value={investment.savingsRate || ''}
              onChange={(e) => handleInputChange('savingsRate', parseFloat(e.target.value) || 1.5)}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-bold">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">銀行定存或儲蓄帳戶利率</p>
        </div>
      </div>


      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-200 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚙️</span>
          <h3 className="text-lg font-semibold text-gray-800">投資選項設定</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-cyan-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={investment.compoundInterest || false}
                onChange={(e) => handleInputChange('compoundInterest', e.target.checked)}
                className="w-5 h-5 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-400"
              />
              <div className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                <span className="font-medium text-gray-800">啟用複利計算</span>
              </div>
            </label>
            <p className="text-sm text-gray-600 mt-2 ml-8">投資收益將自動再投資，產生複利效果</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-cyan-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={investment.autoAllocate || false}
                onChange={(e) => handleInputChange('autoAllocate', e.target.checked)}
                className="w-5 h-5 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-400"
              />
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span className="font-medium text-gray-800">智能分配剩餘資金</span>
              </div>
            </label>
            <p className="text-sm text-gray-600 mt-2 ml-8">自動將收支結餘按比例分配到存款和投資</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📋</span>
          <h3 className="text-lg font-semibold text-gray-800">投資計劃總結</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center border border-green-100">
            <div className="text-sm text-gray-600 mb-1">月存款</div>
            <div className="text-lg font-bold text-green-600">
              {investment.monthlySavings ? `NT$ ${Math.round(investment.monthlySavings).toLocaleString()}` : 'NT$ 0'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center border border-green-100">
            <div className="text-sm text-gray-600 mb-1">月投資</div>
            <div className="text-lg font-bold text-blue-600">
              {investment.monthlyInvestment ? `NT$ ${Math.round(investment.monthlyInvestment).toLocaleString()}` : 'NT$ 0'}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg p-4 text-center border border-emerald-200">
            <div className="text-sm text-gray-700 mb-1 font-medium">總月投入</div>
            <div className="text-xl font-bold text-emerald-700">
              NT$ {Math.round((investment.monthlySavings || 0) + (investment.monthlyInvestment || 0)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSection;