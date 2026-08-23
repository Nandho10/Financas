const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfParser.js', 'utf8');

// Fix the regexes that were accidentally injected with double backslashes
content = content.replace(/\\/\\^\\(\\\\\\\\d\\{7\\}\\)\\$\\//g, '/^(\\d{7})$/');
content = content.replace(/\\/\\^\\\\\\\\d\\{7\\}\\$\\//g, '/^\\d{7}$/');
content = content.replace(/\\/\\(\\\\\\\\d\\{2\\}\\)\\\\\\\\/\\(\\\\\\\\d\\{2\\}\\)\\$\\//g, '/(\\d{2})\\/(\\d{2})$/');
content = content.replace(/\\/FATURA \\\\\\\\d\\{2\\} \\[A-Z\\]\\{3\\} \\(\\\\\\\\d\\{4\\}\\)\\/i/g, '/FATURA \\d{2} [A-Z]{3} (\\d{4})/i');
content = content.replace(/\\/\\^\\(\\\\\\\\d\\{2\\}\\)\\\\\\\\s\\+\\(\\[A-Z\\]\\{3\\}\\)\\$\\/i/g, '/^(\\d{2})\\s+([A-Z]{3})$/i');
content = content.replace(/\\/\\^\\\\\\\\d\\{2\\}\\\\\\\\/\\\\\\\\d\\{2\\}\\\\\\\\/\\\\\\\\d\\{4\\}\\$\\//g, '/^\\d{2}\\/\\d{2}\\/\\d{4}$/');

fs.writeFileSync('src/utils/pdfParser.js', content, 'utf8');
console.log('Fixed regex backslashes');
