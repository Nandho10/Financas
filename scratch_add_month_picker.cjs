const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add imports
content = content.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useMemo } from 'react';"
);

content = content.replace(
  "import { LayoutDashboard, Sliders, RefreshCw, Landmark } from 'lucide-react';",
  "import { LayoutDashboard, Sliders, RefreshCw, Landmark, ChevronLeft, ChevronRight } from 'lucide-react';"
);

// 2. Add state and logic
const logicBlock = `
  const [currentMonth, setCurrentMonth] = useState('');

  // Extract available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set(transactions.filter(t => t.date).map(t => t.date.substring(0, 7)));
    return Array.from(months).sort();
  }, [transactions]);

  // Set default month when transactions load or change
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(currentMonth)) {
      setCurrentMonth(availableMonths[availableMonths.length - 1]); // Default to latest
    }
  }, [availableMonths, currentMonth]);

  const handlePrevMonth = () => {
    const idx = availableMonths.indexOf(currentMonth);
    if (idx > 0) setCurrentMonth(availableMonths[idx - 1]);
  };

  const handleNextMonth = () => {
    const idx = availableMonths.indexOf(currentMonth);
    if (idx < availableMonths.length - 1) setCurrentMonth(availableMonths[idx + 1]);
  };

  const formatMonth = (monthStr) => {
    if (!monthStr) return 'Mês atual';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  };

  // Filter transactions for Dashboard and Table
  const filteredTransactions = activeTab === 'dashboard' && currentMonth 
    ? transactions.filter(t => t.date && t.date.startsWith(currentMonth))
    : transactions;
`;

content = content.replace(
  "  const [loading, setLoading] = useState(true);\n\n  // Modal linking state",
  `  const [loading, setLoading] = useState(true);\n${logicBlock}\n  // Modal linking state`
);

// 3. Update header UI
const headerUI = `
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {activeTab === 'dashboard' && availableMonths.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: '20px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)' }}>
              <button onClick={handlePrevMonth} disabled={availableMonths.indexOf(currentMonth) === 0} style={{ background: 'none', border: 'none', color: availableMonths.indexOf(currentMonth) === 0 ? 'var(--text-muted)' : '#fff', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}>
                <ChevronLeft size={18} />
              </button>
              <span style={{ minWidth: '100px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                {formatMonth(currentMonth)}
              </span>
              <button onClick={handleNextMonth} disabled={availableMonths.indexOf(currentMonth) === availableMonths.length - 1} style={{ background: 'none', border: 'none', color: availableMonths.indexOf(currentMonth) === availableMonths.length - 1 ? 'var(--text-muted)' : '#fff', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          <nav className="tabs">
            <button 
`;
content = content.replace(
  `        <nav className="tabs">\n          <button \n`,
  headerUI
);

content = content.replace(
  "      </header>\n\n      {activeTab === 'dashboard' && (\n        <div className=\"main-layout\">\n          {/* Left Column: Dashboard + Transactions */}\n          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>\n            <Dashboard transactions={transactions} />\n            <TransactionTable \n              transactions={transactions} ",
  "        </div>\n      </header>\n\n      {activeTab === 'dashboard' && (\n        <div className=\"main-layout\">\n          {/* Left Column: Dashboard + Transactions */}\n          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>\n            <Dashboard transactions={filteredTransactions} />\n            <TransactionTable \n              transactions={filteredTransactions} "
);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx updated with month picker');
