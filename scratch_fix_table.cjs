const fs = require('fs');

let content = fs.readFileSync('src/components/TransactionTable.jsx', 'utf8');

content = content.replace(
  `  // Check if transaction is uncategorized
  const isUncategorized = (t) => {
    const exportToCSV = () => {
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

  return (t.category === 'Outros' && t.subcategory === 'Outros') || !t.category;
  };`,
  `  // Check if transaction is uncategorized
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
  };`
);

fs.writeFileSync('src/components/TransactionTable.jsx', content, 'utf8');
console.log('TransactionTable fixed');
