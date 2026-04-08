import { useEffect, useState } from 'react'
import { AlignJustify } from 'lucide-react'
import api from '../../services/api'

function ClienteCard({ nombre, avatarUrl }) {
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
        width: '120px',
        minHeight: '110px',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)')}
    >
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
        <AlignJustify size={13} />
      </button>

      <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={nombre}
            style={{
              width: '56px',
              height: '56px',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        ) : (
          <div
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#E5E7EB',
              borderRadius: '8px',
            }}
          />
        )}
      </div>

      <p
        style={{
          fontSize: '0.75rem',
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
        {nombre}
      </p>
    </div>
  )
}

const ETAPAS = ['Primer contacto', 'Diagnóstico', 'Capacitación', 'Desarrollo', 'Entrega']

export default function AdminProceso() {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get('/proyectos/mis-proyectos')
        const proyectosConHitos = await Promise.all(
          data.map(async (p) => {
            try {
              const { data: hitos } = await api.get(`/hitos/proyecto/${p.id}`)
              const etapaActual = hitos.find((h) => h.estado === 'en_progreso') || hitos[hitos.length - 1]
              return { ...p, etapaActual: etapaActual?.nombre || 'Diagnóstico' }
            } catch {
              return { ...p, etapaActual: 'Diagnóstico' }
            }
          })
        )
        setProyectos(proyectosConHitos)
      } catch (e) {
        setError('No se pudieron cargar los proyectos.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const grouped = ETAPAS.reduce((acc, etapa) => {
    const filtered = proyectos.filter((p) => {
      const ea = (p.etapaActual || '').toLowerCase()
      return ea.includes(etapa.toLowerCase().split(' ')[0])
    })
    if (filtered.length > 0) acc[etapa] = filtered
    return acc
  }, {})

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            height: '160px',
            border: '1px solid #f3f4f6',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.875rem' }}>{error}</p>
      )}

      {Object.keys(grouped).length === 0 && !error && (
        <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>No hay proyectos en proceso.</p>
      )}

      {Object.entries(grouped).map(([etapa, items]) => (
        <section key={etapa}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#0a0a4e',
              marginBottom: '1rem',
            }}
          >
            {etapa}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {items.map((proyecto) => (
              <ClienteCard
                key={proyecto.id}
                nombre={proyecto.nombre || proyecto.cliente?.nombre || 'Proyecto'}
                avatarUrl={proyecto.cliente?.avatar_url}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
