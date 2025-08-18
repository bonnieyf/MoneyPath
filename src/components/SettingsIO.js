import React, { useRef, useState } from 'react';
import Papa from 'papaparse';

const SettingsIO = ({ 
  income, 
  expenses, 
  investment, 
  predictionMonths,
  loanSettings,
  earlyPaymentSchedule,
  loans,
  onImportSettings 
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // 匯出完整設定到CSV
  const exportSettings = () => {
    const csvData = [];
    
    // Section 1: 基本設定
    csvData.push(['[BASIC_SETTINGS]']);
    csvData.push(['設定項目', '值']);
    csvData.push(['收入類型', income.type]);
    csvData.push(['收入金額', income.amount]);
    csvData.push(['居住地區', income.location || '台北市']);
    csvData.push(['預測月份', predictionMonths]);
    csvData.push(['月存款', investment.monthlySavings || 0]);
    csvData.push(['月投資', investment.monthlyInvestment || 0]);
    csvData.push(['年報酬率', investment.annualReturn || 7]);
    csvData.push(['存款利率', investment.savingsRate || 1.5]);
    csvData.push(['風險等級', investment.riskLevel || 'moderate']);
    csvData.push(['複利計算', investment.compoundInterest ? 'true' : 'false']);
    csvData.push(['自動分配', investment.autoAllocate ? 'true' : 'false']);
    csvData.push(['貸款成數', loanSettings?.loanToValueRatio || 80]);
    csvData.push(['利率', loanSettings?.interestRate || 2.5]);
    csvData.push(['貸款年限', loanSettings?.loanTermYears || 30]);
    csvData.push(['']); // 空行分隔
    
    // Section 2: 分紅設定
    csvData.push(['[BONUSES]']);
    csvData.push(['名稱', '月份', '金額', '存款分配%', '投資分配%', '消費分配%', '特殊分配%', '特殊用途']);
    if (income.bonuses && income.bonuses.length > 0) {
      income.bonuses.forEach(bonus => {
        csvData.push([
          bonus.name || '',
          bonus.month || '',
          bonus.amount || 0,
          bonus.allocation?.savings || 0,
          bonus.allocation?.investment || 0,
          bonus.allocation?.consumption || 0,
          bonus.allocation?.special || 0,
          bonus.allocation?.specialPurpose || ''
        ]);
      });
    }
    csvData.push(['']); // 空行分隔
    
    // Section 3: 信貸設定
    csvData.push(['[LOANS]']);
    csvData.push(['信貸名稱', '原始貸款金額', '年利率', '已繳期數', '總期數', '啟用提前還款', '提前還款金額', '還款月份']);
    if (loans && loans.length > 0) {
      loans.forEach(loan => {
        csvData.push([
          loan.name || '',
          loan.originalAmount || 0,
          loan.annualRate || 2.5,
          loan.paidPeriods || 0,
          loan.totalPeriods || 0,
          loan.enablePrepayment ? 'true' : 'false',
          loan.prepaymentAmount || 0,
          loan.prepaymentMonth || 1
        ]);
      });
    }
    csvData.push(['']); // 空行分隔
    
    // Section 4: 支出項目
    csvData.push(['[EXPENSES]']);
    csvData.push([
      '繳費日期', '項目名稱', '金額', '類型', '銀行', '已繳期數', '總期數', 
      '計算方式', '周期天數', '年度重複', '年度配置', '提前清償', '清償月份'
    ]);
    
    expenses.forEach(expense => {
      // 處理年度配置
      let yearlyConfigStr = '';
      if (expense.yearlyConfigs) {
        const configs = Object.entries(expense.yearlyConfigs).map(([year, config]) => {
          return `${year}:${config.installments}:${config.amount}:${config.bank || ''}`;
        });
        yearlyConfigStr = configs.join('|');
      }
      
      // 檢查是否有提前清償設定
      const hasEarlyPayoff = earlyPaymentSchedule && earlyPaymentSchedule[expense.id];
      const payoffMonth = hasEarlyPayoff ? earlyPaymentSchedule[expense.id] : '';
      
      csvData.push([
        expense.paymentDate || '',
        expense.name || '',
        expense.amount || 0,
        expense.type || 'monthly',
        expense.bank || '',
        expense.paidInstallments || 0,
        expense.totalInstallments || 1,
        expense.cycleType || 'statement',
        expense.cycleDays || 30,
        expense.isAnnualRecurring ? 'true' : 'false',
        yearlyConfigStr,
        hasEarlyPayoff ? 'true' : 'false',
        payoffMonth
      ]);
    });
    
    // 生成CSV內容
    const csvContent = csvData.map(row => 
      row.map(cell => {
        const str = String(cell || '');
        // 如果包含逗號、雙引號或換行符，需要用雙引號包圍
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');
    
    // 創建下載
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `理財設定_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('設定匯出成功！');
  };

  // 解析CSV並匯入設定
  const parseSettingsCSV = (data) => {
    const settings = {
      income: { type: 'monthly', amount: 0, bonuses: [] },
      expenses: [],
      loans: [],
      investment: {
        monthlySavings: 0,
        monthlyInvestment: 0,
        annualReturn: 7,
        savingsRate: 1.5,
        riskLevel: 'moderate',
        compoundInterest: true,
        autoAllocate: false
      },
      predictionMonths: 12,
      loanSettings: {
        loanToValueRatio: 80,
        interestRate: 2.5,
        loanTermYears: 30
      },
      earlyPaymentSchedule: {}
    };
    
    let currentSection = '';
    let expenseId = 1;
    
    data.forEach((row, index) => {
      if (row.length === 0 || (row.length === 1 && !row[0])) return; // 跳過空行
      
      const firstCell = String(row[0] || '').trim().replace(/^\uFEFF/, ''); // 移除BOM字符
      
      // 檢查是否是section標記
      if (firstCell.startsWith('[') && firstCell.endsWith(']')) {
        currentSection = firstCell;
        return;
      }
      
      // 跳過標題行
      if (firstCell === '設定項目' || firstCell === '名稱' || firstCell === '繳費日期' || firstCell === '信貸名稱') {
        return;
      }
      
      try {
        switch (currentSection) {
          case '[BASIC_SETTINGS]':
            if (row.length >= 2) {
              const key = firstCell;
              const value = String(row[1] || '').trim();
              
              switch (key) {
                case '收入類型':
                  settings.income.type = value;
                  break;
                case '收入金額':
                  const parsedAmount = parseFloat(value) || 0;
                  console.log('解析收入金額:', value, 'parseFloat結果:', parsedAmount, 'type:', typeof parsedAmount);
                  settings.income.amount = parsedAmount;
                  break;
                case '居住地區':
                  settings.income.location = value || '台北市';
                  break;
                case '預測月份':
                  settings.predictionMonths = parseInt(value) || 12;
                  break;
                case '月存款':
                  settings.investment.monthlySavings = parseFloat(value) || 0;
                  break;
                case '月投資':
                  settings.investment.monthlyInvestment = parseFloat(value) || 0;
                  break;
                case '年報酬率':
                  settings.investment.annualReturn = parseFloat(value) || 7;
                  break;
                case '存款利率':
                  settings.investment.savingsRate = parseFloat(value) || 1.5;
                  break;
                case '風險等級':
                  settings.investment.riskLevel = value || 'moderate';
                  break;
                case '複利計算':
                  settings.investment.compoundInterest = value === 'true';
                  break;
                case '自動分配':
                  settings.investment.autoAllocate = value === 'true';
                  break;
                case '貸款成數':
                  settings.loanSettings.loanToValueRatio = parseInt(value) || 80;
                  break;
                case '利率':
                  settings.loanSettings.interestRate = parseFloat(value) || 2.5;
                  break;
                case '貸款年限':
                  settings.loanSettings.loanTermYears = parseInt(value) || 30;
                  break;
              }
            }
            break;
            
          case '[BONUSES]':
            if (row.length >= 3) {
              const bonus = {
                id: Date.now() + Math.random() + settings.income.bonuses.length,
                name: String(row[0] || '').trim(),
                month: parseInt(row[1]) || 1,
                amount: parseFloat(row[2]) || 0,
                allocation: {
                  savings: parseFloat(row[3]) || 0,
                  investment: parseFloat(row[4]) || 0,
                  consumption: parseFloat(row[5]) || 0,
                  special: parseFloat(row[6]) || 0,
                  specialPurpose: String(row[7] || '').trim()
                }
              };
              if (bonus.name) {
                settings.income.bonuses.push(bonus);
              }
            }
            break;
            
          case '[LOANS]':
            if (row.length >= 5) {
              const loan = {
                id: Date.now() + Math.random() + settings.loans.length,
                name: String(row[0] || '').trim(),
                originalAmount: parseFloat(row[1]) || 0,
                annualRate: parseFloat(row[2]) || 2.5,
                paidPeriods: parseInt(row[3]) || 0,
                totalPeriods: parseInt(row[4]) || 0,
                enablePrepayment: String(row[5] || 'false').trim() === 'true',
                prepaymentAmount: parseFloat(row[6]) || 0,
                prepaymentMonth: parseInt(row[7]) || 1
              };
              if (loan.name || loan.originalAmount > 0) {
                settings.loans.push(loan);
              }
            }
            break;
            
          case '[EXPENSES]':
            if (row.length >= 3) {
              const expense = {
                id: expenseId++,
                paymentDate: formatDate(String(row[0] || '').trim()),
                name: String(row[1] || '').trim(),
                amount: parseFloat(row[2]) || 0,
                type: String(row[3] || 'monthly').trim(),
                bank: String(row[4] || '').trim(),
                paidInstallments: parseInt(row[5]) || 0,
                totalInstallments: parseInt(row[6]) || 1,
                cycleType: String(row[7] || 'statement').trim(),
                cycleDays: parseInt(row[8]) || 30,
                isAnnualRecurring: String(row[9] || 'false').trim() === 'true'
              };
              
              // 解析年度配置
              const yearlyConfigStr = String(row[10] || '').trim();
              if (yearlyConfigStr) {
                expense.yearlyConfigs = {};
                const configs = yearlyConfigStr.split('|');
                configs.forEach(configStr => {
                  const parts = configStr.split(':');
                  if (parts.length >= 3) {
                    const year = parseInt(parts[0]);
                    const installments = parseInt(parts[1]);
                    const amount = parseFloat(parts[2]);
                    const bank = parts[3] || '';
                    
                    if (year && installments && amount) {
                      expense.yearlyConfigs[year] = {
                        installments,
                        amount,
                        bank
                      };
                    }
                  }
                });
              }
              
              // 處理提前清償設定
              const hasEarlyPayoff = String(row[11] || 'false').trim() === 'true';
              const payoffMonth = parseInt(row[12]) || null;
              
              if (hasEarlyPayoff && payoffMonth) {
                settings.earlyPaymentSchedule[expense.id] = payoffMonth;
              }
              
              if (expense.name) {
                settings.expenses.push(expense);
              }
            }
            break;
        }
      } catch (error) {
        console.warn(`解析第 ${index + 1} 行時發生錯誤:`, error);
      }
    });
    
    return settings;
  };

  // 統一日期格式
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    // 轉換 2025/03/31 為 2025-03-31
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const year = parts[0].padStart(4, '0');
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    return dateStr;
  };

  const handleFileSelect = (file) => {
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        complete: (results) => {
          try {
            console.log('CSV解析結果:', results.data);
            const settings = parseSettingsCSV(results.data);
            console.log('解析後的設定:', settings);
            onImportSettings(settings);
            alert('設定匯入成功！');
          } catch (error) {
            console.error('匯入錯誤:', error);
            console.error('錯誤詳細資訊:', error.message);
            console.error('錯誤堆疊:', error.stack);
            alert(`CSV 匯入錯誤: ${error.message}`);
          }
        },
        error: (error) => {
          alert('讀取 CSV 檔案失敗: ' + error.message);
        }
      });
    } else {
      alert('請選擇 CSV 格式的檔案');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-xl">⚙️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">完整設定匯入匯出</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <button 
          className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3"
          onClick={exportSettings}
        >
          <span className="text-xl">📤</span>
          匯出所有設定
        </button>
        
        <div 
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 hover:shadow-md ${
            dragOver ? 'border-slate-400 bg-slate-100' : 'border-slate-200 bg-white'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">{dragOver ? '📁' : '📥'}</span>
            <span className="font-medium text-gray-700">
              {dragOver ? '放開檔案以匯入' : '點擊或拖拽 CSV 檔案'}
            </span>
            <span className="text-xs text-gray-500">支援拖拽上傳</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📋</span>
          <span className="font-semibold text-gray-800">包含設定項目</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-slate-600">✓</span>
            💰 收入設定（月薪、分紅配置）
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-slate-600">✓</span>
            💳 信貸管理（月繳、期數、提前還款）
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-slate-600">✓</span>
            💸 所有支出項目（含年度配置）
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-slate-600">✓</span>
            📈 投資設定（存款、投資金額、報酬率）
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-slate-600">✓</span>
            🏠 房貸設定（成數、利率、年限）
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-slate-600">✓</span>
            ⏱️ 預測月份與提前清償設定
          </div>
        </div>
        
        <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 text-gray-800">
            <span className="text-slate-600">💡</span>
            <span className="text-sm font-medium">使用說明</span>
          </div>
          <p className="text-xs text-gray-700 mt-1">
            匯出的 CSV 檔案包含所有設定內容，包括新的信貸管理功能。可用於備份或在其他裝置上恢復配置。
            重新登入時只需匯入檔案即可快速恢復所有設定，包括信貸月繳金額、期數進度和提前還款規劃。
          </p>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default SettingsIO;