import React, { useRef, useState } from 'react';
import Papa from 'papaparse';

const CSVImport = ({ onImport }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const parseCSVData = (data) => {
    const expenses = [];
    let id = 1;

    data.forEach((row, index) => {
      if (index === 0) return; // 跳過標題行
      
      // 支援不同的 CSV 格式
      if (row.length >= 3) {
        let expense = {
          id: id++,
          name: '',
          amount: 0,
          type: 'monthly',
          paymentDate: '',
          cycleType: 'statement',
          cycleDays: 30,
          bank: '',
          paidInstallments: 0,
          totalInstallments: 1
        };

        // 判斷 CSV 格式
        if (row.length >= 10) {
          // 新完整格式: 繳費日期,項目名稱,金額,類型,銀行,已繳期數,總期數,計算方式,周期天數,年度重複
          expense.paymentDate = formatDate(row[0]);
          expense.name = row[1] || `項目${id}`;
          expense.amount = parseFloat(row[2]) || 0;
          expense.type = row[3] || 'monthly';
          expense.bank = row[4] || '';
          expense.paidInstallments = parseInt(row[5]) || 0;
          expense.totalInstallments = parseInt(row[6]) || 1;
          expense.cycleType = row[7] || 'statement';
          expense.cycleDays = parseInt(row[8]) || 30;
          expense.isAnnualRecurring = (row[9] === 'true' || row[9] === 'TRUE' || row[9] === '1');
          
          // 轉換舊的 credit-card 類型為 annual-recurring
          if (expense.type === 'credit-card') {
            expense.type = 'annual-recurring';
          }
        } else if (row.length >= 9) {
          // 舊完整格式: 繳費日期,項目名稱,金額,類型,銀行,已繳期數,總期數,計算方式,周期天數
          expense.paymentDate = formatDate(row[0]);
          expense.name = row[1] || `項目${id}`;
          expense.amount = parseFloat(row[2]) || 0;
          expense.type = row[3] || 'monthly';
          expense.bank = row[4] || '';
          expense.paidInstallments = parseInt(row[5]) || 0;
          expense.totalInstallments = parseInt(row[6]) || 1;
          expense.cycleType = row[7] || 'statement';
          expense.cycleDays = parseInt(row[8]) || 30;
          
          // 轉換舊的 credit-card 類型為 annual-recurring，並根據名稱判斷是否年度重複
          if (expense.type === 'credit-card') {
            expense.type = 'annual-recurring';
            // 判斷是否為年度重複項目（保險、稅務等）
            const name = expense.name.toLowerCase();
            expense.isAnnualRecurring = name.includes('保險') || name.includes('產險') || name.includes('人壽') || 
                                      name.includes('稅') || name.includes('牌照稅') || name.includes('燃料稅');
          }
          
          // 判斷 annual-recurring 類型是否為年度重複
          if (expense.type === 'annual-recurring') {
            const name = expense.name.toLowerCase();
            expense.isAnnualRecurring = name.includes('保險') || name.includes('產險') || name.includes('人壽') || 
                                      name.includes('稅') || name.includes('牌照稅') || name.includes('燃料稅');
          }
        } else if (row.length >= 5) {
          // 簡化格式: 繳費日期,項目名稱,金額,銀行,備註
          expense.paymentDate = formatDate(row[0]);
          expense.name = row[1] || `項目${id}`;
          expense.amount = parseFloat(row[2]) || 0;
          expense.bank = row[3] || '';
          
          // 從備註欄位解析類型
          const note = (row[4] || '').toLowerCase();
          if (note.includes('yearly') || note.includes('年')) {
            expense.type = 'yearly';
          } else if (note.includes('annual-recurring') || note.includes('年度重複') || note.includes('保險') || note.includes('稅')) {
            expense.type = 'annual-recurring';
            expense.isAnnualRecurring = true;
          } else if (note.includes('credit') || note.includes('分期')) {
            expense.type = 'annual-recurring';
            expense.isAnnualRecurring = false;
          } else {
            expense.type = 'monthly';
          }
        } else {
          // 舊格式: 繳費日期,項目名稱,金額,銀行
          expense.paymentDate = formatDate(row[0]);
          expense.name = row[1] || `項目${id}`;
          expense.amount = parseFloat(row[2]) || 0;
          expense.bank = row[3] || '';
        }

        // 檢查項目名稱是否包含分期信息 (如: 富邦產險4/12)
        if (expense.name.includes('/')) {
          const match = expense.name.match(/(\d+)\/(\d+)/);
          if (match) {
            expense.type = 'annual-recurring';
            expense.paidInstallments = parseInt(match[1]) - 1; // 當前第4期表示已繳了3期
            expense.totalInstallments = parseInt(match[2]);
            // 根據名稱判斷是否為年度重複項目
            const name = expense.name.toLowerCase();
            expense.isAnnualRecurring = name.includes('保險') || name.includes('產險') || name.includes('人壽') || 
                                      name.includes('稅') || name.includes('牌照稅') || name.includes('燃料稅');
            // 清理項目名稱，移除分期信息
            expense.name = expense.name.replace(/\d+\/\d+/, '').trim();
          }
        }

        // 自動判斷類型 (如果還是預設值)
        if (expense.type === 'monthly' && expense.paymentDate) {
          expense.type = 'annual-recurring';
          expense.isAnnualRecurring = false; // 預設為一般分期
        }

        expenses.push(expense);
      }
    });

    return expenses;
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
            const expenses = parseCSVData(results.data);
            onImport(expenses);
            alert(`成功匯入 ${expenses.length} 筆支出項目`);
          } catch (error) {
            alert('CSV 格式錯誤，請檢查檔案格式');
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
    <div className="section">
      <h2 className="section-title">📄 CSV 匯入</h2>
      
      <div 
        className={`csv-upload ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="csv-icon">📁</div>
        <div className="csv-text">
          <h3>拖拽 CSV 檔案到此處</h3>
          <p>或點擊選擇檔案</p>
        </div>
        <div className="csv-format-info">
          <div className="format-title">支援格式:</div>
          <div className="format-example">
            <strong>完整格式:</strong> 繳費日期,項目名稱,金額,類型,銀行,已繳期數,總期數,計算方式,周期天數
          </div>
          <div className="format-example">
            <strong>簡化格式:</strong> 繳費日期,項目名稱,金額,銀行,備註
          </div>
          <div className="format-sample">
            <strong>類型包含:</strong> monthly, yearly, annual-recurring, credit-card
          </div>
          <div className="format-sample">
            <strong>備註自動識別:</strong> 保險、稅 → annual-recurring
          </div>
          <div className="format-sample">
            <strong>範例:</strong> 2025-03-15,汽車保險,25000,annual-recurring,國泰,0,1,statement,30
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="file-input"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default CSVImport;