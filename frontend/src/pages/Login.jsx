import React from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-brand-panel">
        <div className="brand-content">
          <h1>Optimixage</h1>
          <p>Plataforma integral para seguimiento de procesos y control documental para sus proyectos.</p>
        </div>
      </div>
      <div className="login-form-panel">
        <div className="form-wrapper">
          <h2>Iniciar Sesión</h2>
          <p className="form-subtitle">Bienvenido de nuevo, por favor ingrese sus datos.</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <Input 
              label="Correo Electrónico" 
              type="email" 
              placeholder="ejemplo@empresa.com" 
              required
            />
            <Input 
              label="Contraseña" 
              type="password" 
              placeholder="••••••••" 
              required
            />
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <a href="#" className="forgot-password">¿Olvidó su contraseña?</a>
            </div>

            <Button type="submit" fullWidth variant="primary" size="lg" className="submit-btn">
              Ingresar a la plataforma
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
