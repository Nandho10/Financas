const fs = require('fs');

let content = fs.readFileSync('src/utils/pdfParser.js', 'utf8');

// The file got corrupted from line 258 onwards. 
// I will just read the file up to line 228 (the start of parseNubank)
const lines = content.split('\\n');
let cutIdx = lines.findIndex(l => l.includes('function parseNubank('));
if (cutIdx === -1) cutIdx = 229; // fallback

const firstPart = lines.slice(0, cutIdx).join('\\n');

const newParseNubank = \`
// Parsing logic for Nubank Fatura
function parseNubank(lines, filename, customRules) {
  const transactions = [];
  let currentYear = new Date().getFullYear().toString();
  
  for (const line of lines) {
    const yearMatch = line.match(/FATURA \\\\d{2} [A-Z]{3} (\\\\d{4})/i);
    if (yearMatch) {
      currentYear = yearMatch[1];
      break;
    }
  }

  const monthMap = {
    'JAN': '01', 'FEV': '02', 'MAR': '03', 'ABR': '04', 'MAI': '05', 'JUN': '06',
    'JUL': '07', 'AGO': '08', 'SET': '09', 'OUT': '10', 'NOV': '11', 'DEZ': '12'
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    const dateMatch = line.match(/^(\\\\d{2})\\\\s+([A-Z]{3})$/i);
    if (dateMatch && i + 2 < lines.length) {
      const day = dateMatch[1];
      const monthStr = dateMatch[2].toUpperCase();
      const month = monthMap[monthStr];
      
      if (month) {
        let valIdx = -1;
        for (let j = 2; j <= 4; j++) {
          if (i + j < lines.length && lines[i + j].includes('R$')) {
            valIdx = i + j;
            break;
          }
        }
        
        if (valIdx !== -1) {
          const description = lines[valIdx - 1].trim();
          const valueStr = lines[valIdx].trim();
          
          const isCredit = valueStr.includes('−') || valueStr.includes('-');
          let cleanValue = valueStr.replace(/[^0-9,]/g, '').replace(',', '.');
          let amount = parseFloat(cleanValue);
          if (!isCredit) {
            amount = -amount;
          } else {
            amount = Math.abs(amount);
          }

          const date = \\\`\\\${currentYear}-\\\${month}-\\\${day}\\\`;

          if (!description.toLowerCase().includes('pagamento em') && 
              !description.toLowerCase().includes('saldo restante')) {
            const classification = categorize(description, amount, customRules);

            transactions.push({
              id: \\\`nubank_\\\${date}_\\\${description.replace(/\\\\s+/g, '')}_\\\${Math.abs(amount).toFixed(2)}\\\`,
              date,
              description,
              amount,
              type: classification.type,
              category: classification.category,
              subcategory: classification.subcategory,
              source: 'Nubank',
              sourceFile: filename
            });
          }
          i = valIdx + 1;
          continue;
        }
      }
    }
    i++;
  }
  return transactions;
}

// Parsing logic for Holerite (Payslip)
function parseHolerite(lines, filename, customRules) {
  const transactions = [];
  
  let competency = '';
  let paymentDate = '';
  let netIncome = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('COMPETÊNCIA') && i + 1 < lines.length) {
      competency = lines[i + 1].trim();
    }
    
    if (line.includes('DATA DO PAGAMENTO') && i + 3 < lines.length) {
      for (let j = 1; j <= 4; j++) {
        if (i + j < lines.length && lines[i + j].match(/^\\\\d{2}\\/\\\\d{2}\\/\\\\d{4}$/)) {
          paymentDate = formatBradescoDate(lines[i + j].trim());
          break;
        }
      }
    }

    if (line.includes('VALOR TOTAL LÍQUIDO') && i + 1 < lines.length) {
      const valStr = lines[i + 1].replace(':', '').trim();
      let cleanVal = valStr.replace(/[^0-9,]/g, '').replace(',', '.');
      netIncome = parseFloat(cleanVal);
    }
  }

  if (!paymentDate && competency) {
    const [month, year] = competency.split('/');
    paymentDate = \\\`\\\${year}-\\\${month}-05\\\`;
  } else if (!paymentDate) {
    const today = new Date();
    paymentDate = today.toISOString().split('T')[0];
  }

  if (netIncome > 0) {
    transactions.push({
      id: \\\`holerite_\\\${paymentDate}_net_\\\${netIncome.toFixed(2)}\\\`,
      date: paymentDate,
      description: \\\`Holerite Líquido Recebido - Comp. \\\${competency || ''}\\\`,
      amount: netIncome,
      type: 'Receita',
      category: 'Fixa mensal',
      subcategory: 'Salário',
      source: 'Holerite',
      sourceFile: filename
    });
  }

  return transactions;
}

function formatBradescoDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    let [day, month, year] = parts;
    if (year.length === 2) {
      year = '20' + year;
    }
    return \\\`\\\${year}-\\\${month}-\\\${day}\\\`;
  }
  return dateStr;
}
\`;

fs.writeFileSync('src/utils/pdfParser.js', firstPart + '\\n' + newParseNubank, 'utf8');
console.log('Fixed pdfParser.js completely!');
