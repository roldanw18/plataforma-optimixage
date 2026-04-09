import { useEffect, useState } from 'react'
import { Play, MoreVertical } from 'lucide-react'
import api from '../../services/api'

function DocIcon() {
  return (
    <div
      style={{
        width: '48px',
        height: '60px',
        background: 'linear-gradient(180deg, #4A9BD9 0%, #2E7AB8 100%)',
        borderRadius: '6px',
        clipPath: 'polygon(0 0, 72% 0, 100% 28%, 100% 100%, 0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ color: 'white', fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em' }}>
        DOC
      </span>
    </div>
  )
}

export default function Inicio() {
  const [documentos, setDocumentos] = useState([])
  const [reuniones, setReuniones] = useState([])
  const [hitos, setHitos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos || proyectos.length === 0) return
        const pid = proyectos[0].id

        const [docsRes, reunRes, procesoRes] = await Promise.allSettled([
          api.get(`/documentos/proyecto/${pid}`),
          api.get(`/reuniones/proyecto/${pid}`),
          api.get(`/proceso/${pid}`),
        ])

        if (docsRes.status === 'fulfilled') setDocumentos(docsRes.value.data.slice(0, 5))
        if (reunRes.status === 'fulfilled') setReuniones(reunRes.value.data)
        if (procesoRes.status === 'fulfilled') setHitos(procesoRes.value.data.etapas || [])
      } catch (e) {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const proximaReunion = reuniones.find((r) => new Date(r.fecha) >= new Date()) || reuniones[0]
  const etapaActual = hitos.find((h) => h.estado === 'activo') || hitos[0]
  const totalHitos = hitos.length || 5
  const hitosCompletados = hitos.filter((h) => h.estado === 'completado').length

  const videosPlaceholder = [
    { id: 1, title: 'Introducción al proceso' },
    { id: 2, title: 'Diagnóstico empresarial' },
    { id: 3, title: 'Herramientas digitales' },
  ]

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* SECTION 1: Documentos */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1rem' }}>
          Documentos
        </h2>
        {documentos.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Sin documentos disponibles.</p>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {documentos.map((doc) => (
              <div
                key={doc.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  width: '130px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <button
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    color: '#9CA3AF',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  <MoreVertical size={14} />
                </button>
                <div style={{ marginBottom: '0.75rem', marginTop: '0.5rem' }}>
                  <DocIcon />
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#374151', textAlign: 'center' }}>
                  {doc.nombre || doc.titulo || 'Documento'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: Proceso */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1rem' }}>
          Proceso
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Progress card */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.25rem',
              width: '280px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ fontWeight: '700', color: '#0a0a4e', marginBottom: '4px', fontSize: '0.9rem' }}>
              Pyme
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Tu empresa está en la{' '}
              {etapaActual ? etapaActual.nombre : '2da etapa'} de digitalización
            </p>
            {/* Progress bars as segments */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: totalHitos }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: '8px',
                    flex: 1,
                    borderRadius: '9999px',
                    backgroundColor: i < hitosCompletados + (etapaActual ? 1 : 0)
                      ? '#0099cc'
                      : '#E5E7EB',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Next meeting card */}
          {proximaReunion && (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid #f3f4f6',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '3rem', fontWeight: '700', color: '#0a0a4e', lineHeight: '1' }}>
                  {new Date(proximaReunion.fecha).getDate()}
                </span>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0a0a4e' }}>
                  {new Date(proximaReunion.fecha)
                    .toLocaleString('es-ES', { month: 'short' })
                    .toUpperCase()}
                </p>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>Próxima reunión</p>
                {proximaReunion.hora && (
                  <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>
                    Hora: <strong>{proximaReunion.hora}</strong>
                  </p>
                )}
                {proximaReunion.lugar && (
                  <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>
                    Lugar: {proximaReunion.lugar}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: Contenido */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1rem' }}>
          Contenido
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {videosPlaceholder.map((v, idx) => (
            <div
              key={v.id}
              style={{
                backgroundColor: idx === 0 ? '#0a0a4e' : '#374151',
                borderRadius: '12px',
                width: '280px',
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <button
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '9999px',
                  border: '3px solid white',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Play size={22} color="white" fill="white" style={{ marginLeft: '3px' }} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
