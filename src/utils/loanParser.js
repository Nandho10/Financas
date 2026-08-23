import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;

export function parseLoanPDF(textItems, filename) {
  const lines = textItems
    .map(item => (typeof item === 'string' ? item : (item.str || '')))
    .map(str => str.trim())
    .filter(line => line !== '');
  
  // Basic properties
  let name = 'Empréstimo DDC';
  let initialAmount = 0;
  let interestRate = 0;
  let installments = 0;
  let startDate = '';
  let currentBalance = 0;
  
  // Parsing state
  const schedule = [];
  let parsingSchedule = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!parsingSchedule) {
      if (line === 'Modalidade de Operação' && i + 1 < lines.length) {
        name = lines[i + 1];
      } else if (line === 'Número do Contrato' && i + 1 < lines.length) {
        name += ` (${lines[i + 1]})`;
      } else if (line === 'Valor da Operação' && i + 1 < lines.length) {
        const valStr = lines[i + 1].replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        initialAmount = parseFloat(valStr) || initialAmount;
      } else if (line === 'Taxa de Juros Mensal Nominal' && i + 1 < lines.length) {
        const valStr = lines[i + 1].replace(',', '.').trim();
        interestRate = parseFloat(valStr) || interestRate;
      } else if (line === 'Prazo Total da Operação' && i + 1 < lines.length) {
        installments = parseInt(lines[i + 1], 10) || installments;
      } else if (line === 'Data Liberação do Crédito' || line === 'Data da Contratação') {
        let valStr = '';
        if (i + 1 < lines.length && lines[i+1].match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          valStr = lines[i + 1];
        } else if (i + 2 < lines.length && lines[i+2].match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          valStr = lines[i + 2];
        }
        if (valStr) {
          const [day, month, year] = valStr.split('/');
          startDate = `${year}-${month}-${day}`;
        }
      } else if (line === 'Saldo Devedor Atualizado' && i + 1 < lines.length) {
        const valStr = lines[i + 1].replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        currentBalance = parseFloat(valStr) || currentBalance;
      } else if (line === 'Situação da Parcela' || line.includes('Demonstrativo da Evolução')) {
        if (line === 'Situação da Parcela') parsingSchedule = true;
      }
    } else {
      if (line.match(/^\d+$/) && i + 6 < lines.length) {
        const nro = parseInt(line, 10);
        if (lines[i+1].match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const date = lines[i+1];
          const valor = lines[i+2];
          const principal = lines[i+3];
          const juros = lines[i+4];
          const saldo = lines[i+5];
          const status = lines[i+6];
          
          if (valor.includes('R$') && status) {
            schedule.push({ nro, date, valor, principal, juros, saldo, status });
            i += 6;
          }
        }
      }
    }
  }

  // Fallbacks
  if (!initialAmount && currentBalance) initialAmount = currentBalance;
  if (!startDate) startDate = new Date().toISOString().split('T')[0];

  if (currentBalance > initialAmount) {
    initialAmount = currentBalance;
  }

  // We are not parsing the payments fully right now. We will just compute a synthetic payment 
  // that brings the balance down to currentBalance, so the app's calculation works.
  const paidAmount = initialAmount - currentBalance;
  const payments = [];
  
  if (paidAmount > 0) {
    payments.push({
      amount: paidAmount,
      date: new Date().toISOString().split('T')[0]
    });
  }

  return {
    loan: {
      name,
      initialAmount,
      interestRate,
      installments,
      startDate,
      schedule
    },
    payments
  };
}
