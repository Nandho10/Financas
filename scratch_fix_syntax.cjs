const fs = require('fs');

let content = fs.readFileSync('src/utils/pdfParser.js', 'utf8');

// Fix escaped template literals
content = content.replace(/\\\`/g, '`');
content = content.replace(/\\\$/g, '$');
content = content.replace(/\\\\d/g, '\\d');
content = content.replace(/\\\\s/g, '\\s');

fs.writeFileSync('src/utils/pdfParser.js', content, 'utf8');
console.log('Fixed pdfParser.js syntax errors.');
