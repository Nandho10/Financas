import React from 'react';
import { Calendar, TrendingUp, DollarSign, Target, Landmark, CheckCircle, Clock } from 'lucide-react';

export default function LoanDetails({ loan, payments, onBack }) {
  // If we have an embedded schedule (from PDF parsing), we use it. Otherwise, empty.
  const schedule = loan.schedule || [];
  
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const currentBalance = Math.max(0, loan.initialAmount - totalPaid);
  
  // Calculate end date simply by adding installments in months to the start date
  const startDateObj = new Date(loan.startDate);
  const endDateObj = new Date(startDateObj);
  endDateObj.setMonth(endDateObj.getMonth() + loan.installments);
  const endDateStr = endDateObj.toISOString().split('T')[0].split('-').reverse().join('/');
  
  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <button className="btn btn-secondary" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        &larr; Voltar para Visão Geral
      </button>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Landmark size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{loan.name}</h2>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> Início: {loan.startDate.split('-').reverse().join('/')}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TrendingUp size={14} /> Taxa: {loan.interestRate}% a.m.</span>
            </div>
          </div>
        </div>

        {/* KPIs Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={14} /> Data de Finalização
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>{endDateStr}</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={14} /> Valor Restante (Saldo)
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger)', marginTop: '0.25rem' }}>{formatCurrency(currentBalance)}</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={14} /> Amortizado / Pago
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)', marginTop: '0.25rem' }}>{formatCurrency(totalPaid)}</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} /> Prazo Total
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>{loan.installments} meses</p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Demonstrativo da Evolução</h3>
        
        {schedule.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="transaction-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Nº</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Vencimento</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Valor Parcela</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Principal</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Juros/Encargos</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Saldo Devedor</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Situação</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{row.nro}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{row.date}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{row.valor}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{row.principal}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--danger)' }}>{row.juros}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{row.saldo}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: row.status.includes('PAGA') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: row.status.includes('PAGA') ? 'var(--success)' : 'var(--warning)'
                      }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            Nenhum demonstrativo detalhado disponível para este contrato.
          </p>
        )}
      </div>
    </div>
  );
}
