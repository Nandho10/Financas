import React, { useState } from 'react';
import { Calendar, TrendingUp, DollarSign, Target, Landmark, CheckCircle, Clock, Calculator } from 'lucide-react';

export default function LoanDetails({ loan, payments, onBack }) {
  const [simAmount, setSimAmount] = useState('');

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

  // --- SIMULATION LOGIC ---
  let pmt = 0;
  if (schedule.length > 0) {
    const pmtStr = schedule[0].valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    pmt = parseFloat(pmtStr) || 0;
  }
  
  let simResults = null;
  const extraAmort = parseFloat(simAmount);
  if (pmt > 0 && loan.interestRate > 0 && extraAmort > 0 && extraAmort < currentBalance) {
    const i = loan.interestRate / 100;
    const PV = currentBalance;
    const PV_new = PV - extraAmort;

    // Fórmula do Prazo Remanescente (Tabela Price)
    // n = -ln(1 - (PV * i) / PMT) / ln(1 + i)
    const calcN = (pv) => {
      const val = 1 - (pv * i) / pmt;
      if (val <= 0) return 0; // Quitado ou erro
      return -Math.log(val) / Math.log(1 + i);
    };

    const n_atual = calcN(PV);
    const n_novo = calcN(PV_new);

    if (n_atual > 0 && n_novo > 0) {
      const remainingCurrent = Math.ceil(n_atual);
      const remainingNew = Math.ceil(n_novo);
      const eliminated = remainingCurrent - remainingNew;

      const jurosAtual = (remainingCurrent * pmt) - PV;
      const jurosNovo = (remainingNew * pmt) - PV_new;
      const economiaJuros = jurosAtual - jurosNovo;

      simResults = {
        eliminated,
        remainingNew,
        newBalance: PV_new,
        economiaJuros: Math.max(0, economiaJuros)
      };
    }
  }

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

      {/* Simulador */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
          <Calculator size={18} /> Simulador de Amortização Extra (Redução de Prazo)
        </h3>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
            <label>Valor Extra para Amortizar Hoje (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              className="search-input" 
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)' }} 
              placeholder="Ex: 2000.00"
              value={simAmount} 
              onChange={e => setSimAmount(e.target.value)} 
            />
          </div>
          {pmt === 0 && (
            <p style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>
              Importe o PDF do documento para liberar o simulador.
            </p>
          )}
        </div>

        {simResults && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Parcelas Eliminadas</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)', marginTop: '0.25rem' }}>{simResults.eliminated}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Economia em Juros</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)', marginTop: '0.25rem' }}>{formatCurrency(simResults.economiaJuros)}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--text-primary)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Novo Prazo Restante</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>{simResults.remainingNew} meses</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--danger)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Novo Saldo Devedor</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>{formatCurrency(simResults.newBalance)}</p>
            </div>
          </div>
        )}
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
