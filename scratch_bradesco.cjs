const fs = require('fs');

async function test() {
  const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
  const filePath = 'extratos/Bradesco_De_01-07_a_03-07.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  
  const loadingTask = pdfjsLib.getDocument({
    data,
    standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/'
  });
  const pdf = await loadingTask.promise;
  
  let allLinesNative = [];
  let allLinesSorted = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    allLinesNative.push(...textContent.items.map(i => i.str.trim()).filter(Boolean));
    
    const items = [...textContent.items].sort((a, b) => {
      if (Math.abs(b.transform[5] - a.transform[5]) > 5) {
        return b.transform[5] - a.transform[5];
      }
      return a.transform[4] - b.transform[4];
    });
    
    allLinesSorted.push(...items.map(i => i.str.trim()).filter(Boolean));
  }
  
  fs.writeFileSync('bradesco_native.txt', allLinesNative.join('\\n'), 'utf8');
  fs.writeFileSync('bradesco_sorted.txt', allLinesSorted.join('\\n'), 'utf8');
}

test().catch(console.error);
