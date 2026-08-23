const fs = require('fs');

async function test() {
  const filePath = 'faturas/2026/07-Jul/Faturas/Fatura_Itau_10_07.pdf';
  const buffer = fs.readFileSync(filePath);
  
  try {
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/'
    });

    const pdf = await loadingTask.promise;
    let textItems = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items.sort((a, b) => {
        if (Math.abs(b.transform[5] - a.transform[5]) > 5) {
          return b.transform[5] - a.transform[5];
        }
        return a.transform[4] - b.transform[4];
      });
      const strings = items.map(item => item.str.trim()).filter(Boolean);
      textItems.push(...strings);
    }
    
    const interesting = textItems.filter(s => s.toLowerCase().includes('compras e saques') || s.toLowerCase().includes('produtos e servi') || s.toLowerCase().includes('compras parceladas'));
    console.log("Found markers directly in items:", interesting);
    
    // Let's do the rolling window test on textItems
    let currentSection = 'ignore';
    let rollingWindow = [];
    
    for (let i = 0; i < textItems.length; i++) {
      const line = textItems[i];
      rollingWindow.push(line);
      if (rollingWindow.length > 5) rollingWindow.shift();
      
      const combinedText = rollingWindow.join('').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (combinedText.includes('amentoscomprasesaques')) {
        currentSection = 'valid_compras';
      } else if (combinedText.includes('amentosprodutoseservi')) {
        currentSection = 'valid_produtos';
      } else if (combinedText.includes('comprasparceladaspr')) {
        currentSection = 'ignore_parceladas';
      } else if (combinedText.includes('pagamentosefetuados')) {
        currentSection = 'ignore_pagamentos';
      }
      
      if (line.match(/^\d{2}\/\d{2}$/)) {
        console.log(`Found date ${line} in section ${currentSection}`);
      }
    }

  } catch (err) {
    console.error(err);
  }
}

test();
