import React from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../components/common/Card'
import './Dashboard.css'

const Dashboard = () => {
  const { t } = useTranslation('common')

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-section col-span-2">
          <h2 className="section-title">{t('dashboard.recent_documents')}</h2>
          <div className="cards-list">
            <Card className="doc-card">
              <div className="doc-icon">DOC</div>
              <div className="doc-info">
                <h3>Informe de Progreso Trimestral</h3>
                <p>{t('dashboard.modified_days', { days: 2 })}</p>
              </div>
            </Card>
            <Card className="doc-card">
              <div className="doc-icon">PDF</div>
              <div className="doc-info">
                <h3>Especificaciones Técnicas v2</h3>
                <p>{t('dashboard.modified_days', { days: 5 })}</p>
              </div>
            </Card>
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">{t('dashboard.upcoming_meetings')}</h2>
          <Card className="meeting-card">
            <div className="meeting-date">
              <span className="meeting-day">24</span>
              <span className="meeting-month">OCT</span>
            </div>
            <div className="meeting-details">
              <h3>Revisión de Avance</h3>
              <p>10:00 AM - 11:30 AM</p>
              <p className="meeting-link">{t('dashboard.view_details')}</p>
            </div>
          </Card>
        </section>

        <section className="dashboard-section col-span-3">
          <h2 className="section-title">{t('dashboard.current_process')}</h2>
          <Card>
            <div className="process-tracker">
              <div className="process-step completed">
                <div className="step-circle">1</div>
                <span>{t('dashboard.stages.analysis')}</span>
              </div>
              <div className="process-line completed"></div>
              <div className="process-step active">
                <div className="step-circle">2</div>
                <span>{t('dashboard.stages.development')}</span>
              </div>
              <div className="process-line"></div>
              <div className="process-step">
                <div className="step-circle">3</div>
                <span>{t('dashboard.stages.testing')}</span>
              </div>
              <div className="process-line"></div>
              <div className="process-step">
                <div className="step-circle">4</div>
                <span>{t('dashboard.stages.delivery')}</span>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
