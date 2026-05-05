import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '2rem', textAlign: 'center', background: '#f9fafb',
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '40px 48px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '480px', width: '100%',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0a0a4e', marginBottom: '8px' }}>
              Algo salió mal
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
              Ocurrió un error inesperado en la aplicación. Intenta recargar la página.
            </p>
            {this.state.error && (
              <details style={{ marginBottom: '20px', textAlign: 'left' }}>
                <summary style={{ fontSize: '12px', color: '#9ca3af', cursor: 'pointer' }}>Detalles del error</summary>
                <pre style={{
                  fontSize: '11px', background: '#f3f4f6', borderRadius: '8px',
                  padding: '10px', marginTop: '8px', overflow: 'auto', color: '#374151',
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#0a0a4e', color: 'white', border: 'none',
                borderRadius: '8px', padding: '10px 24px', fontSize: '14px',
                fontWeight: '700', cursor: 'pointer',
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
