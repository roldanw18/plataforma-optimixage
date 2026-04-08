import React from 'react';
import Card from '../components/common/Card';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="page-title">Resumen del Proyecto</h1>
          <p className="page-subtitle">Bienvenido al panel principal de Optimixage.</p>
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-section col-span-2">
          <h2 className="section-title">Últimos Documentos</h2>
          <div className="cards-list">
            <Card className="doc-card">
              <div className="doc-icon">DOC</div>
              <div className="doc-info">
                <h3>Informe de Progreso Trimestral</h3>
                <p>Modificado hace 2 días</p>
              </div>
            </Card>
            <Card className="doc-card">
              <div className="doc-icon">PDF</div>
              <div className="doc-info">
                <h3>Especificaciones Técnicas v2</h3>
                <p>Modificado hace 5 días</p>
              </div>
            </Card>
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">Reuniones Próximas</h2>
          <Card className="meeting-card">
            <div className="meeting-date">
              <span className="meeting-day">24</span>
              <span className="meeting-month">OCT</span>
            </div>
            <div className="meeting-details">
              <h3>Revisión de Avance</h3>
              <p>10:00 AM - 11:30 AM</p>
              <p className="meeting-link">Ver detalles</p>
            </div>
          </Card>
        </section>

        <section className="dashboard-section col-span-3">
          <h2 className="section-title">Proceso Actual</h2>
          <Card>
            <div className="process-tracker">
              <div className="process-step completed">
                <div className="step-circle">1</div>
                <span>Análisis</span>
              </div>
              <div className="process-line completed"></div>
              <div className="process-step active">
                <div className="step-circle">2</div>
                <span>Desarrollo</span>
              </div>
              <div className="process-line"></div>
              <div className="process-step">
                <div className="step-circle">3</div>
                <span>Pruebas</span>
              </div>
              <div className="process-line"></div>
              <div className="process-step">
                <div className="step-circle">4</div>
                <span>Entrega</span>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
