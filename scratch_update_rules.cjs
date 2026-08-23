const fs = require('fs');

let content = fs.readFileSync('src/components/RulesManager.jsx', 'utf8');

content = content.replace(
  "import { CATEGORY_STRUCTURE } from '../utils/pdfParser';",
  "import { DESPESA_CATEGORIES, RECEITA_CATEGORIES } from '../utils/pdfParser';"
);

content = content.replace(
  "  const [keyword, setKeyword] = useState('');\n  const [category, setCategory] = useState('Alimentação');\n  const [subcategory, setSubcategory] = useState('Outros');\n\n  const categories = Object.keys(CATEGORY_STRUCTURE);\n  const subcategories = CATEGORY_STRUCTURE[category] || ['Outros'];\n\n  // Handle Category change to update default subcategory\n  const handleCategoryChange = (cat) => {\n    setCategory(cat);\n    const subs = CATEGORY_STRUCTURE[cat] || ['Outros'];\n    setSubcategory(subs[0] || 'Outros');\n  };\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    if (!keyword.trim()) return;\n    onAddRule({ \n      keyword: keyword.trim(), \n      category, \n      subcategory \n    });\n    setKeyword('');\n  };",
  `  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('Despesa');
  const [category, setCategory] = useState('Alimentação');
  const [subcategory, setSubcategory] = useState('Outros');

  const struct = type === 'Receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;
  const categories = Object.keys(struct);
  const subcategories = struct[category] || ['Outros'];

  const handleTypeChange = (newType) => {
    setType(newType);
    const newStruct = newType === 'Receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;
    const defCat = newType === 'Receita' ? 'Outras Receitas' : 'Alimentação';
    setCategory(defCat);
    setSubcategory(newStruct[defCat] ? newStruct[defCat][0] : 'Outros');
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const subs = struct[cat] || ['Outros'];
    setSubcategory(subs[0] || 'Outros');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onAddRule({ 
      keyword: keyword.trim(), 
      type,
      category, 
      subcategory 
    });
    setKeyword('');
  };`
);

content = content.replace(
  "<select \n          value={category}",
  `<select 
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="filter-select"
          style={{ flex: 1, minWidth: '100px' }}
        >
          <option value="Despesa">Saída (Despesa)</option>
          <option value="Receita">Entrada (Receita)</option>
        </select>
        
        <select 
          value={category}`
);

content = content.replace(
  "                <span className=\"badge badge-source\" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary-hover)', fontSize: '0.8rem' }}>\n                  {rule.category} &gt; {rule.subcategory || 'Outros'}\n                </span>",
  "                <span className=\"badge badge-source\" style={{ backgroundColor: rule.type === 'Receita' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: rule.type === 'Receita' ? 'var(--success)' : 'var(--danger)', fontSize: '0.75rem', marginRight: '0.5rem' }}>\n                  {rule.type || 'Despesa'}\n                </span>\n                <span className=\"badge badge-source\" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary-hover)', fontSize: '0.8rem' }}>\n                  {rule.category} &gt; {rule.subcategory || 'Outros'}\n                </span>"
);

fs.writeFileSync('src/components/RulesManager.jsx', content, 'utf8');
console.log('RulesManager updated');
