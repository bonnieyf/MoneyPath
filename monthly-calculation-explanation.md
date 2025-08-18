# 📊 月度明細計算邏輯詳細說明

## 🔍 總體計算流程

月度明細計算是按月循環進行，每個月都會計算以下項目：

```
for (第1月 到 第N月) {
  1. 計算當月收入 (基本薪資 + 分紅)
  2. 計算當月支出 (依據不同支出類型)
  3. 計算當月淨收入 (收入 - 支出)
  4. 分配資金 (存款 + 投資 + 現金)
  5. 累積計算 (考慮利息/報酬)
  6. 記錄當月結果
}
```

## 💰 收入計算

### 基本收入
```javascript
// 月薪或年薪轉月薪
const monthlyIncome = income.type === 'yearly' ? income.amount / 12 : income.amount;
```

### 分紅計算
```javascript
// 檢查當月是否有分紅
income.bonuses.forEach(bonus => {
  if (bonus.month === 當前月份 && bonus.amount > 0) {
    // 按比例分配分紅
    存款分紅 = 分紅金額 × (存款分配% ÷ 100)
    投資分紅 = 分紅金額 × (投資分配% ÷ 100)
    消費分紅 = 分紅金額 × (消費分配% ÷ 100)
    特殊分紅 = 分紅金額 × (特殊分配% ÷ 100)
  }
});
```

### 當月總收入
```javascript
const totalMonthlyIncome = monthlyIncome + bonusData.total;
```

## 💸 支出計算

支出計算是最複雜的部分，需要根據不同類型分別處理：

### 1. 每月固定支出 (monthly)
```javascript
// 每月都扣除固定金額
monthlyAmount = expense.amount;
```

### 2. 年度支出 (yearly)
```javascript
// 只在指定月份扣除
if (當前月份 === 繳費月份) {
  monthlyAmount = expense.amount;
} else {
  monthlyAmount = 0;
}
```

### 3. 年度重複分期 (annual-recurring)
這是最複雜的類型，需要處理跨年度的分期：

```javascript
// 計算屬於哪個年度週期
if (當前月份 >= 繳費月份) {
  cycleYear = 當前年度;
} else {
  cycleYear = 上一年度;
}

// 如果是年度重複分期
if (expense.isAnnualRecurring) {
  // 檢查是否有年度配置變更
  yearConfig = expense.yearlyConfigs?.[cycleYear] || 主要配置;
  
  // 計算已繳期數
  已繳期數 = 初始已繳期數 + 從週期開始到現在的月數;
  
  // 檢查是否需要繳費
  if (已繳期數 < 總期數 && 在繳費時間) {
    monthlyAmount = yearConfig.amount;
  }
}
```

## 🎯 淨收入計算

```javascript
const monthlyNet = totalMonthlyIncome - monthlyExpenses;
```

## 📈 資金分配

### 基本分配
```javascript
// 基本存款和投資金額
let monthlySavings = investment.monthlySavings + bonusData.forSavings;
let monthlyInvestmentAmount = investment.monthlyInvestment + bonusData.forInvestment;
```

### 智能分配（可選）
```javascript
if (investment.autoAllocate && 有剩餘資金) {
  const remainingAmount = monthlyNet - monthlySavings - monthlyInvestmentAmount;
  
  // 按現有比例分配剩餘資金
  const savingsRatio = monthlySavings / (monthlySavings + monthlyInvestmentAmount);
  const investmentRatio = monthlyInvestmentAmount / (monthlySavings + monthlyInvestmentAmount);
  
  monthlySavings += remainingAmount × savingsRatio;
  monthlyInvestmentAmount += remainingAmount × investmentRatio;
}
```

## 💹 累積計算

### 存款累積
```javascript
if (investment.compoundInterest) {
  // 複利計算：(本金 + 利息) + 新投入
  cumulativeSavings = cumulativeSavings × (1 + 月利率) + monthlySavings;
} else {
  // 單利計算：直接累加
  cumulativeSavings += monthlySavings;
}
```

### 投資累積
```javascript
if (investment.compoundInterest) {
  // 複利計算：(本金 + 報酬) + 新投入
  cumulativeInvestment = cumulativeInvestment × (1 + 月報酬率) + monthlyInvestmentAmount;
} else {
  // 單利計算：直接累加
  cumulativeInvestment += monthlyInvestmentAmount;
}
```

### 現金累積
```javascript
// 現金流 = 淨收入 - 存款 - 投資
const monthlyCashFlow = monthlyNet - monthlySavings - monthlyInvestmentAmount;
cumulativeCash += monthlyCashFlow;
```

### 總資產
```javascript
const totalAssets = cumulativeCash + cumulativeSavings + cumulativeInvestment;
```

## 📋 實際計算範例

假設設定：
- **月薪**: 50,000
- **12月分紅**: 100,000 (存款30%, 投資40%, 消費30%)
- **月存款**: 10,000
- **月投資**: 15,000
- **年報酬率**: 7% (月報酬率 0.583%)
- **存款利率**: 1.5% (月利率 0.125%)

### 第1月計算 (8月)
```
收入: 50,000 (無分紅)
支出: 5,000 (假設)
淨收入: 45,000
存款: 10,000
投資: 15,000
現金流: 45,000 - 10,000 - 15,000 = 20,000

累積現金: 0 + 20,000 = 20,000
累積存款: 0 + 10,000 = 10,000
累積投資: 0 + 15,000 = 15,000
總資產: 45,000
```

### 第5月計算 (12月，有分紅)
```
收入: 50,000 + 100,000 = 150,000
支出: 5,000
淨收入: 145,000
存款: 10,000 + 30,000 (分紅30%) = 40,000
投資: 15,000 + 40,000 (分紅40%) = 55,000
現金流: 145,000 - 40,000 - 55,000 = 50,000

# 如果開啟複利計算
累積現金: 之前累積 + 50,000
累積存款: 之前累積 × 1.00125 + 40,000
累積投資: 之前累積 × 1.00583 + 55,000
```

## 🔧 特殊功能

### 1. 跨年度分期
- 自動檢測年度配置變更
- 支援不同年度的不同期數/金額/銀行

### 2. 分紅智能分配
- 按設定比例自動分配到不同用途
- 支援特殊用途自定義

### 3. 複利計算
- 存款和投資可分別選擇是否複利
- 月度複利計算更精確

這就是月度明細的完整計算邏輯！每個月都會按這個流程計算一次，最終形成完整的財務預測表。