import * as pdfjsLib from 'pdfjs-dist';

// Set worker from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;

// Structure of Categories and Subcategories
export const DESPESA_CATEGORIES = {
  'Alimentação': ['Açougue', 'Delivery', 'Hortifruti', 'Lanche', 'Mercearia', 'Padaria', 'Pets', 'Restaurante', 'Outros'],
  'Confeitaria': ['Embalagens', 'Equipamentos', 'Material', 'Máquinas', 'Outros'],
  'Cartões de crédito': ['Adiantamento fatura', 'Ajustes', 'Estornos', 'Parcelamento de fatura', 'Outros'],
  'Consórcio': ['Automóvel', 'Outros'],
  'Educação': ['Cursos', 'Livros E Apostilas', 'Material Escolar', 'Mensalidade Escolar', 'Outros'],
  'Investimentos': ['Patrimônio', 'Pagamento de Dívidas', 'Carro', 'Outros'],
  'Lazer': ['Jogos De PlayStation', 'Cinema', 'Parque', 'Teatro', 'Viagens', 'Outros'],
  'Moradia': ['Fixas', 'Aquisições', 'Manutenções', 'Jardinagem', 'Outros'],
  'Outros': ['Ajustes', 'Areia para Gatos', 'Família', 'Presentes', 'Outros'],
  'Pagamentos': ['Taxas', 'Empréstimo', 'Outros'],
  'Saúde': ['Academia', 'Consulta', 'Remédios', 'Cuidados Pessoais', 'Outros'],
  'Serviços': ['Telefonia Celular', 'Videos', 'Jogos', 'Armazenamento', 'Manutenção', 'Streamer', 'Outros'],
  'Transporte': ['Ônibus', 'Metrô', 'Transp. Aplicativo', 'Trens', 'Van Escolar', 'Outros'],
  'Vestuário': ['Roupas', 'Blusas', 'Calçados', 'Perfumaria', 'Outros']
};

export const RECEITA_CATEGORIES = {
  'Benefícios': ['Alimentação', 'Décimo Terceiro', 'Outros', 'Refeição', 'Transporte'],
  'Fixa mensal': ['Salário', 'Outros'],
  'Vendas': ['Bolo', 'Doces', 'Outros', 'Topo'],
  'Outras Receitas': ['Comissão', 'Pagamentos', 'Rendimentos', 'Serviços', 'Outros']
};

