const fs = require('fs');

// 1. Update App.jsx
let appContent = fs.readFileSync('src/App.jsx', 'utf8');

// Remove month state and useMemo
appContent = appContent.replace(
  /  const \[currentMonth, setCurrentMonth\] = useState\(''\);\n  const \[showAddMenu, setShowAddMenu\] = useState\(false\);\n\n  \/\/ Extract available months from transactions\n[\s\S]*?  const formatMonth = \(monthStr\) => \{[\s\S]*?  \};\n/m,
  "  const [showAddMenu, setShowAddMenu] = useState(false);\n"
);

// Remove filteredTransactions logic
appContent = appContent.replace(
  /  \/\/ Filter transactions for Dashboard and Table\n  const filteredTransactions = activeTab === 'dashboard' && currentMonth \n    \? transactions\.filter\(t => t\.date && t\.date\.startsWith\(currentMonth\)\)\n    : transactions;\n/m,
  ""
);

// Replace filteredTransactions with transactions in props
appContent = appContent.replace(/filteredTransactions/g, 'transactions');

// Remove month picker UI
appContent = appContent.replace(
  /          \{activeTab === 'dashboard' && availableMonths\.length > 0 && \([\s\S]*?          \)\}\n\n          <div style=\{\{ position: 'relative' \}\}>/,
  "          <div style={{ position: 'relative' }}>"
);

// Filter out positive amounts in handleTransactionsParsed
appContent = appContent.replace(
  /    const categorizedNewTxs = uniqueNewTxs\.map\(t => \{[\s\S]*?    \}\);/m,
  `    const categorizedNewTxs = uniqueNewTxs.map(t => {
      const classification = categorize(t.description, t.amount, rules);
      return {
        ...t,
        type: classification.type,
        category: classification.category,
        subcategory: classification.subcategory
      };
    }).filter(t => t.amount < 0 && t.type !== 'Receita');`
);

fs.writeFileSync('src/App.jsx', appContent, 'utf8');
console.log('Updated App.jsx');

// 2. Update Dashboard.jsx
let dashContent = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

dashContent = dashContent.replace(
  /  \/\/ Calculations\n  const totalIncome = transactions[\s\S]*?  const totalExpense = transactions[\s\S]*?    \}\, \{\}\);/m,
  `  // Calculations
  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Group by category and subcategory (Despesas)
  const expenseCategoryData = transactions
    .filter(t => (t.type === 'Despesa' || (!t.type && t.amount < 0)))
    .reduce((acc, t) => {
      const cat = t.category || 'Outros';
      const sub = t.subcategory || 'Outros';
      const amt = Math.abs(t.amount);
      
      if (!acc[cat]) {
        acc[cat] = { total: 0, subcategories: {} };
      }
      acc[cat].total += amt;
      acc[cat].subcategories[sub] = (acc[cat].subcategories[sub] || 0) + amt;
      return acc;
    }, {});`
);

// Remove income category grouping
dashContent = dashContent.replace(
  /  \/\/ Group by category and subcategory \(Receitas\)[\s\S]*?    \}\)\)\n    \.sort\(\(a, b\) => b\.total - a\.total\);/m,
  ""
);

// Remove KPI cards except Despesas
dashContent = dashContent.replace(
  /      <div className="dashboard-grid">\n        <div className="glass-card kpi-card revenue">[\s\S]*?      <\/div>\n\n            \{\/\* Categories Breakdown \*\/\}/m,
  `      <div className="dashboard-grid" style={{ display: 'flex' }}>
        <div className="glass-card kpi-card expense" style={{ flex: 1 }}>
          <div className="kpi-label">
            <span>Despesas</span>
            <TrendingDown size={20} style={{ color: 'var(--danger)' }} />
          </div>
          <div className="kpi-value" style={{ color: '#fff' }}>{formatCurrency(totalExpense)}</div>
          <div className="kpi-trend negative">Total de saídas registradas</div>
        </div>
      </div>

            {/* Categories Breakdown */}`
);

// Remove Receitas categories column
dashContent = dashContent.replace(
  /        \{\/\* Incomes \*\/\}[\s\S]*?<\/div>\n    <\/div>\n  \);\n\}\n/m,
  `      </div>\n    </div>\n  );\n}\n`
);

// Fix the grid template to be just one column if we only have expenses
dashContent = dashContent.replace(
  /      <div style=\{\{ display: 'grid', gridTemplateColumns: 'repeat\(auto-fit, minmax\(300px, 1fr\)\)', gap: '2rem' \}\}>/g,
  `      <div>`
);

fs.writeFileSync('src/components/Dashboard.jsx', dashContent, 'utf8');
console.log('Updated Dashboard.jsx');
