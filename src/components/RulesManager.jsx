import React, { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { DESPESA_CATEGORIES, RECEITA_CATEGORIES } from '../utils/pdfParser';

export default function RulesManager({ rules, onAddRule, onDeleteRule }) {
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('Despesa');
  const [category, setCategory] = useState('Alimentação');
  const [subcategory, setSubcategory] = useState('Outros');

  const struct = type === 'Receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;
  const categories = Object.keys(struct);
  const subcategories = struct[category] || ['Outros'];

  const handleTypeChange = (newType) => {
    setType(newType);
    const newStruct = newType === 'Receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;
    const defCat = newType === 'Receita' ? 'Outras Receitas' : 'Alimentação';
    setCategory(defCat);
    setSubcategory(newStruct[defCat] ? newStruct[defCat][0] : 'Outros');
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const subs = struct[cat] || ['Outros'];
    setSubcategory(subs[0] || 'Outros');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onAddRule({ 
      keyword: keyword.trim(), 
      type,
      category, 
      subcategory 
    });
    setKeyword('');
  };

  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Regras de Categorização</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text"
          placeholder="Se o texto contiver (ex: Uber)..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="search-input"
          style={{ flex: 2, minWidth: '200px' }}
          required
        />
        
        <select 
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="filter-select"
          style={{ flex: 1, minWidth: '100px' }}
        >
          <option value="Despesa">Saída (Despesa)</option>
          <option value="Receita">Entrada (Receita)</option>
        </select>
        
        <select 
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="filter-select"
          style={{ flex: 1, minWidth: '150px' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          className="filter-select"
          style={{ flex: 1, minWidth: '150px' }}
        >
          {subcategories.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        
        <button type="submit" className="btn">
          <Plus size={18} /> Adicionar
        </button>
      </form>

      {rules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Nenhuma regra personalizada cadastrada. O app usará regras automáticas padrão.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rules.map((rule) => (
            <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={16} style={{ color: 'var(--primary)' }} />
                <span>Se contiver <strong style={{ color: '#fff' }}>"{rule.keyword}"</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge badge-source" style={{ backgroundColor: rule.type === 'Receita' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: rule.type === 'Receita' ? 'var(--success)' : 'var(--danger)', fontSize: '0.75rem', marginRight: '0.5rem' }}>
                  {rule.type || 'Despesa'}
                </span>
                <span className="badge badge-source" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary-hover)', fontSize: '0.8rem' }}>
                  {rule.category} &gt; {rule.subcategory || 'Outros'}
                </span>
                <button 
                  onClick={() => onDeleteRule(rule.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
