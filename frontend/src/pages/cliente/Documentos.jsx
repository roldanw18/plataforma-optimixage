import { useEffect, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import api from '../../services/api'

function DocIcon() {
  return (
    <div
      style={{
        width: '64px',
        height: '80px',
        background: 'linear-gradient(180deg, #4A9BD9 0%, #2E7AB8 100%)',
        borderRadius: '8px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Folded corner */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '16px',
          height: '16px',
          backgroundColor: '#3D8AC7',
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
        }}
      />
      <span style={{ color: 'white', fontWeight: '700', fontSize: '11px', letterSpacing: '0.05em' }}>
        DOC
      </span>
    </div>
  )
}

export default function Documentos() {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos || proyectos.length === 0) {
          setLoading(false)
          return
        }
        const pid = proyectos[0].id
        const { data } = await api.get(`/documentos/proyecto/${pid}`)
        setDocumentos(data)
      } catch (e) {
        setError('No se pudieron cargar los documentos.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
          Documentos
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                padding: '1rem',
                height: '80px',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
        Documentos
      </h1>

      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
      )}

      {documentos.length === 0 && !error && (
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No hay documentos disponibles.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {documentos.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
            }}
          >
            <DocIcon />

            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '0.5rem' }}>
                {doc.nombre || doc.titulo || 'Documento'}
              </h3>
              {doc.descripcion && (
                <p style={{ color: '#9CA3AF', fontSize: '0.8rem', lineHeight: '1.6' }}>
                  {doc.descripcion}
                </p>
              )}
            </div>

            <button
              style={{
                color: '#9CA3AF',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                padding: '4px',
              }}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
