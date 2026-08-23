const fs = require('fs');

const data = JSON.parse(fs.readFileSync('parsed_nubank.json', 'utf8'));

let totalCompras = 0;
data.forEach(t => {
  const isCredit = t.value.includes('−') || t.value.includes('-');
  let cleanValue = t.value.replace(/[^0-9,]/g, '').replace(',', '.');
  let amount = parseFloat(cleanValue);
  
  if (t.description.toLowerCase().includes('pagamento em') || t.description.toLowerCase().includes('saldo restante')) {
    return;
  }
  
  if (isCredit) {
    console.log('Found credit:', t.description, t.value);
  } else {
    totalCompras += amount;
  }
});

console.log('Total compras calculated:', totalCompras);
