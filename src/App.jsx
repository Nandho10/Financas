import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Sliders, RefreshCw, Landmark, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import FileUploader from './components/FileUploader';
import TransactionTable from './components/TransactionTable';
import Dashboard from './components/Dashboard';
import RulesManager from './components/RulesManager';
import LoansDashboard from './components/LoansDashboard';
import { 
  getTransactions, 
  saveTransactions, 
  updateTransactionCategory, 
  deleteTransaction, 
  clearAllTransactions,
  getRules,
  saveRule,
  deleteRule
} from './utils/db';
import { categorize, DESPESA_CATEGORIES, RECEITA_CATEGORIES } from './utils/pdfParser';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddMenu, setShowAddMenu] = useState(false);

  // Duplicate checking state
  const [pendingUniqueTxs, setPendingUniqueTxs] = useState([]);
  const [pendingDuplicates, setPendingDuplicates] = useState([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState(new Set());
  // Modal linking state
  const [linkingTransaction, setLinkingTransaction] = useState(null);
  const [modalKeyword, setModalKeyword] = useState('');
  const [modalCategory, setModalCategory] = useState('Alimentação');
  const [modalSubcategory, setModalSubcategory] = useState('Outros');

  // Load initial data from DB
  useEffect(() => {
    async function loadData() {
      try {
        const dbTxs = await getTransactions();
        let dbRules = await getRules();
        
        // Auto deduplicate rules on startup (keeping the latest updated one)
        const uniqueRulesMap = new Map();
        const duplicateIdsToDelete = [];
        
        dbRules.forEach(rule => {
          const key = rule.keyword.toLowerCase();
          if (uniqueRulesMap.has(key)) {
            duplicateIdsToDelete.push(uniqueRulesMap.get(key).id);
          }
          uniqueRulesMap.set(key, rule);
        });

        if (duplicateIdsToDelete.length > 0) {
          for (const id of duplicateIdsToDelete) {
            await deleteRule(id);
          }
          dbRules = Array.from(uniqueRulesMap.values());
        }

        setTransactions(dbTxs);
        setRules(dbRules);
      } catch (err) {
        console.error("Failed to load IndexedDB data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle incoming parsed transactions
  const handleTransactionsParsed = async (newTxs) => {
    // Categorize them using current state rules
    const categorizedNewTxs = newTxs.map(t => {
      const classification = categorize(t.description, t.amount, rules);
      return {
        ...t,
        type: classification.type,
        category: classification.category,
        subcategory: classification.subcategory
      };
    }).filter(t => t.amount < 0 && t.type !== 'Receita');

    const duplicateCandidates = [];
    const uniqueToImport = [];

    for (const newTx of categorizedNewTxs) {
      const isDuplicate = transactions.some(existingTx => 
        existingTx.date === newTx.date && 
        existingTx.description === newTx.description && 
        existingTx.amount === newTx.amount
      );
      
      if (isDuplicate) {
        duplicateCandidates.push(newTx);
      } else {
        uniqueToImport.push(newTx);
      }
    }

    if (duplicateCandidates.length > 0) {
      setPendingUniqueTxs(uniqueToImport);
      setPendingDuplicates(duplicateCandidates);
      setSelectedDuplicates(new Set()); // Start with none selected
    } else {
      if (uniqueToImport.length > 0) {
        const updatedList = [...transactions, ...uniqueToImport];
        setTransactions(updatedList);
        await saveTransactions(uniqueToImport);
      }
    }
  };

  const handleDuplicateToggle = (txId) => {
    const newSet = new Set(selectedDuplicates);
    if (newSet.has(txId)) {
      newSet.delete(txId);
    } else {
      newSet.add(txId);
    }
    setSelectedDuplicates(newSet);
  };

  const handleConfirmImport = async () => {
    const txsToImport = [
      ...pendingUniqueTxs,
      ...pendingDuplicates.filter(t => selectedDuplicates.has(t.id))
    ];

    if (txsToImport.length > 0) {
      const updatedList = [...transactions, ...txsToImport];
      setTransactions(updatedList);
      await saveTransactions(txsToImport);
    }

    // Reset state
    setPendingUniqueTxs([]);
    setPendingDuplicates([]);
    setSelectedDuplicates(new Set());
  };

  const handleSkipDuplicates = async () => {
    if (pendingUniqueTxs.length > 0) {
      const updatedList = [...transactions, ...pendingUniqueTxs];
      setTransactions(updatedList);
      await saveTransactions(pendingUniqueTxs);
    }

    // Reset state
    setPendingUniqueTxs([]);
    setPendingDuplicates([]);
    setSelectedDuplicates(new Set());
  };

  const handleCategoryChange = async (id, type, newCategory, newSubcategory = 'Outros') => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, type, category: newCategory, subcategory: newSubcategory } : t));
    await updateTransactionCategory(id, type, newCategory, newSubcategory);
  };

  const handleDeleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    await deleteTransaction(id);
  };

  const handleClearAll = async () => {
    if (window.confirm("Deseja realmente apagar TODAS as transações importadas?")) {
      setTransactions([]);
      await clearAllTransactions();
    }
  };

  const handleAddRule = async (ruleData) => {
    const existingRule = rules.find(r => r.keyword.toLowerCase() === ruleData.keyword.toLowerCase());
    
    let updatedRules;
    if (existingRule) {
      const updatedRule = { ...ruleData, id: existingRule.id };
      await saveRule(updatedRule);
      updatedRules = rules.map(r => r.id === existingRule.id ? updatedRule : r);
    } else {
      const id = await saveRule(ruleData);
      const newRule = { ...ruleData, id };
      updatedRules = [...rules, newRule];
    }
    setRules(updatedRules);

    // Re-categorize existing transactions retroactively
    const updatedTxs = transactions.map(t => {
      const classification = categorize(t.description, t.amount, updatedRules);
      if (classification.category !== t.category || classification.subcategory !== t.subcategory) {
        // Update directly in IndexedDB without scheduler conflicts
        updateTransactionCategory(t.id, classification.type, classification.category, classification.subcategory);
        return { ...t, type: classification.type, category: classification.category, subcategory: classification.subcategory };
      }
      return t;
    });
    setTransactions(updatedTxs);
  };

  const handleDeleteRule = async (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
    await deleteRule(id);
  };

  // Open association modal for a specific transaction
  const handleOpenLinkModal = (tx) => {
    setLinkingTransaction(tx);
    
    // Guess a clean keyword: lowercase, remove special symbols and common suffixes like "Parcela"
    let cleanKw = tx.description
      .toLowerCase()
      .split('-')[0] // remove parts after hyphens
      .replace(/parcela\s+\d+\/\d+/gi, '')
      .replace(/mp\s*\*/gi, '') // remove Mercadopago prefix
      .replace(/ig\s*\*/gi, '') // remove Granacapital prefix
      .replace(/dl\s*\*/gi, '') // remove Uber rides prefix
      .trim();

    setModalKeyword(cleanKw);
    const txType = tx.amount > 0 ? 'Receita' : 'Despesa';
    const struct = txType === 'Receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;
    const defCat = txType === 'Receita' ? 'Outras Receitas' : 'Alimentação';

    setModalCategory(tx.category !== 'Outros' ? tx.category : defCat);
    const subs = struct[tx.category !== 'Outros' ? tx.category : defCat] || ['Outros'];
    setModalSubcategory(tx.subcategory !== 'Outros' ? tx.subcategory : subs[0] || 'Outros');
  };

  const handleModalCategoryChange = (cat) => {
    setModalCategory(cat);
    const txType = linkingTransaction ? (linkingTransaction.amount > 0 ? 'Receita' : 'Despesa') : 'Despesa';
    const struct = txType === 'Receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;
    const subs = struct[cat] || ['Outros'];
    setModalSubcategory(subs[0] || 'Outros');
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!modalKeyword.trim()) return;

    const txType = linkingTransaction ? (linkingTransaction.amount > 0 ? 'Receita' : 'Despesa') : 'Despesa';
    const newRule = {
      keyword: modalKeyword.trim(),
      type: txType,
      category: modalCategory,
      subcategory: modalSubcategory
    };

    await handleAddRule(newRule);
    setLinkingTransaction(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
        <RefreshCw size={48} className="loading" style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Carregando dados locais...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="app-container">
      <header>
        <div className="logo-container">
          <span className="logo-icon">🪙</span>
          <div>
            <h1>Organizador de Consumos</h1>
            <p className="subtitle">Privacidade total. Seus dados não saem do seu navegador.</p>
          </div>
        </div>


        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowAddMenu(!showAddMenu)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--success)', 
                color: '#fff', 
                border: 'none', 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              title="Adicionar Lançamento Manual"
            >
              <Plus size={20} />
            </button>

            {showAddMenu && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0, 
                marginTop: '0.5rem', 
                backgroundColor: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '0.5rem', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                zIndex: 50,
                minWidth: '160px'
              }}>
                <button 
                  onClick={() => { setShowAddMenu(false); alert('Novo Cadastro de Despesa em breve!'); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span style={{ color: 'var(--danger)', marginRight: '0.5rem', fontWeight: 'bold' }}>+</span> Nova Despesa
                </button>
              </div>
            )}
          </div>

          <nav className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} /> Painel & Lançamentos
            </button>
            
            <button 
              className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              <Sliders size={18} /> Regras de Filtro ({rules.length})
            </button>

            <button 
              className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`}
              onClick={() => setActiveTab('loans')}
            >
              <Landmark size={18} /> Empréstimos
            </button>
          </nav>
        </div>
      </header>

      {activeTab === 'dashboard' && (
        <div className="main-layout">
          {/* Left Column: Dashboard + Transactions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Dashboard transactions={transactions} />
            <TransactionTable 
              transactions={transactions} 
              onLinkCategory={handleOpenLinkModal}
              onDeleteTransaction={handleDeleteTransaction}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Right Column: Upload zone */}
          <div>
            <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Landmark size={18} style={{ color: 'var(--primary)' }} />
                  Importar Extratos
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Envie seus arquivos PDF. O processamento é feito 100% offline no seu dispositivo.
                </p>
                <FileUploader 
                  onTransactionsParsed={handleTransactionsParsed}
                  customRules={rules}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <RulesManager 
            rules={rules} 
            onAddRule={handleAddRule} 
            onDeleteRule={handleDeleteRule} 
          />
        </div>
      )}

      {activeTab === 'loans' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <LoansDashboard />
        </div>
      )}

      {/* Category Link Modal */}
      {linkingTransaction && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Vincular Subcategoria</h3>
              <button className="modal-close" onClick={() => setLinkingTransaction(null)}>×</button>
            </div>
            
            <form onSubmit={handleLinkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Lançamento original</label>
                <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '0.85rem', color: '#fff', border: '1px solid var(--border-color)', fontWeight: 500 }}>
                  {linkingTransaction.description}
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Palavra-chave para identificar</label>
                <input 
                  type="text"
                  value={modalKeyword}
                  onChange={(e) => setModalKeyword(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minWidth: 'auto' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Identifica qualquer lançamento futuro ou atual contendo este termo.
                </span>
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Categoria Principal</label>
                <select 
                  value={modalCategory}
                  onChange={(e) => handleModalCategoryChange(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%', minWidth: 'auto' }}
                >
                  {Object.keys(linkingTransaction && linkingTransaction.amount > 0 ? RECEITA_CATEGORIES : DESPESA_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Subcategoria</label>
                <select 
                  value={modalSubcategory}
                  onChange={(e) => setModalSubcategory(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%', minWidth: 'auto' }}
                >
                  {((linkingTransaction && linkingTransaction.amount > 0 ? RECEITA_CATEGORIES : DESPESA_CATEGORIES)[modalCategory] || ['Outros']).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setLinkingTransaction(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn">
                  Salvar e Associar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicates Review Modal */}
      {pendingDuplicates.length > 0 && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '600px', width: '90%', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ Atenção: Lançamentos Repetidos
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Identificamos <strong>{pendingDuplicates.length}</strong> lançamento(s) neste arquivo que parecem já ter sido importados anteriormente (mesma data, descrição e valor).
              <br/><br/>
              Se estas forem compras reais que se repetiram, marque a caixa correspondente para importá-las mesmo assim. Caso contrário, ignore-as.
            </p>
            
            <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '1.5rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'center', width: '40px' }}></th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Data</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Descrição</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDuplicates.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: selectedDuplicates.has(tx.id) ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedDuplicates.has(tx.id)} 
                          onChange={() => handleDuplicateToggle(tx.id)} 
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                        {tx.date.split('-').reverse().join('/')}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 500 }}>
                        {tx.description}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleSkipDuplicates}
              >
                Ignorar Repetidos {pendingUniqueTxs.length > 0 && `(Importar Apenas ${pendingUniqueTxs.length} Novos)`}
              </button>
              <button 
                className="btn" 
                onClick={handleConfirmImport}
                style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none' }}
              >
                Importar Selecionados ({selectedDuplicates.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
