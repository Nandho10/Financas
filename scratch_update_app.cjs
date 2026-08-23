const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(
  "import { categorize, CATEGORY_STRUCTURE } from './utils/pdfParser';",
  "import { categorize, DESPESA_CATEGORIES, RECEITA_CATEGORIES } from './utils/pdfParser';"
);

content = content.replace(
  "      if (t.amount > 0) return t; // Already processed as Revenue\n      const classification = categorize(t.description, rules);\n      return {\n        ...t,\n        category: classification.category,\n        subcategory: classification.subcategory\n      };\n",
  "      const classification = categorize(t.description, t.amount, rules);\n      return {\n        ...t,\n        type: classification.type,\n        category: classification.category,\n        subcategory: classification.subcategory\n      };\n"
);

content = content.replace(
  "  const handleCategoryChange = async (id, newCategory, newSubcategory = 'Outros') => {\n    setTransactions(prev => prev.map(t => t.id === id ? { ...t, category: newCategory, subcategory: newSubcategory } : t));\n    await updateTransactionCategory(id, newCategory, newSubcategory);\n  };",
  "  const handleCategoryChange = async (id, type, newCategory, newSubcategory = 'Outros') => {\n    setTransactions(prev => prev.map(t => t.id === id ? { ...t, type, category: newCategory, subcategory: newSubcategory } : t));\n    await updateTransactionCategory(id, type, newCategory, newSubcategory);\n  };"
);

content = content.replace(
  "    // Re-categorize existing transactions retroactively\n    const updatedTxs = transactions.map(t => {\n      if (t.amount > 0) return t; // Skip revenues\n      const classification = categorize(t.description, updatedRules);\n      if (classification.category !== t.category || classification.subcategory !== t.subcategory) {\n        // Update directly in IndexedDB without scheduler conflicts\n        updateTransactionCategory(t.id, classification.category, classification.subcategory);\n        return { ...t, category: classification.category, subcategory: classification.subcategory };\n      }\n      return t;\n    });",
  "    // Re-categorize existing transactions retroactively\n    const updatedTxs = transactions.map(t => {\n      const classification = categorize(t.description, t.amount, updatedRules);\n      if (classification.category !== t.category || classification.subcategory !== t.subcategory) {\n        // Update directly in IndexedDB without scheduler conflicts\n        updateTransactionCategory(t.id, classification.type, classification.category, classification.subcategory);\n        return { ...t, type: classification.type, category: classification.category, subcategory: classification.subcategory };\n      }\n      return t;\n    });"
);

content = content.replace(
  "    setModalCategory(tx.category !== 'Outros' ? tx.category : 'Alimentação');\n    \n    const subs = CATEGORY_STRUCTURE[tx.category !== 'Outros' ? tx.category : 'Alimentação'] || ['Outros'];\n    setModalSubcategory(tx.subcategory !== 'Outros' ? tx.subcategory : subs[0] || 'Outros');",
  "    const txType = tx.amount > 0 ? 'Receita' : 'Despesa';\n    const struct = txType === 'Receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;\n    const defCat = txType === 'Receita' ? 'Outras Receitas' : 'Alimentação';\n\n    setModalCategory(tx.category !== 'Outros' ? tx.category : defCat);\n    const subs = struct[tx.category !== 'Outros' ? tx.category : defCat] || ['Outros'];\n    setModalSubcategory(tx.subcategory !== 'Outros' ? tx.subcategory : subs[0] || 'Outros');"
);

content = content.replace(
  "  const handleModalCategoryChange = (cat) => {\n    setModalCategory(cat);\n    const subs = CATEGORY_STRUCTURE[cat] || ['Outros'];\n    setModalSubcategory(subs[0] || 'Outros');\n  };",
  "  const handleModalCategoryChange = (cat) => {\n    setModalCategory(cat);\n    const txType = linkingTransaction ? (linkingTransaction.amount > 0 ? 'Receita' : 'Despesa') : 'Despesa';\n    const struct = txType === 'Receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;\n    const subs = struct[cat] || ['Outros'];\n    setModalSubcategory(subs[0] || 'Outros');\n  };"
);

content = content.replace(
  "    const newRule = {\n      keyword: modalKeyword.trim(),\n      category: modalCategory,\n      subcategory: modalSubcategory\n    };",
  "    const txType = linkingTransaction ? (linkingTransaction.amount > 0 ? 'Receita' : 'Despesa') : 'Despesa';\n    const newRule = {\n      keyword: modalKeyword.trim(),\n      type: txType,\n      category: modalCategory,\n      subcategory: modalSubcategory\n    };"
);

content = content.replace(
  "{Object.keys(CATEGORY_STRUCTURE).map(cat => (\n                    <option key={cat} value={cat}>{cat}</option>\n                  ))}",
  "{Object.keys(linkingTransaction && linkingTransaction.amount > 0 ? RECEITA_CATEGORIES : DESPESA_CATEGORIES).map(cat => (\n                    <option key={cat} value={cat}>{cat}</option>\n                  ))}"
);

content = content.replace(
  "{(CATEGORY_STRUCTURE[modalCategory] || ['Outros']).map(sub => (\n                    <option key={sub} value={sub}>{sub}</option>\n                  ))}",
  "{((linkingTransaction && linkingTransaction.amount > 0 ? RECEITA_CATEGORIES : DESPESA_CATEGORIES)[modalCategory] || ['Outros']).map(sub => (\n                    <option key={sub} value={sub}>{sub}</option>\n                  ))}"
);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx updated');
