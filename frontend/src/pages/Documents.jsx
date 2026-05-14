import React from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { MoreVertical, Download, Eye, FileText } from 'lucide-react'
import './Documents.css'

const Documents = () => {
  const { t } = useTranslation('client')
  const docs = [
    { id: 1, title: 'Requisitos del Sistema v1.2', type: 'PDF', date: 'Hace 2 horas', size: '2.4 MB' },
    { id: 2, title: 'Diseño Base de Datos', type: 'SQL', date: 'Ayer', size: '1.2 MB' },
    { id: 3, title: 'Acta de Reunión - Inicio', type: 'DOCX', date: 'Hace 3 días', size: '500 KB' },
  ]

  return (
    <div className="documents-container">
      <header className="documents-header">
        <div>
          <h1 className="page-title">{t('documentos.title')}</h1>
          <p className="page-subtitle">{t('documentos.subtitle')}</p>
        </div>
        <Button variant="primary">{t('documentos.upload_title')}</Button>
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
                <span>{doc.type}</span> • <span>{doc.size}</span> • <span>{t('documentos.uploaded_on', { date: doc.date })}</span>
              </div>
            </div>
            <div className="doc-item-actions">
              <button className="action-btn" title={t('documentos.download')} aria-label={t('documentos.download')}><Eye size={18} /></button>
              <button className="action-btn" title={t('documentos.download')} aria-label={t('documentos.download')}><Download size={18} /></button>
              <button className="action-btn" title={t('common.options')} aria-label={t('common.options')}><MoreVertical size={18} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Documents