// Default mapping rules (keyword -> { type, category, subcategory })
const DEFAULT_RULES = [
  // Alimentação
  { keywords: ['ifood'], type: 'Despesa', category: 'Alimentação', subcategory: 'Delivery' },
  { keywords: ['padaria', 'panificadora'], type: 'Despesa', category: 'Alimentação', subcategory: 'Padaria' },
  { keywords: ['mercado', 'mags', 'nagumo', 'supermercado', 'shpp', 'mercearia'], type: 'Despesa', category: 'Alimentação', subcategory: 'Mercearia' },
  { keywords: ['atacadao', 'assai', 'makro'], type: 'Despesa', category: 'Alimentação', subcategory: 'Mercearia' },
  { keywords: ['dlimas', 'açougue', 'casa de carnes', 'boutique da carne'], type: 'Despesa', category: 'Alimentação', subcategory: 'Açougue' },
  { keywords: ['gsslegumes', 'rogerioverdur', 'hortifruti', 'verdur', 'pomar'], type: 'Despesa', category: 'Alimentação', subcategory: 'Hortifruti' },
  { keywords: ['confeitaria', 'doceria', 'bolo', 'doce'], type: 'Despesa', category: 'Confeitaria', subcategory: 'Outros' },
  { keywords: ['chicodocaldo', 'restaurante', 'pizzaria', 'churrascaria'], type: 'Despesa', category: 'Alimentação', subcategory: 'Restaurante' },
  
  // Transporte
  { keywords: ['uber rides', 'uber *rides', 'uber', '99 ride', '99app', '99', 'cabify'], type: 'Despesa', category: 'Transporte', subcategory: 'Transp. Aplicativo' },
  { keywords: ['onibus', 'sptrans', 'bilhete unico'], type: 'Despesa', category: 'Transporte', subcategory: 'Ônibus' },
  { keywords: ['metro', 'metrô'], type: 'Despesa', category: 'Transporte', subcategory: 'Metrô' },
  { keywords: ['trem', 'cptm'], type: 'Despesa', category: 'Transporte', subcategory: 'Trens' },
  { keywords: ['van escolar', 'transporte escolar'], type: 'Despesa', category: 'Transporte', subcategory: 'Van Escolar' },

  // Saúde
  { keywords: ['plena saude', 'rdsaude', 'drogasil', 'drogaria', 'farmacia', 'remedio', 'medicamento'], type: 'Despesa', category: 'Saúde', subcategory: 'Remédios' },
  { keywords: ['plena odonto', 'dentista', 'odonto', 'medico', 'consulta', 'clinica'], type: 'Despesa', category: 'Saúde', subcategory: 'Consulta' },
  { keywords: ['academia', 'gym', 'smartfit', 'crossfit'], type: 'Despesa', category: 'Saúde', subcategory: 'Academia' },

  // Lazer
  { keywords: ['gamerbrasil', 'playstation', 'psn', 'jogo playstation', 'steam', 'epic games', 'nintendo'], type: 'Despesa', category: 'Lazer', subcategory: 'Jogos De PlayStation' },
  { keywords: ['cinema', 'cinemark', 'cinepolis', 'ingresso.com'], type: 'Despesa', category: 'Lazer', subcategory: 'Cinema' },
  { keywords: ['parque', 'ingressos parque'], type: 'Despesa', category: 'Lazer', subcategory: 'Parque' },
  { keywords: ['teatro', 'show', 'espetaculo'], type: 'Despesa', category: 'Lazer', subcategory: 'Teatro' },
  { keywords: ['viagem', 'hospedagem', 'decolar', 'hotel', 'passagem'], type: 'Despesa', category: 'Lazer', subcategory: 'Viagens' },

  // Serviços
  { keywords: ['tim s a', 'telefonica', 'recarga pre pado', 'recarga', 'tim', 'vivo', 'claro', 'telef'], type: 'Despesa', category: 'Serviços', subcategory: 'Telefonia Celular' },
  { keywords: ['netflix', 'disney+', 'hbo', 'prime video', 'youtube premium'], type: 'Despesa', category: 'Serviços', subcategory: 'Videos' },
  { keywords: ['google storage', 'icloud', 'dropbox', 'onedrive', 'armazenamento'], type: 'Despesa', category: 'Serviços', subcategory: 'Armazenamento' },
  { keywords: ['streamer', 'twitch', 'live'], type: 'Despesa', category: 'Serviços', subcategory: 'Streamer' },

  // Moradia
  { keywords: ['gazin', 'consorcio', 'administradora consorcio'], type: 'Despesa', category: 'Consórcio', subcategory: 'Automóvel' },
  { keywords: ['aluguel', 'condominio', 'enel', 'sabesp', 'luz', 'agua', 'energia'], type: 'Despesa', category: 'Moradia', subcategory: 'Fixas' },

  // Outros
  { keywords: ['areia para gatos', 'areia gato', 'pet', 'racao', 'petz', 'cobasi'], type: 'Despesa', category: 'Outros', subcategory: 'Areia para Gatos' },

  // Receita
  { keywords: ['salario base', 'holerite', 'vencimentos', 'liquido'], type: 'Receita', category: 'Fixa mensal', subcategory: 'Salário' },
  { keywords: ['rendimentos', 'poup facil', 'rendimento'], type: 'Receita', category: 'Outras Receitas', subcategory: 'Rendimentos' }
];

