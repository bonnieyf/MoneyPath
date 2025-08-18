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

const IncomeSection = ({ income, setIncome }) => {

  const handleAmountChange = (amount) => {
    setIncome({ ...income, amount: parseFloat(amount) || 0 });
  };

  const handleBonusChange = (field, value) => {
    setIncome({
      ...income,
      bonus: {
        ...income.bonus,
        [field]: value
      }
    });
  };

  const addBonus = () => {
    const newBonus = {
      id: Date.now() + Math.random(),
      name: '',
      amount: 0,
      month: new Date().getMonth() + 1
    };
    
    setIncome({
      ...income,
      bonuses: [...(income.bonuses || []), newBonus]
    });
  };

  const removeBonus = (id) => {
    setIncome({
      ...income,
      bonuses: (income.bonuses || []).filter(bonus => bonus.id !== id)
    });
  };

  const updateBonus = (id, field, value) => {
    // 防禦性檢查：確保 value 不是事件對象
    if (value && typeof value === 'object' && value.nativeEvent) {
      console.error('Detected event object being passed to updateBonus:', value);
      return;
    }
    
    setIncome({
      ...income,
      bonuses: (income.bonuses || []).map(bonus =>
        bonus.id === id ? { ...bonus, [field]: value } : bonus
      )
    });
  };

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  return (
    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
          <CurrencyDollarIcon className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">收入設定</h2>
      </div>
      
      <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200">
        <label className="block text-sm font-medium text-slate-600 mb-3">收入類型</label>
        <div className="flex gap-4">
          <label className="flex items-center px-4 py-3 border-2 border-emerald-500 bg-emerald-50 rounded-lg cursor-pointer">
            <input
              type="radio"
              name="income-type"
              value="monthly"
              checked={true}
              readOnly
              className="w-4 h-4 mr-3 text-emerald-600"
            />
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5" />
              <span className="font-medium text-slate-700">月薪</span>
            </div>
          </label>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <label htmlFor="income-amount" className="flex items-center gap-2 mb-3 font-medium text-slate-700">
            <BanknotesIcon className="w-5 h-5" />
            基本薪資
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10">
              <span className="font-bold text-base text-emerald-600">NT$</span>
            </div>
            <input
              type="number"
              id="income-amount"
              className="w-full pl-14 pr-4 py-4 border-2 border-slate-200 rounded-lg transition-all duration-200 font-semibold text-lg bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="輸入您的薪資"
              min="0"
              value={income.amount || ''}
              onChange={(e) => handleAmountChange(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            每月薪資金額
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <label htmlFor="location" className="flex items-center gap-2 mb-3 font-medium text-slate-700">
            <MapPinIcon className="w-5 h-5" />
            居住地區
          </label>
          <select
            id="location"
            className="w-full px-4 py-4 border-2 border-slate-200 rounded-lg transition-all duration-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            value={income.location || '台北市'}
            onChange={(e) => setIncome({ ...income, location: e.target.value })}
          >
            <option value="台北市">台北市</option>
            <option value="新北市">新北市</option>
            <option value="桃園市">桃園市</option>
            <option value="台中市">台中市</option>
            <option value="台南市">台南市</option>
            <option value="高雄市">高雄市</option>
            <option value="基隆市">基隆市</option>
            <option value="新竹市">新竹市</option>
            <option value="嘉義市">嘉義市</option>
            <option value="其他縣市">其他縣市</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">影響負債比和購屋能力計算</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
              <GiftIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-emerald-700">年度分紅/獎金</h3>
          </div>
          <button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            onClick={addBonus}
          >
            <PlusIcon className="w-4 h-4" />
            新增分紅
          </button>
        </div>

        {income.bonuses && income.bonuses.length > 0 && (
          <div className="flex flex-col gap-4">
            {income.bonuses.map((bonus) => (
              <div key={bonus.id} className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-5 border-2 border-amber-200 relative shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                    <GiftIcon className="w-6 h-6" />
                  </div>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg px-3 py-1.5 text-sm"
                    onClick={() => removeBonus(bonus.id)}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="mb-4">
                    <label className="block mb-2 font-medium text-gray-700">分紅名稱</label>
                    <input
                      type="text"
                      className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="例如：年終獎金"
                      value={bonus.name || ''}
                      onChange={(e) => updateBonus(bonus.id, 'name', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block mb-2 font-medium text-gray-700">金額 (NTD)</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-blue-600 font-semibold text-base z-10">NT$</span>
                        <input
                          type="number"
                          className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pl-10 font-semibold text-lg"
                          placeholder="0"
                          min="0"
                          value={bonus.amount || ''}
                          onChange={(e) => updateBonus(bonus.id, 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block mb-2 font-medium text-gray-700">發放月份</label>
                      <select
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={bonus.month || 1}
                        onChange={(e) => updateBonus(bonus.id, 'month', parseInt(e.target.value))}
                      >
                        {monthNames.map((month, index) => (
                          <option key={index + 1} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {bonus.amount > 0 && (
                    <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-center gap-2 mb-4">
                        <SparklesIcon className="w-5 h-5" />
                        <h4 className="text-lg font-semibold text-gray-800">分紅分配規劃</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <CreditCardIcon className="w-4 h-4" />
                            生活消費 (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              className="w-full pr-8 pl-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                              placeholder="30"
                              min="0"
                              max="100"
                              value={bonus.allocation?.consumption || ''}
                              onChange={(e) => {
                                const percentage = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                updateBonus(bonus.id, 'allocation', {
                                  ...bonus.allocation,
                                  consumption: percentage
                                });
                              }}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
                          </div>
                          <div className="text-xs text-blue-600 font-semibold mt-1">
                            約 NT$ {Math.round((bonus.amount * (bonus.allocation?.consumption || 0)) / 100).toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <BuildingLibraryIcon className="w-4 h-4" />
                            存款 (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              className="w-full pr-8 pl-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                              placeholder="40"
                              min="0"
                              max="100"
                              value={bonus.allocation?.savings || ''}
                              onChange={(e) => {
                                const percentage = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                updateBonus(bonus.id, 'allocation', {
                                  ...bonus.allocation,
                                  savings: percentage
                                });
                              }}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
                          </div>
                          <div className="text-xs text-blue-600 font-semibold mt-1">
                            約 NT$ {Math.round((bonus.amount * (bonus.allocation?.savings || 0)) / 100).toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <ArrowTrendingUpIcon className="w-4 h-4" />
                            投資 (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              className="w-full pr-8 pl-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                              placeholder="20"
                              min="0"
                              max="100"
                              value={bonus.allocation?.investment || ''}
                              onChange={(e) => {
                                const percentage = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                updateBonus(bonus.id, 'allocation', {
                                  ...bonus.allocation,
                                  investment: percentage
                                });
                              }}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
                          </div>
                          <div className="text-xs text-blue-600 font-semibold mt-1">
                            約 NT$ {Math.round((bonus.amount * (bonus.allocation?.investment || 0)) / 100).toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <StarIcon className="w-4 h-4" />
                            特殊用途 (%)
                          </label>
                          <div className="relative mb-2">
                            <input
                              type="number"
                              className="w-full pr-8 pl-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                              placeholder="10"
                              min="0"
                              max="100"
                              value={bonus.allocation?.special || ''}
                              onChange={(e) => {
                                const percentage = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                updateBonus(bonus.id, 'allocation', {
                                  ...bonus.allocation,
                                  special: percentage
                                });
                              }}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
                          </div>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs"
                            placeholder="例如：旅遊基金"
                            value={bonus.allocation?.specialPurpose || ''}
                            onChange={(e) => updateBonus(bonus.id, 'allocation', {
                              ...bonus.allocation,
                              specialPurpose: e.target.value
                            })}
                          />
                          <div className="text-xs text-blue-600 font-semibold mt-1">
                            約 NT$ {Math.round((bonus.amount * (bonus.allocation?.special || 0)) / 100).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 bg-white rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">已分配比例：</span>
                          <span className={`text-sm font-bold ${
                            (bonus.allocation?.consumption || 0) + 
                            (bonus.allocation?.savings || 0) + 
                            (bonus.allocation?.investment || 0) + 
                            (bonus.allocation?.special || 0) === 100 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {(bonus.allocation?.consumption || 0) + 
                             (bonus.allocation?.savings || 0) + 
                             (bonus.allocation?.investment || 0) + 
                             (bonus.allocation?.special || 0)}%
                            {(bonus.allocation?.consumption || 0) + 
                             (bonus.allocation?.savings || 0) + 
                             (bonus.allocation?.investment || 0) + 
                             (bonus.allocation?.special || 0) === 100 ? ' ✅' : ' ⚠️'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {(!income.bonuses || income.bonuses.length === 0) && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <GiftIcon className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">尚未設定分紅或獎金</h3>
            <p className="mt-2 text-sm text-slate-600">
              開始新增您的年度分紅和獎金計劃，讓理財規劃更完整
            </p>
            <div className="mt-6">
              <button
                onClick={addBonus}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                新增第一筆分紅
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeSection;