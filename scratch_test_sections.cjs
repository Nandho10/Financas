const fs = require('fs');

const lines = fs.readFileSync('itau_text.txt', 'utf8').split('\\n').map(l => l.trim());

let currentSection = 'ignore';
let rollingWindow = [];
let parsedItems = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  rollingWindow.push(line);
  if (rollingWindow.length > 5) rollingWindow.shift();
  
  const combinedText = rollingWindow.join('').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (combinedText.includes('amentoscomprasesaques')) {
    currentSection = 'valid_compras';
  } else if (combinedText.includes('amentosprodutoseservi')) {
    currentSection = 'valid_produtos';
  } else if (combinedText.includes('comprasparceladaspr')) {
    currentSection = 'ignore_parceladas';
  }
  
  if (line.match(/^\d{2}\/\d{2}$/)) {
    parsedItems.push({ line, section: currentSection, i });
  }
}

console.log(parsedItems);
