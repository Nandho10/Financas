const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// Replace category data generation logic
content = content.replace(
  "  // Group by category and subcategory\n  const categoryData = transactions\n    .filter(t => t.amount < 0)\n    .reduce((acc, t) => {\n      const cat = t.category || 'Outros';\n      const sub = t.subcategory || 'Outros';\n      const amt = Math.abs(t.amount);\n      \n      if (!acc[cat]) {\n        acc[cat] = { total: 0, subcategories: {} };\n      }\n      acc[cat].total += amt;\n      acc[cat].subcategories[sub] = (acc[cat].subcategories[sub] || 0) + amt;\n      return acc;\n    }, {});\n\n  const totalExpenseCalculated = Object.values(categoryData).reduce((sum, item) => sum + item.total, 0);\n\n  const sortedCategories = Object.entries(categoryData)\n    .map(([category, data]) => ({\n      category,\n      total: data.total,\n      percentage: totalExpenseCalculated > 0 ? (data.total / totalExpenseCalculated) * 100 : 0,\n      subcategories: Object.entries(data.subcategories)\n        .map(([sub, val]) => ({\n          subcategory: sub,\n          value: val,\n          percentage: data.total > 0 ? (val / data.total) * 100 : 0\n        }))\n        .sort((a, b) => b.value - a.value)\n    }))\n    .sort((a, b) => b.total - a.total);",
  `  // Group by category and subcategory (Despesas)
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
    }, {});

  const totalExpenseCalculated = Object.values(expenseCategoryData).reduce((sum, item) => sum + item.total, 0);

  const sortedExpenseCategories = Object.entries(expenseCategoryData)
    .map(([category, data]) => ({
      category,
      total: data.total,
      percentage: totalExpenseCalculated > 0 ? (data.total / totalExpenseCalculated) * 100 : 0,
      subcategories: Object.entries(data.subcategories)
        .map(([sub, val]) => ({
          subcategory: sub,
          value: val,
          percentage: data.total > 0 ? (val / data.total) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value)
    }))
    .sort((a, b) => b.total - a.total);

  // Group by category and subcategory (Receitas)
  const incomeCategoryData = transactions
    .filter(t => (t.type === 'Receita' || (!t.type && t.amount > 0)))
    .reduce((acc, t) => {
      const cat = t.category || 'Outras Receitas';
      const sub = t.subcategory || 'Outros';
      const amt = Math.abs(t.amount);
      
      if (!acc[cat]) {
        acc[cat] = { total: 0, subcategories: {} };
      }
      acc[cat].total += amt;
      acc[cat].subcategories[sub] = (acc[cat].subcategories[sub] || 0) + amt;
      return acc;
    }, {});

  const totalIncomeCalculated = Object.values(incomeCategoryData).reduce((sum, item) => sum + item.total, 0);

  const sortedIncomeCategories = Object.entries(incomeCategoryData)
    .map(([category, data]) => ({
      category,
      total: data.total,
      percentage: totalIncomeCalculated > 0 ? (data.total / totalIncomeCalculated) * 100 : 0,
      subcategories: Object.entries(data.subcategories)
        .map(([sub, val]) => ({
          subcategory: sub,
          value: val,
          percentage: data.total > 0 ? (val / data.total) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value)
    }))
    .sort((a, b) => b.total - a.total);`
);

content = content.replace(
  "      case 'Pagamentos': return '#84cc16';",
  "      case 'Pagamentos': return '#84cc16';\n      case 'Benefícios': return '#34d399';\n      case 'Fixa mensal': return '#10b981';\n      case 'Vendas': return '#059669';\n      case 'Outras Receitas': return '#14b8a6';\n      case 'Comissão': return '#6ee7b7';"
);

// We need to render the new Income categories.
// We'll replace the existing rendering logic.
// Find: {/* Categories Breakdown */}
const newRender = `      {/* Categories Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Expenses */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Gastos por Categoria</h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Despesas registradas no período.
          </p>
          
          {sortedExpenseCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
              Nenhuma despesa para exibir.
            </div>
          ) : (
            <div className="category-progress-list">
              {sortedExpenseCategories.map(({ category, total, percentage, subcategories }) => {
                const isExpanded = expandedCategory === 'exp_'+category;
                const color = getCategoryColor(category);

                return (
                  <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: isExpanded ? 'rgba(255,255,255,0.01)' : 'transparent', padding: isExpanded ? '0.75rem' : '0', borderRadius: '8px', transition: 'all var(--transition-fast)' }}>
                    <div 
                      className="cat-progress-item" 
                      onClick={() => toggleExpand('exp_'+category)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="cat-progress-header">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          {category}
                        </span>
                        <span style={{ fontWeight: 700 }}>
                          {formatCurrency(total)} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>({percentage.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ 
                            width: \`\${percentage}%\`, 
                            backgroundColor: color,
                            boxShadow: \`0 0 10px \${color}44\`
                          }}
                        />
                      </div>
                    </div>

                    {/* Subcategories drill down */}
                    {isExpanded && (
                      <div style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: \`1px solid \${color}44\` }}>
                        {subcategories.map(({ subcategory, value, percentage: subPct }) => (
                          <div key={subcategory} style={{ fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                              <span>{subcategory}</span>
                              <span>{formatCurrency(value)} ({subPct.toFixed(0)}%)</span>
                            </div>
                            <div className="progress-bar-bg" style={{ height: '4px' }}>
                              <div 
                                className="progress-bar-fill"
                                style={{ width: \`\${subPct}%\`, backgroundColor: color, opacity: 0.6 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Incomes */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Receitas por Categoria</h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Entradas e rendimentos no período.
          </p>
          
          {sortedIncomeCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
              Nenhuma receita para exibir.
            </div>
          ) : (
            <div className="category-progress-list">
              {sortedIncomeCategories.map(({ category, total, percentage, subcategories }) => {
                const isExpanded = expandedCategory === 'inc_'+category;
                const color = getCategoryColor(category) || 'var(--success)';

                return (
                  <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: isExpanded ? 'rgba(255,255,255,0.01)' : 'transparent', padding: isExpanded ? '0.75rem' : '0', borderRadius: '8px', transition: 'all var(--transition-fast)' }}>
                    <div 
                      className="cat-progress-item" 
                      onClick={() => toggleExpand('inc_'+category)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="cat-progress-header">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          {category}
                        </span>
                        <span style={{ fontWeight: 700 }}>
                          {formatCurrency(total)} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>({percentage.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ 
                            width: \`\${percentage}%\`, 
                            backgroundColor: color,
                            boxShadow: \`0 0 10px \${color}44\`
                          }}
                        />
                      </div>
                    </div>

                    {/* Subcategories drill down */}
                    {isExpanded && (
                      <div style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: \`1px solid \${color}44\` }}>
                        {subcategories.map(({ subcategory, value, percentage: subPct }) => (
                          <div key={subcategory} style={{ fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                              <span>{subcategory}</span>
                              <span>{formatCurrency(value)} ({subPct.toFixed(0)}%)</span>
                            </div>
                            <div className="progress-bar-bg" style={{ height: '4px' }}>
                              <div 
                                className="progress-bar-fill"
                                style={{ width: \`\${subPct}%\`, backgroundColor: color, opacity: 0.6 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;

content = content.replace(/\{\/\* Categories Breakdown \*\/\}[\s\S]*$/, newRender);

fs.writeFileSync('src/components/Dashboard.jsx', content, 'utf8');
console.log('Dashboard updated');
