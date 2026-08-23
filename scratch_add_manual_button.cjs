const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add Plus import
content = content.replace(
  "import { LayoutDashboard, Sliders, RefreshCw, Landmark, ChevronLeft, ChevronRight } from 'lucide-react';",
  "import { LayoutDashboard, Sliders, RefreshCw, Landmark, ChevronLeft, ChevronRight, Plus } from 'lucide-react';"
);

// 2. Add showAddMenu state
content = content.replace(
  "  const [currentMonth, setCurrentMonth] = useState('');",
  "  const [currentMonth, setCurrentMonth] = useState('');\n  const [showAddMenu, setShowAddMenu] = useState(false);"
);

// 3. Insert UI in header
const addMenuUI = `            </div>
          )}

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowAddMenu(!showAddMenu)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--success)', 
                color: '#fff', 
                border: 'none', 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              title="Adicionar Lançamento Manual"
            >
              <Plus size={20} />
            </button>

            {showAddMenu && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0, 
                marginTop: '0.5rem', 
                backgroundColor: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '0.5rem', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                zIndex: 50,
                minWidth: '160px'
              }}>
                <button 
                  onClick={() => { setShowAddMenu(false); alert('Novo Cadastro de Receita em breve!'); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span style={{ color: 'var(--success)', marginRight: '0.5rem', fontWeight: 'bold' }}>+</span> Nova Receita
                </button>
                <button 
                  onClick={() => { setShowAddMenu(false); alert('Novo Cadastro de Despesa em breve!'); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span style={{ color: 'var(--danger)', marginRight: '0.5rem', fontWeight: 'bold' }}>-</span> Nova Despesa
                </button>
              </div>
            )}
          </div>

          <nav className="tabs">`;

content = content.replace(
  `            </div>\n          )}\n          <nav className="tabs">`,
  addMenuUI
);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx updated with add button');