export function categorize(description, amount, customRules = []) {
  const descLower = description.toLowerCase();
  const txType = amount > 0 ? 'Receita' : 'Despesa';
  
  // 1. Check custom rules first
  for (const rule of customRules) {
    if (rule.keyword && descLower.includes(rule.keyword.toLowerCase())) {
      if (!rule.type || rule.type === txType) {
        return { type: txType, category: rule.category, subcategory: rule.subcategory || 'Outros' };
      }
    }
  }

  // 2. Check default rules
  for (const rule of DEFAULT_RULES) {
    if (rule.type === txType) {
      for (const kw of rule.keywords) {
        if (descLower.includes(kw)) {
          return { type: txType, category: rule.category, subcategory: rule.subcategory };
        }
      }
    }
  }

  return { type: txType, category: txType === 'Receita' ? 'Outras Receitas' : 'Outros', subcategory: 'Outros' };
}

export async function parsePDFFile(file, password = '', customRules = []) {
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    password: password
  });

  const pdf = await loadingTask.promise;
  let textItems = [];
  
  let sortedTextItems = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Native order (required for Itaú)
    const nativeStrings = textContent.items.map(item => item.str.trim()).filter(Boolean);
    textItems.push(...nativeStrings);

    // Sorted order (required for Bradesco and Nubank)
    const sortedItems = [...textContent.items].sort((a, b) => {
      if (Math.abs(b.transform[5] - a.transform[5]) > 5) {
        return b.transform[5] - a.transform[5]; // Sort by Y
      }
      return a.transform[4] - b.transform[4]; // Sort by X
    });
    const sortedStrings = sortedItems.map(item => item.str.trim()).filter(Boolean);
    sortedTextItems.push(...sortedStrings);
  }

  const fileText = textItems.join('\n');
  
  // Detect Statement Type
  if (fileText.includes('Bradesco') || fileText.includes('Extrato de:') || fileText.includes('SALDO ANTERIOR')) {
    return parseBradesco(sortedTextItems, file.name, customRules);
  } else if (fileText.includes('Nubank') || fileText.includes('Nu Pagamentos') || fileText.includes('TRANSAÇÕES\nDE')) {
    return parseNubank(sortedTextItems, file.name, customRules);
  } else if (fileText.includes('Banco Itaú') || fileText.includes('ITAU UNIBANCO')) {
    return parseItau(textItems, file.name, customRules);
  } else if (fileText.includes('Demonstrativo de Pagamento') || fileText.includes('COMPETÊNCIA') || fileText.includes('VALOR TOTAL LÍQUIDO')) {
    return parseHolerite(sortedTextItems, file.name, customRules);
  } else {
    throw new Error('Formato de PDF não reconhecido. O sistema suporta Extratos Bradesco, Faturas Nubank e Holerites padrão.');
  }
}

// Parsing logic for Bradesco Statement
function parseBradesco(lines, filename, customRules) {
  const transactions = [];
  let currentDate = '';
  
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Saldo (R$)') || lines[i].includes('SALDO ANTERIOR')) {
      startIdx = i + 1;
      break; // Stop at the first occurrence to parse all sections
    }
  }

  let i = startIdx;
  let currentDescParts = [];
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    const dateMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);
    if (dateMatch) {
      currentDate = formatBradescoDate(line);
      i++;
      continue;
    }

    const doctoMatch = line.match(/^(\d{7})$/);
    if (doctoMatch && currentDescParts.length > 0) {
      const docto = doctoMatch[1];
      const description = currentDescParts.join(' ').replace(/\s+/g, ' ');
      
      i++;
      if (i < lines.length) {
        let valueStr = lines[i].trim();
        
        const isDebit = valueStr.startsWith('-');
        let cleanValue = valueStr.replace(/[^0-9,]/g, '').replace(',', '.');
        let amount = parseFloat(cleanValue);
        if (isDebit) amount = -amount;

        if (!isNaN(amount) && currentDate) {
          i++;
          if (i < lines.length) {
            const possibleBalance = lines[i].trim();
            if (possibleBalance.match(/^[0-9.,]+$/) && !possibleBalance.match(/^\d{7}$/)) {
              i++;
            }
          }
          
          let txDate = currentDate;
          const inlineDateMatch = description.match(/(\d{2})\/(\d{2})$/);
          if (inlineDateMatch) {
            const year = currentDate.split('-')[0];
            txDate = `${year}-${inlineDateMatch[2]}-${inlineDateMatch[1]}`;
          }

          if (!description.toLowerCase().includes('total') && !description.toLowerCase().includes('saldo anterior')) {
            const classification = categorize(description, amount, customRules);
              
            transactions.push({
              id: `bradesco_${txDate}_${docto}_${Math.abs(amount).toFixed(2)}`,
              date: txDate,
              description,
              amount,
              type: classification.type,
              category: classification.category,
              subcategory: classification.subcategory,
              source: 'Bradesco',
              sourceFile: filename
            });
          }
        }
      }
      currentDescParts = [];
      continue;
    }

    if (!line.includes('Os dados acima têm como base') && 
        !line.includes('Últimos Lançamentos') && 
        !line.includes('Saldos Invest Fácil') &&
        !line.includes('Total') &&
        !line.match(/^[0-9.,]+$/)) {
      currentDescParts.push(line);
    }
    
    i++;
  }

  return transactions;
}

