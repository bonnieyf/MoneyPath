import React from 'react';

const PredictionSettings = ({ predictionMonths, setPredictionMonths }) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-xl">🔮</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">預測設定</h2>
      </div>
      
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="mb-6">
          <label htmlFor="prediction-months" className="flex items-center gap-2 mb-3 font-medium text-gray-700">
            <span className="text-lg">📅</span>
            預測期間
          </label>
          <div className="relative">
            <input
              type="number"
              id="prediction-months"
              className="w-full pr-16 pl-4 py-4 border-2 border-slate-200 rounded-lg transition-all duration-200 font-semibold text-lg bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              min="1"
              max="120"
              value={predictionMonths}
              onChange={(e) => setPredictionMonths(parseInt(e.target.value) || 12)}
              placeholder="12"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-purple-600">個月</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">設定理財預測的時間範圍 (1-120個月)</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <span className="block text-sm font-medium mb-3 text-purple-700">⚡ 快速選擇:</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { months: 6, label: '6個月', desc: '短期' },
              { months: 12, label: '1年', desc: '中期' },
              { months: 24, label: '2年', desc: '長期' },
              { months: 36, label: '3年', desc: '超長期' }
            ].map(option => (
              <button
                key={option.months}
                type="button"
                className={`p-3 rounded-lg text-center transition-all duration-200 border-2 hover:shadow-md ${
                  predictionMonths === option.months
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-purple-600 border-purple-300 hover:border-purple-500 hover:bg-purple-50'
                }`}
                onClick={() => setPredictionMonths(option.months)}
              >
                <div className="font-bold text-lg">{option.label}</div>
                <div className="text-xs opacity-75">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4 bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg text-purple-600">💡</span>
            <span className="text-sm font-medium text-purple-800">預測說明</span>
          </div>
          <p className="text-sm text-purple-700">
            預測將基於您的收入、支出和投資計劃，計算未來 <span className="font-bold">{predictionMonths}</span> 個月的財務狀況變化，
            包括資產累積、債務能力分析等重要指標。
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictionSettings;