const fs = require('fs');

let content = fs.readFileSync('src/utils/pdfParser.js', 'utf8');

const oldNubankLogic = `      if (month) {
        const description = lines[i + 1].trim();
        const valueStr = lines[i + 2].trim();
        
        if (valueStr.includes('R$')) {
          const isCredit = valueStr.includes('−') || valueStr.includes('-');
          let cleanValue = valueStr.replace(/[^0-9,]/g, '').replace(',', '.');
          let amount = parseFloat(cleanValue);
          if (!isCredit) {
            amount = -amount;
          } else {
            amount = Math.abs(amount);
          }

          const date = \`\${currentYear}-\${month}-\${day}\`;

          if (!description.toLowerCase().includes('pagamento em') && 
              !description.toLowerCase().includes('saldo restante')) {
            const classification = categorize(description, amount, customRules);

            transactions.push({
              id: \`nubank_\${date}_\${description.replace(/\\s+/g, '')}_\${Math.abs(amount).toFixed(2)}\`,
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
          i += 3;
          continue;
        }
      }`;

const newNubankLogic = `      if (month) {
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

          const date = \`\${currentYear}-\${month}-\${day}\`;

          if (!description.toLowerCase().includes('pagamento em') && 
              !description.toLowerCase().includes('saldo restante')) {
            const classification = categorize(description, amount, customRules);

            transactions.push({
              id: \`nubank_\${date}_\${description.replace(/\\s+/g, '')}_\${Math.abs(amount).toFixed(2)}\`,
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
      }`;

if (content.includes(oldNubankLogic)) {
  content = content.replace(oldNubankLogic, newNubankLogic);
  fs.writeFileSync('src/utils/pdfParser.js', content, 'utf8');
  console.log('pdfParser.js updated successfully!');
} else {
  console.log('Could not find the target code in pdfParser.js');
}
