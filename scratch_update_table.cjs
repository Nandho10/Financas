const fs = require('fs');

let content = fs.readFileSync('src/components/TransactionTable.jsx', 'utf8');

content = content.replace(
  "import { CATEGORY_STRUCTURE } from '../utils/pdfParser';",
  "import { DESPESA_CATEGORIES, RECEITA_CATEGORIES } from '../utils/pdfParser';"
);

content = content.replace(
  "  const categoriesList = Object.keys(CATEGORY_STRUCTURE);",
  "  const categoriesList = [...Object.keys(DESPESA_CATEGORIES), ...Object.keys(RECEITA_CATEGORIES)];"
);

content = content.replace(
  "                  <td>\n                    {isUncategorized(t) ? (",
  "                  <td>\n                    <span className=\"badge badge-source\" style={{ marginBottom: '0.25rem', backgroundColor: t.type === 'Receita' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: t.type === 'Receita' ? 'var(--success)' : 'var(--danger)' }}>\n                      {t.type || (t.amount > 0 ? 'Receita' : 'Despesa')}\n                    </span><br/>\n                    {isUncategorized(t) ? ("
);

fs.writeFileSync('src/components/TransactionTable.jsx', content, 'utf8');
console.log('TransactionTable updated');
