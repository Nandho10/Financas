import * as fs from 'fs';
import * as path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractText(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += `--- Page ${i} ---\n` + strings.join('\n') + '\n';
  }
  return fullText;
}

async function run() {
  const pdfPath = path.join('d:', 'Organizador de consumo', 'faturas', 'Nubank_2026-07-02.pdf');
  const text = await extractText(pdfPath);
  fs.writeFileSync(path.join('d:', 'Organizador de consumo', 'scratch', 'nubank_text.txt'), text);
  console.log("Nubank text extracted to scratch/nubank_text.txt");
}

run();
