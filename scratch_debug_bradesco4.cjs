const fs = require('fs');

function formatBradescoDate(dateStr) {
  const parts = dateStr.split('/');
  let yearStr = parts[2];
  if (yearStr.length === 2) {
    yearStr = '20' + yearStr; 
  }
  return `${yearStr}-${parts[1]}-${parts[0]}`;
}

function parseBradesco(lines) {
  const transactions = [];
  let currentDate = null;

  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Data') && lines[i+1] && lines[i+1].includes('Histórico')) {
      startIdx = i + 1;
      break; 
    }
  }

  let i = startIdx;
  let currentDescParts = [];
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    const dateMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);
    if (dateMatch) {
      currentDate = formatBradescoDate(line);
      i++;
      continue;
    }

    const doctoMatch = line.match(/^(\d{7})$/);
    if (doctoMatch && currentDescParts.length > 0) {
      const docto = doctoMatch[1];
      const description = currentDescParts.join(' ').replace(/\s+/g, ' ');
      
      i++;
      if (i < lines.length) {
        let valueStr = lines[i].trim();
        const isDebit = valueStr.startsWith('-');
        let cleanValue = valueStr.replace(/[^0-9,]/g, '').replace(',', '.');
        let amount = parseFloat(cleanValue);
        if (isDebit) amount = -amount;

        if (!isNaN(amount) && currentDate) {
          i++;
          if (i < lines.length) {
            const possibleBalance = lines[i].trim();
            if (possibleBalance.match(/^[0-9.,]+$/) && !possibleBalance.match(/^\d{7}$/)) {
              i++;
            }
          }
          
          let txDate = currentDate;
          const inlineDateMatch = description.match(/(\d{2})\/(\d{2})$/);
          if (inlineDateMatch) {
            const year = currentDate.split('-')[0];
            txDate = `${year}-${inlineDateMatch[2]}-${inlineDateMatch[1]}`;
          }

          if (!description.toLowerCase().includes('total') && !description.toLowerCase().includes('saldo anterior')) {
            transactions.push({ txDate, docto, amount, description });
          }
        }
      }
      currentDescParts = [];
      continue;
    }

    if (!line.includes('Os dados acima têm como base') && 
        !line.includes('Últimos Lançamentos') && 
        !line.includes('Saldos Invest Fácil') &&
        !line.includes('Total') &&
        !line.includes('Data') && 
        !line.includes('Histórico') && 
        !line.includes('Docto.') && 
        !line.includes('Crédito (R$)') && 
        !line.includes('Débito (R$)') && 
        !line.includes('Saldo (R$)') &&
        !line.match(/^[0-9.,]+$/)) {
      currentDescParts.push(line);
    }
    
    i++;
  }

  return transactions;
}

const text = fs.readFileSync('bradesco_sorted.txt', 'utf8');
const lines = text.split('\\n');
console.log('Start parsing', lines.length, 'lines');
const txs = parseBradesco(lines);
console.log('Parsed', txs.length, 'transactions');
console.log(txs.map(t => ({ d: t.txDate, desc: t.description, amt: t.amount })));
