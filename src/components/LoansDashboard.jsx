import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Trash2, PieChart as PieChartIcon, UploadCloud, ChevronRight } from 'lucide-react';
import { getLoans, saveLoan, deleteLoan, getLoanPayments, saveLoanPayment } from '../utils/db';
import LoanCard from './LoanCard';
import LoanDetails from './LoanDetails';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as pdfjsLib from 'pdfjs-dist';
import { parseLoanPDF } from '../utils/loanParser';

export default function LoansDashboard() {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeLoanId, setActiveLoanId] = useState(null);
  const [newLoan, setNewLoan] = useState({ name: '', initialAmount: '', interestRate: '', installments: '', startDate: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const l = await getLoans();
    const p = await getLoanPayments();
    setLoans(l);
    setPayments(p);
  };

  const handleAddLoan = async (e) => {
    e.preventDefault();
    const id = `loan_${Date.now()}`;
    await saveLoan({
      id,
      name: newLoan.name,
      initialAmount: parseFloat(newLoan.initialAmount),
      interestRate: parseFloat(newLoan.interestRate),
      installments: parseInt(newLoan.installments),
      startDate: newLoan.startDate,
      createdAt: new Date().toISOString()
    });
    setShowAddModal(false);
    setNewLoan({ name: '', initialAmount: '', interestRate: '', installments: '', startDate: '' });
    loadData();
  };

  const handleDeleteLoan = async (id) => {
    if (window.confirm("Deseja realmente apagar este contrato? Todo o histórico de pagamentos será perdido.")) {
      await deleteLoan(id);
      loadData();
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      for (const file of files) {
        if (file.type !== 'application/pdf') {
          alert('Apenas arquivos PDF são suportados.');
          continue;
        }
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const textItems = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          content.items.forEach(item => textItems.push(item));
        }

        const { loan, payments } = parseLoanPDF(textItems, file.name);
        
        if (loan.initialAmount > 0) {
          const loanId = `loan_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          await saveLoan({
            id: loanId,
            ...loan,
            createdAt: new Date().toISOString()
          });
          
          for (const pay of payments) {
            await saveLoanPayment({
              id: `payment_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              loanId: loanId,
              ...pay,
              createdAt: new Date().toISOString()
            });
          }
        } else {
          alert(`Não foi possível extrair dados de: ${file.name}`);
        }
      }
      loadData();
    } catch (err) {
      console.error(err);
      alert(`Ocorreu um erro: ${err.message || err}\n${err.stack || ''}`);
    } finally {
      setIsProcessing(false);
      e.target.value = null; // reset input
    }
  };

  const handleAddPayment = async (loanId, amount, date) => {
    await saveLoanPayment({
      id: `payment_${Date.now()}`,
      loanId,
      amount,
      date,
      createdAt: new Date().toISOString()
    });
    loadData();
  };

  const totalDebt = loans.reduce((acc, loan) => {
    const loanPayments = payments.filter(p => p.loanId === loan.id).reduce((sum, p) => sum + p.amount, 0);
    // Simplified remaining balance (doesn't perfectly account for compound interest yet, this is a basic version)
    return acc + Math.max(0, loan.initialAmount - loanPayments);
  }, 0);

  const chartData = loans.map(loan => {
    const loanPayments = payments.filter(p => p.loanId === loan.id).reduce((sum, p) => sum + p.amount, 0);
    return {
      name: loan.name,
      value: Math.max(0, loan.initialAmount - loanPayments)
    };
  }).filter(item => item.value > 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (activeLoanId) {
    const activeLoan = loans.find(l => l.id === activeLoanId);
    if (activeLoan) {
      return (
        <div style={{ padding: '1rem 0' }}>
          <LoanDetails 
            loan={activeLoan}
            payments={payments.filter(p => p.loanId === activeLoan.id)}
            onBack={() => setActiveLoanId(null)}
          />
        </div>
      );
    }
  }

  return (
    <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header / Global Summary */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Landmark style={{ color: 'var(--primary)' }} />
            Seus Empréstimos
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Acompanhe e consolide suas dívidas para quitá-las mais rápido.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Saldo Devedor Total</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDebt)}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Loans List */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Contratos Ativos</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <label className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
                <UploadCloud size={16} /> 
                {isProcessing ? 'Processando...' : 'Importar PDF'}
                <input type="file" multiple accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isProcessing} />
              </label>
              <button className="btn" onClick={() => setShowAddModal(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Plus size={16} /> Adicionar Manual
              </button>
            </div>
          </div>

          {loans.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Landmark size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-secondary)' }}>Você não possui nenhum empréstimo cadastrado.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {loans.map(loan => (
                <LoanCard 
                  key={loan.id} 
                  loan={loan} 
                  payments={payments.filter(p => p.loanId === loan.id)} 
                  onDelete={() => handleDeleteLoan(loan.id)}
                  onAddPayment={(amt, date) => handleAddPayment(loan.id, amt, date)}
                  onViewDetails={() => setActiveLoanId(loan.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comparative View */}
        {loans.length > 0 && (
          <div className="glass-card" style={{ flex: 1, position: 'sticky', top: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChartIcon size={18} style={{ color: 'var(--primary)' }} />
              Composição da Dívida
            </h3>
            
            {totalDebt > 0 ? (
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ color: 'var(--success)', textAlign: 'center', padding: '2rem 0' }}>Todas as dívidas estão quitadas! 🎉</p>
            )}
          </div>
        )}
      </div>

      {/* Add Loan Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Novo Empréstimo</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddLoan} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Nome do Contrato (ex: Financiamento Caixa)</label>
                <input type="text" className="search-input" style={{ width: '100%', minWidth: 'auto' }} required
                  value={newLoan.name} onChange={e => setNewLoan({...newLoan, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Valor Financiado (R$)</label>
                  <input type="number" step="0.01" className="search-input" style={{ width: '100%', minWidth: 'auto' }} required
                    value={newLoan.initialAmount} onChange={e => setNewLoan({...newLoan, initialAmount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Taxa de Juros Mensal (%)</label>
                  <input type="number" step="0.01" className="search-input" style={{ width: '100%', minWidth: 'auto' }} required
                    value={newLoan.interestRate} onChange={e => setNewLoan({...newLoan, interestRate: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Qtd de Parcelas (Meses)</label>
                  <input type="number" className="search-input" style={{ width: '100%', minWidth: 'auto' }} required
                    value={newLoan.installments} onChange={e => setNewLoan({...newLoan, installments: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Data de Início</label>
                  <input type="date" className="search-input" style={{ width: '100%', minWidth: 'auto' }} required
                    value={newLoan.startDate} onChange={e => setNewLoan({...newLoan, startDate: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancelar</button>
                <button type="submit" className="btn">Salvar Contrato</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
