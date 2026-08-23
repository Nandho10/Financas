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
  const dirs = ['extratos', 'faturas', 'holerite'];
  for (const dir of dirs) {
    const dirPath = path.join('d:', 'Organizador de consumo', dir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.pdf'));
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      console.log(`========================================`);
      console.log(`FILE: ${dir}/${file}`);
      console.log(`========================================`);
      try {
        const text = await extractText(fullPath);
        console.log(text.substring(0, 3000)); // First 3000 characters
      } catch (err) {
        console.error(`Error reading ${file}:`, err);
      }
    }
  }
}

run();
