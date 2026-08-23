const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfParser.js', 'utf8');

// Replace 4 backslashes with 2 backslashes
content = content.replaceAll('\\\\\\\\', '\\\\');

fs.writeFileSync('src/utils/pdfParser.js', content, 'utf8');
console.log('Fixed double backslashes in pdfParser.js');
