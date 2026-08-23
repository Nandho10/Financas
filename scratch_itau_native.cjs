const fs = require('fs');

async function parsePdfText() {
  const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
  const filePath = 'faturas/2026/07-Jul/Faturas/Fatura_Itau_10_07.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  
  const loadingTask = pdfjsLib.getDocument({
    data,
    standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/'
  });
  const pdf = await loadingTask.promise;
  
  let allLines = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map(item => item.str.trim()).filter(Boolean);
    allLines.push(...strings);
  }
  
  fs.writeFileSync('itau_text_native.txt', allLines.join('\\n'), 'utf8');
  console.log('Saved to itau_text_native.txt');
}

parsePdfText().catch(console.error);
