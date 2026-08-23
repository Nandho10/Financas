const fs = require('fs');

const textItems = [
  '03/06',
  'Algum ícone aqui',
  'Alphatec - Parcela 1/2',
  'R$ 165,00'
];

let currentDate = '2026-06-03';
let lines = textItems;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const dateMatch = line.match(/^(\d{2})\/(\d{2})$/);
  
  if (dateMatch) {
    let txDate = currentDate;
    const inlineDateMatch = lines[i + 1] && lines[i + 1].match(/(\d{2})\/(\d{2})$/);
    if (inlineDateMatch) {
       // ...
    }
    
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
      console.log(`Parsed: desc="${description}", val="${valueStr}"`);
    }
  }
}
