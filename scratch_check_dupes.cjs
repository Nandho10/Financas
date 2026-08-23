const fs = require('fs');
const data = JSON.parse(fs.readFileSync('parsed_nubank.json', 'utf8'));

const ids = new Set();
let duplicateSum = 0;

data.forEach(t => {
  if (t.description.toLowerCase().includes('pagamento em') || t.description.toLowerCase().includes('saldo restante')) return;
  
  let cleanValue = t.value.replace(/[^0-9,]/g, '').replace(',', '.');
  let amount = parseFloat(cleanValue);
  
  const id = `nubank_${t.date}_${t.description.replace(/\\s+/g, '')}_${amount.toFixed(2)}`;
  
  if (ids.has(id)) {
    console.log('Duplicate found:', t.description, t.value);
    duplicateSum += amount;
  }
  ids.add(id);
});

console.log('Total lost due to duplicates:', duplicateSum);
