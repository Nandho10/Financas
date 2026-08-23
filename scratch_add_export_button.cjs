const fs = require('fs');

let content = fs.readFileSync('src/components/TransactionTable.jsx', 'utf8');

// 1. Add Download import
content = content.replace(
  "import { Search, Trash2, Calendar, FileSpreadsheet, ArrowUpDown, Tag } from 'lucide-react';",
  "import { Search, Trash2, Calendar, FileSpreadsheet, ArrowUpDown, Tag, Download } from 'lucide-react';"
);

// 2. Add exportToCSV function
const exportFunc = `  const exportToCSV = () => {
    // Formato Minhas Finanças:
    // Descrição, Valor, Data (DD/MM/YYYY), Categoria, Subcategoria, Conta, Cartão de Crédito, Observação
    const csvContent = filteredTransactions.map(t => {
      const desc = (t.description || '').replace(/,/g, ' ');
      const val = Math.abs(t.amount).toFixed(2);
      
      let dateStr = '';
      if (t.date) {
        const [y, m, d] = t.date.split('-');
        dateStr = \`\${d}/\${m}/\${y}\`;
      }
      
      const cat = t.category || 'Outros';
      const sub = t.subcategory || 'Outros';
      const conta = t.source || 'Organizador';
      const obs = t.sourceFile || '';
      
      return \`\${desc},\${val},\${dateStr},\${cat},\${sub},\${conta},,\${obs}\`;
    }).join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', \`minhas_financas_export.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (`;

content = content.replace(
  "  return (",
  exportFunc
);

// 3. Add button in UI
const buttonsUI = `        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
        </div>`;

content = content.replace(
  `        {transactions.length > 0 && (
          <button onClick={onClearAll} className="btn btn-secondary btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <Trash2 size={14} /> Limpar Tudo
          </button>
        )}`,
  buttonsUI
);

fs.writeFileSync('src/components/TransactionTable.jsx', content, 'utf8');
console.log('TransactionTable.jsx updated with export button');
