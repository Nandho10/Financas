const fs = require('fs');
const lines = fs.readFileSync('itau_text.txt', 'utf8').split('\\n').map(l => l.trim());

let transactions = [];
let i = 0;

let currentYear = "2026";
for (const line of lines) {
  const vMatch = line.match(/Vencimento: \d{2}\/\d{2}\/(\d{4})/i);
  if (vMatch) {
    currentYear = vMatch[1];
    break;
  }
}

while (i < lines.length) {
  const line = lines[i];
  
  if (line.match(/^\d{2}\/\d{2}$/)) {
    const dateStr = line;
    if (i + 2 < lines.length) {
      let description = lines[i+1];
      let valStr = lines[i+2];
      
      // Sometimes there's a category/icon in between?
      // For instance: 03/06 -> Itaú Avisa -> 7,99 -> P
      // Actually, my test file showed:
      // 28/08 -> HTM *l 11/12 -> 20,37 -> L
      if (valStr.match(/^[0-9.,]+$/)) {
         let cleanValue = valStr.replace(/[^0-9,]/g, '').replace(',', '.');
         let amount = -parseFloat(cleanValue);
         
         const [day, month] = dateStr.split('/');
         const date = `${currentYear}-${month}-${day}`;
         
         transactions.push({ date, description, amount });
         i += 3;
         continue;
      } else if (lines[i+3] && lines[i+3].match(/^[0-9.,]+$/)) {
         let cleanValue = lines[i+3].replace(/[^0-9,]/g, '').replace(',', '.');
         let amount = -parseFloat(cleanValue);
         
         const [day, month] = dateStr.split('/');
         const date = `${currentYear}-${month}-${day}`;
         
         transactions.push({ date, description: description + ' ' + valStr, amount });
         i += 4;
         continue;
      }
    }
  }
  
  // Look for payments: 03/06 -> PAGAMENTO PIX -> -2.233,91
  if (line.match(/^\d{2}\/\d{2}$/)) {
     if (i + 2 < lines.length && (lines[i+2].startsWith('-') || lines[i+2].startsWith('−'))) {
       const dateStr = line;
       const desc = lines[i+1];
       const val = lines[i+2];
       let cleanValue = val.replace(/[^0-9,]/g, '').replace(',', '.');
       let amount = parseFloat(cleanValue);
       
       const [day, month] = dateStr.split('/');
       const date = `${currentYear}-${month}-${day}`;
       transactions.push({ date, description: desc, amount });
       i += 3;
       continue;
     }
  }
  
  i++;
}

console.log(transactions);
