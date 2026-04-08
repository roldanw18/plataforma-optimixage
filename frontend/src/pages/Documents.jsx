import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { MoreVertical, Download, Eye, FileText } from 'lucide-react';
import './Documents.css';

const Documents = () => {
  const docs = [
    { id: 1, title: 'Requisitos del Sistema v1.2', type: 'PDF', date: 'Hace 2 horas', size: '2.4 MB' },
    { id: 2, title: 'Diseño Base de Datos', type: 'SQL', date: 'Ayer', size: '1.2 MB' },
    { id: 3, title: 'Acta de Reunión - Inicio', type: 'DOCX', date: 'Hace 3 días', size: '500 KB' },
  ];

  return (
    <div className="documents-container">
      <header className="documents-header">
        <div>
          <h1 className="page-title">Documentos</h1>
          <p className="page-subtitle">Gestiona y consulta los archivos del proyecto.</p>
        </div>
        <Button variant="primary">Subir Documento</Button>
      </header>

      <div className="documents-list">
        {docs.map(doc => (
          <Card key={doc.id} className="doc-list-item">
            <div className="doc-item-icon">
              <FileText size={24} color="var(--primary)" />
            </div>
            <div className="doc-item-info">
              <h3>{doc.title}</h3>
              <div className="doc-item-meta">
                <span>{doc.type}</span> • <span>{doc.size}</span> • <span>Subido {doc.date}</span>
              </div>
            </div>
            <div className="doc-item-actions">
              <button className="action-btn" title="Ver" aria-label="Ver"><Eye size={18} /></button>
              <button className="action-btn" title="Descargar" aria-label="Descargar"><Download size={18} /></button>
              <button className="action-btn" title="Opciones" aria-label="Opciones"><MoreVertical size={18} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Documents;