// Parsing logic for Itaú Fatura
function parseItau(lines, filename, customRules) {
  const transactions = [];
  let currentYear = new Date().getFullYear().toString();
  
  for (const line of lines) {
    const vMatch = line.match(/Vencimento: \d{2}\/\d{2}\/(\d{4})/i);
    if (vMatch) {
      currentYear = vMatch[1];
      break;
    }
  }

  let currentSection = 'ignore';
  let rollingWindow = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    rollingWindow.push(line);
    if (rollingWindow.length > 5) rollingWindow.shift();
    
    const combinedText = rollingWindow.join('').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (combinedText.includes('amentoscomprasesaques')) {
      currentSection = 'valid';
    } else if (combinedText.includes('amentosprodutoseservi')) {
      currentSection = 'valid';
    } else if (combinedText.includes('comprasparceladaspr')) {
      currentSection = 'ignore';
    } else if (combinedText.includes('pagamentosefetuados')) {
      currentSection = 'ignore';
    }
    
    if (currentSection === 'valid' && line.match(/^\d{2}\/\d{2}$/)) {
      const dateStr = line;
      if (i + 2 < lines.length) {
        let description = lines[i+1].trim();
        let valStr = lines[i+2].trim();
        
        if (valStr.match(/^[0-9.,]+$/)) {
           let cleanValue = valStr.replace(/[^0-9,]/g, '').replace(',', '.');
           let amount = -parseFloat(cleanValue);
           
           const [day, month] = dateStr.split('/');
           const date = `${currentYear}-${month}-${day}`;
           
           const classification = categorize(description, amount, customRules);
           const uniqueId = Math.random().toString(36).substring(2, 7);
           
           transactions.push({
             id: `itau_${date}_${description.replace(/\s+/g, '')}_${Math.abs(amount).toFixed(2)}_${uniqueId}`,
             date,
             description,
             amount,
             type: classification.type,
             category: classification.category,
             subcategory: classification.subcategory,
             source: 'Itaú',
             sourceFile: filename
           });
           i += 3;
           continue;
        } else if (i + 3 < lines.length && lines[i+3].match(/^[0-9.,]+$/)) {
           let cleanValue = lines[i+3].trim().replace(/[^0-9,]/g, '').replace(',', '.');
           let amount = -parseFloat(cleanValue);
           
           const [day, month] = dateStr.split('/');
           const date = `${currentYear}-${month}-${day}`;
           
           description = description + ' ' + valStr;
           
           const classification = categorize(description, amount, customRules);
           const uniqueId = Math.random().toString(36).substring(2, 7);
           
           transactions.push({
             id: `itau_${date}_${description.replace(/\s+/g, '')}_${Math.abs(amount).toFixed(2)}_${uniqueId}`,
             date,
             description,
             amount,
             type: classification.type,
             category: classification.category,
             subcategory: classification.subcategory,
             source: 'Itaú',
             sourceFile: filename
           });
           i += 4;
           continue;
        }
      }
    }
    
    i++;
  }
  
  return transactions;
}


