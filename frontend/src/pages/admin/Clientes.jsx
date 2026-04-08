import { useEffect, useState } from 'react'
import { AlignJustify } from 'lucide-react'
import api from '../../services/api'

function ClienteCard({ cliente }) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        minHeight: '120px',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)')}
    >
      {/* Menu icon */}
      <button
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#9CA3AF',
          padding: '2px',
        }}
      >
        <AlignJustify size={14} />
      </button>

      {/* Logo / avatar */}
      <div style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
        {cliente.avatar_url ? (
          <img
            src={cliente.avatar_url}
            alt={cliente.nombre || cliente.email}
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        ) : (
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#E5E7EB',
              borderRadius: '8px',
            }}
          />
        )}
      </div>

      {/* Name */}
      <p
        style={{
          fontSize: '0.8rem',
          fontWeight: '600',
          color: '#1a1a4e',
          textAlign: 'center',
          lineHeight: '1.3',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          paddingInline: '4px',
        }}
      >
        {cliente.nombre || cliente.empresa || cliente.email}
      </p>
    </div>
  )
}

export default function AdminClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get('/usuarios/')
        const filtered = data.filter(
          (u) => u.rol && (u.rol.nombre === 'Cliente' || u.rol.nombre === 'cliente')
        )
        setClientes(filtered.length > 0 ? filtered : data)
      } catch (e) {
        setError('No se pudieron cargar los clientes.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
          Nuestros clientes
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #f3f4f6',
                height: '120px',
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
        Nuestros clientes
      </h1>

      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
      )}

      {clientes.length === 0 && !error && (
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No hay clientes registrados.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
        }}
      >
        {clientes.map((cliente) => (
          <ClienteCard key={cliente.id} cliente={cliente} />
        ))}
      </div>
    </div>
  )
}
