import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Lock, AlertCircle, X } from 'lucide-react';
import { parsePDFFile } from '../utils/pdfParser';

export default function FileUploader({ onTransactionsParsed, customRules }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [passwordReq, setPasswordReq] = useState(null); // { file, id }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (fileObj, password = '') => {
    // Update status to loading
    setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'loading', error: null } : f));
    
    try {
      const txs = await parsePDFFile(fileObj.file, password, customRules);
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success', txCount: txs.length } : f));
      onTransactionsParsed(txs, fileObj.file.name);
      
      // Clear password request if it was this file
      if (passwordReq && passwordReq.id === fileObj.id) {
        setPasswordReq(null);
      }
    } catch (err) {
      if (err.name === 'PasswordException' || err.message.includes('password') || err.message.includes('Password')) {
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'locked' } : f));
        setPasswordReq({ fileObj, id: fileObj.id, passwordInput: '' });
      } else {
        console.error(err);
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: err.message } : f));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (incomingFiles) => {
    const pdfFiles = incomingFiles.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    
    const newFileObjs = pdfFiles.map(file => {
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        id,
        file,
        status: 'pending', // pending, loading, success, locked, error
        txCount: 0,
        error: null
      };
    });

    setFiles(prev => [...prev, ...newFileObjs]);
    newFileObjs.forEach(f => processFile(f));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordReq) return;
    processFile(passwordReq.fileObj, passwordReq.passwordInput);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (passwordReq && passwordReq.id === id) {
      setPasswordReq(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div 
        className={`uploader-zone ${dragActive ? 'drag-over' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('pdf-file-input').click()}
      >
        <input 
          id="pdf-file-input"
          type="file"
          multiple
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
        <div className="uploader-icon">
          <UploadCloud size={32} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
            Arraste e solte seus PDFs aqui
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Suporta faturas de cartão, extratos bancários e holerites
          </p>
        </div>
        <button type="button" className="btn btn-secondary" style={{ pointerEvents: 'none' }}>
          Selecionar arquivos
        </button>
      </div>

      {passwordReq && (
        <div className="glass-card" style={{ border: '1px solid var(--warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
              <Lock size={20} />
              <span style={{ fontWeight: 600 }}>Arquivo protegido por senha</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              O arquivo <strong>{passwordReq.fileObj.file.name}</strong> está criptografado. Digite a senha para abri-lo:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="password"
                placeholder="Senha do PDF"
                value={passwordReq.passwordInput}
                onChange={(e) => setPasswordReq({ ...passwordReq, passwordInput: e.target.value })}
                className="search-input"
                style={{ flex: 1, minWidth: 'auto' }}
                autoFocus
              />
              <button type="submit" className="btn">
                Desbloquear
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setPasswordReq(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {files.length > 0 && (
        <div className="file-list">
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Arquivos Enviados
          </p>
          {files.map(f => (
            <div key={f.id} className="file-item">
              <div className="file-info">
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{f.file.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {(f.file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {f.status === 'pending' && <span className="file-status">Pendente</span>}
                {f.status === 'loading' && <span className="file-status loading">Processando...</span>}
                {f.status === 'success' && (
                  <span className="file-status success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={14} /> {f.txCount} lançamentos
                  </span>
                )}
                {f.status === 'locked' && (
                  <span className="file-status" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                    Bloqueado
                  </span>
                )}
                {f.status === 'error' && (
                  <span 
                    className="file-status" 
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    title={f.error}
                  >
                    <AlertCircle size={14} /> Erro
                  </span>
                )}
                
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
