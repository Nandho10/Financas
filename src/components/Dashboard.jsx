import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ChevronDown, ChevronRight } from 'lucide-react';

export default function Dashboard({ transactions }) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Calculations
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



  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Alimentação': return '#f59e0b';
      case 'Confeitaria': return '#06b6d4';
      case 'Transporte': return '#3b82f6';
      case 'Saúde': return '#10b981';
      case 'Lazer': return '#ec4899';
      case 'Serviços': return '#0ea5e9';
      case 'Moradia': return '#a78bfa';
      case 'Cartões de crédito': return '#6366f1';
      case 'Consórcio': return '#f43f5e';
      case 'Educação': return '#eab308';
      case 'Investimentos': return '#14b8a6';
      case 'Vestuário': return '#d946ef';
      case 'Pagamentos': return '#84cc16';
      case 'Benefícios': return '#34d399';
      case 'Fixa mensal': return '#10b981';
      case 'Vendas': return '#059669';
      case 'Outras Receitas': return '#14b8a6';
      case 'Comissão': return '#6ee7b7';
      default: return '#9ca3af';
    }
  };

  const toggleExpand = (cat) => {
    if (expandedCategory === cat) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(cat);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* KPI Grid */}
      <div className="dashboard-grid" style={{ display: 'flex' }}>
        <div className="glass-card kpi-card expense" style={{ flex: 1 }}>
          <div className="kpi-label">
            <span>Despesas</span>
            <TrendingDown size={20} style={{ color: 'var(--danger)' }} />
          </div>
          <div className="kpi-value" style={{ color: '#fff' }}>{formatCurrency(totalExpense)}</div>
          <div className="kpi-trend negative">Total de saídas registradas</div>
        </div>
      </div>

            {/* Categories Breakdown */}
      <div>
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
                            width: `${percentage}%`, 
                            backgroundColor: color,
                            boxShadow: `0 0 10px ${color}44`
                          }}
                        />
                      </div>
                    </div>

                    {/* Subcategories drill down */}
                    {isExpanded && (
                      <div style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: `1px solid ${color}44` }}>
                        {subcategories.map(({ subcategory, value, percentage: subPct }) => (
                          <div key={subcategory} style={{ fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                              <span>{subcategory}</span>
                              <span>{formatCurrency(value)} ({subPct.toFixed(0)}%)</span>
                            </div>
                            <div className="progress-bar-bg" style={{ height: '4px' }}>
                              <div 
                                className="progress-bar-fill"
                                style={{ width: `${subPct}%`, backgroundColor: color, opacity: 0.6 }}
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
}