import React, { useState } from 'react';

const ResultsSection = ({ 
  results, 
  income, 
  expenses, 
  investment, 
  predictionMonths, 
  loanSettings, 
  onRecalculate 
}) => {
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

  return (
    <div className="space-y-8">
      {/* 簡化版財務分析 */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            財務分析總覽 (簡化版)
          </h2>
          <p className="text-gray-600 mt-2">正在調試模式中...</p>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">月淨收入</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(results?.summary?.monthlyNet || 0)}
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">期末總資產</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(results?.finalAmounts?.total || 0)}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">基本資訊</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>結果對象類型: {typeof results}</p>
              <p>包含 summary: {results.summary ? 'Yes' : 'No'}</p>
              <p>包含 monthlyData: {results.monthlyData ? 'Yes' : 'No'}</p>
              <p>包含 finalAmounts: {results.finalAmounts ? 'Yes' : 'No'}</p>
              {results.monthlyData && (
                <p>月度資料長度: {results.monthlyData.length}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;