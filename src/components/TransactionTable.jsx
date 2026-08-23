import React, { useState } from 'react';
import { Search, Trash2, Calendar, FileSpreadsheet, ArrowUpDown, Tag, Download } from 'lucide-react';
import { DESPESA_CATEGORIES, RECEITA_CATEGORIES } from '../utils/pdfParser';

export default function TransactionTable({ transactions, onLinkCategory, onDeleteTransaction, onClearAll }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const categoriesList = [...Object.keys(DESPESA_CATEGORIES), ...Object.keys(RECEITA_CATEGORIES)];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'Bradesco': return '🏦';
      case 'Nubank': return '💳';
      case 'Holerite': return '📄';
      default: return '🪙';
    }
  };

  // Filter logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSource = selectedSource === 'All' || t.source === selectedSource;
    return matchesSearch && matchesCategory && matchesSource;
  });

  // Sort logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'amount') {
      aVal = Math.abs(a.amount);
      bVal = Math.abs(b.amount);
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year.substring(2)}`;
  };

  const getCategoryClass = (cat) => {
    if (!cat) return 'cat-outros';
    const key = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `cat-${key}`;
  };

  // Check if transaction is uncategorized
  const isUncategorized = (t) => {
    return (t.category === 'Outros' && t.subcategory === 'Outros') || !t.category;
  };

  const exportToCSV = () => {
    // Formato Minhas Finanças:
    // Descrição, Valor, Data (DD/MM/YYYY), Categoria, Subcategoria, Conta, Cartão de Crédito, Observação
    const csvContent = filteredTransactions.map(t => {
      const desc = (t.description || '').replace(/,/g, ' ');
      const val = Math.abs(t.amount).toFixed(2);
      
      let dateStr = '';
      if (t.date) {
        const [y, m, d] = t.date.split('-');
        dateStr = `${d}/${m}/${y}`;
      }
      
      const cat = t.category || 'Outros';
      const sub = t.subcategory || 'Outros';
      const conta = t.source || 'Organizador';
      const obs = t.sourceFile || '';
      
      return `${desc},${val},${dateStr},${cat},${sub},${conta},,${obs}`;
    }).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `minhas_financas_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Histórico de Lançamentos</h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {transactions.length > 0 && (
            <button onClick={exportToCSV} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'var(--success)' }}>
              <Download size={14} /> Exportar CSV
            </button>
          )}
          {transactions.length > 0 && (
            <button onClick={onClearAll} className="btn btn-secondary btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <Trash2 size={14} /> Limpar Tudo
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>

        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="All">Todas as Categorias</option>
          {categoriesList.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          value={selectedSource} 
          onChange={(e) => setSelectedSource(e.target.value)}
          className="filter-select"
        >
          <option value="All">Todas as Fontes</option>
          <option value="Bradesco">🏦 Bradesco</option>
          <option value="Nubank">💳 Nubank</option>
          <option value="Holerite">📄 Holerite</option>
        </select>
      </div>

      {/* Table */}
      {sortedTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <FileSpreadsheet size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p>Nenhuma transação encontrada.</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Faça upload de extratos ou ajuste seus filtros.
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Data <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Descrição</th>
                <th>Fonte</th>
                <th>Categoria / Subcategoria</th>
                <th style={{ cursor: 'pointer', textAlign: 'right' }} onClick={() => handleSort('amount')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                    Valor <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((t, index) => {
                const isNewDate = index === 0 || sortedTransactions[index - 1].date !== t.date;
                return (
                  <React.Fragment key={t.id}>
                    {isNewDate && sortField === 'date' && (
                      <tr className="date-group-header" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderTop: '2px solid var(--border)' }}>
                        <td colSpan="6" style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={14} style={{ color: 'var(--primary)' }} />
                            {formatDate(t.date)}
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', opacity: (isNewDate && sortField === 'date') ? 0.3 : 1 }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          {formatDate(t.date)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {t.description}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {t.sourceFile}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-source">
                          <span style={{ marginRight: '0.25rem' }}>{getSourceIcon(t.source)}</span>
                          {t.source}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-source" style={{ marginBottom: '0.25rem', backgroundColor: t.type === 'Receita' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: t.type === 'Receita' ? 'var(--success)' : 'var(--danger)' }}>
                          {t.type || (t.amount > 0 ? 'Receita' : 'Despesa')}
                        </span><br/>
                        {isUncategorized(t) ? (
                          <button 
                            onClick={() => onLinkCategory(t)}
                            className="btn"
                            style={{ 
                              padding: '0.3rem 0.6rem', 
                              fontSize: '0.75rem', 
                              gap: '0.25rem', 
                              backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                              color: 'var(--danger)', 
                              border: '1px dashed rgba(239, 68, 68, 0.3)',
                              boxShadow: 'none'
                            }}
                          >
                            ❓ Vincular Subcategoria
                          </button>
                        ) : (
                          <span 
                            onClick={() => onLinkCategory(t)}
                            className={`badge badge-category ${getCategoryClass(t.category)}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', border: '1px solid transparent' }}
                          >
                            <Tag size={10} />
                            {t.category} &gt; {t.subcategory || 'Outros'}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        <span className={t.amount > 0 ? 'value-income' : 'value-expense'}>
                          {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => onDeleteTransaction(t.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
