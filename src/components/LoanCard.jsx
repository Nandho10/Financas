import React, { useState } from 'react';
import { Trash2, Plus, Calendar, TrendingUp } from 'lucide-react';

export default function LoanCard({ loan, payments, onDelete, onAddPayment }) {
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const currentBalance = Math.max(0, loan.initialAmount - totalPaid);
  const progressPercent = Math.min(100, (totalPaid / loan.initialAmount) * 100);

  const handlePaySubmit = (e) => {
    e.preventDefault();
    onAddPayment(parseFloat(payAmount), payDate);
    setShowPayModal(false);
    setPayAmount('');
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      <button 
        onClick={onDelete}
        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem', opacity: 0.5 }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
        title="Excluir contrato"
      >
        <Trash2 size={16} />
      </button>

      <div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, paddingRight: '2rem' }}>{loan.name}</h4>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={12} /> Início: {loan.startDate.split('-').reverse().join('/')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={12} /> {loan.interestRate}% a.m.
          </span>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Progresso (Valor Pago)</span>
          <span style={{ fontWeight: 600 }}>{progressPercent.toFixed(1)}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.5s ease-in-out' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saldo Devedor Atual</p>
          <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--danger)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentBalance)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prazo Total</p>
          <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {loan.installments} meses
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button 
          className="btn" 
          onClick={() => setShowPayModal(true)}
          style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}
        >
          <Plus size={16} /> Lançar Pgt / Amort
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={onViewDetails}
          style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}
        >
          Ver Detalhes
        </button>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Amortizar {loan.name}</h3>
              <button className="modal-close" onClick={() => setShowPayModal(false)}>×</button>
            </div>
            
            <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Valor Pago (R$)</label>
                <input type="number" step="0.01" className="search-input" style={{ width: '100%', minWidth: 'auto' }} required
                  value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Data do Pagamento</label>
                <input type="date" className="search-input" style={{ width: '100%', minWidth: 'auto' }} required
                  value={payDate} onChange={e => setPayDate(e.target.value)} />
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>Cancelar</button>
                <button type="submit" className="btn">Confirmar Pagamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