// Parsing logic for Nubank Fatura
function parseNubank(lines, filename, customRules) {
  const transactions = [];
  let currentYear = new Date().getFullYear().toString();
  
  for (const line of lines) {
    const yearMatch = line.match(/FATURA \d{2} [A-Z]{3} (\d{4})/i);
    if (yearMatch) {
      currentYear = yearMatch[1];
      break;
    }
  }

  const monthMap = {
    'JAN': '01', 'FEV': '02', 'MAR': '03', 'ABR': '04', 'MAI': '05', 'JUN': '06',
    'JUL': '07', 'AGO': '08', 'SET': '09', 'OUT': '10', 'NOV': '11', 'DEZ': '12'
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    const dateMatch = line.match(/^(\d{2})\s+([A-Z]{3})$/i);
    if (dateMatch && i + 2 < lines.length) {
      const day = dateMatch[1];
      const monthStr = dateMatch[2].toUpperCase();
      const month = monthMap[monthStr];
      
      if (month) {
        let valIdx = -1;
        for (let j = 2; j <= 4; j++) {
          if (i + j < lines.length && lines[i + j].includes('R$')) {
            valIdx = i + j;
            break;
          }
        }
        
        if (valIdx !== -1) {
          const description = lines[valIdx - 1].trim();
          const valueStr = lines[valIdx].trim();
          
          const isCredit = valueStr.includes('−') || valueStr.includes('-');
          let cleanValue = valueStr.replace(/[^0-9,]/g, '').replace(',', '.');
          let amount = parseFloat(cleanValue);
          if (!isCredit) {
            amount = -amount;
          } else {
            amount = Math.abs(amount);
          }

          const date = `${currentYear}-${month}-${day}`;

          if (!description.toLowerCase().includes('pagamento em') && 
              !description.toLowerCase().includes('saldo restante')) {
            const classification = categorize(description, amount, customRules);

            const uniqueId = Math.random().toString(36).substring(2, 7);
            transactions.push({
              id: `nubank_${date}_${description.replace(/\s+/g, '')}_${Math.abs(amount).toFixed(2)}_${uniqueId}`,
              date,
              description,
              amount,
              type: classification.type,
              category: classification.category,
              subcategory: classification.subcategory,
              source: 'Nubank',
              sourceFile: filename
            });
          }
          i = valIdx + 1;
          continue;
        }
      }
    }
    i++;
  }
  return transactions;
}

// Parsing logic for Holerite (Payslip)
function parseHolerite(lines, filename, customRules) {
  const transactions = [];
  
  let competency = '';
  let paymentDate = '';
  let netIncome = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('COMPETÊNCIA') && i + 1 < lines.length) {
      competency = lines[i + 1].trim();
    }
    
    if (line.includes('DATA DO PAGAMENTO') && i + 3 < lines.length) {
      for (let j = 1; j <= 4; j++) {
        if (i + j < lines.length && lines[i + j].match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          paymentDate = formatBradescoDate(lines[i + j].trim());
          break;
        }
      }
    }

    if (line.includes('VALOR TOTAL LÍQUIDO') && i + 1 < lines.length) {
      const valStr = lines[i + 1].replace(':', '').trim();
      let cleanVal = valStr.replace(/[^0-9,]/g, '').replace(',', '.');
      netIncome = parseFloat(cleanVal);
    }
  }

  if (!paymentDate && competency) {
    const [month, year] = competency.split('/');
    paymentDate = `${year}-${month}-05`;
  } else if (!paymentDate) {
    const today = new Date();
    paymentDate = today.toISOString().split('T')[0];
  }

  if (netIncome > 0) {
    transactions.push({
      id: `holerite_${paymentDate}_net_${netIncome.toFixed(2)}`,
      date: paymentDate,
      description: `Holerite Líquido Recebido - Comp. ${competency || ''}`,
      amount: netIncome,
      type: 'Receita',
      category: 'Fixa mensal',
      subcategory: 'Salário',
      source: 'Holerite',
      sourceFile: filename
    });
  }

  return transactions;
}

function formatBradescoDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    let [day, month, year] = parts;
    if (year.length === 2) {
      year = '20' + year;
    }
  return `${year}-${month}-${day}`;
  }
  return dateStr;
}
