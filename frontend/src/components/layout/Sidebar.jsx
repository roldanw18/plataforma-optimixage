import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Activity, Video, Users, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Inicio', path: '/' },
    { icon: FileText, label: 'Documentos', path: '/documents' },
    { icon: Activity, label: 'Procesos', path: '/processes' },
    { icon: Video, label: 'Reuniones', path: '/meetings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1 className="logo-text">Optimixage</h1>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={index} 
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="info-card">
          <p className="info-title">Soporte Técnico</p>
          <p className="info-desc">¿Necesitas ayuda con la plataforma?</p>
          <button className="info-btn">Contactar</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
