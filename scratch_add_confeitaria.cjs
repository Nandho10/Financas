const fs = require('fs');

// 1. Update pdfParser.js
let parserContent = fs.readFileSync('src/utils/pdfParser.js', 'utf8');

parserContent = parserContent.replace(
  "'Alimentação': ['Açougue', 'Delivery', 'Hortifruti', 'Lanche', 'Mercearia', 'Confeitaria', 'Padaria', 'Pets', 'Restaurante', 'Outros'],",
  "'Alimentação': ['Açougue', 'Delivery', 'Hortifruti', 'Lanche', 'Mercearia', 'Padaria', 'Pets', 'Restaurante', 'Outros'],"
);

parserContent = parserContent.replace(
  "  'Consórcio': ['Automóvel', 'Outros'],",
  "  'Confeitaria': ['Embalagens', 'Equipamentos', 'Material', 'Máquinas', 'Outros'],\n  'Consórcio': ['Automóvel', 'Outros'],"
);

parserContent = parserContent.replace(
  "category: 'Alimentação', subcategory: 'Confeitaria'",
  "category: 'Confeitaria', subcategory: 'Outros'"
);

fs.writeFileSync('src/utils/pdfParser.js', parserContent, 'utf8');

// 2. Update Dashboard.jsx
let dashContent = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

dashContent = dashContent.replace(
  "case 'Alimentação': return '#f59e0b';",
  "case 'Alimentação': return '#f59e0b';\n      case 'Confeitaria': return '#06b6d4';"
);

fs.writeFileSync('src/components/Dashboard.jsx', dashContent, 'utf8');

console.log('Categories updated successfully!');
