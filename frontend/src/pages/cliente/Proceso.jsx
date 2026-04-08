import { useEffect, useState } from 'react'
import { User, Search, Clipboard, Users, CheckCircle, Clock, MoreHorizontal } from 'lucide-react'
import api from '../../services/api'

const ETAPA_ICONS = {
  primer_contacto: User,
  diagnostico: Search,
  capacitacion: Clipboard,
  desarrollo: Users,
  entrega: CheckCircle,
}

export default function Proceso() {
  const [proceso, setProceso] = useState(null)
  const [reuniones, setReuniones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos || proyectos.length === 0) return
        const pid = proyectos[0].id

        const [procesoRes, reunRes] = await Promise.allSettled([
          api.get(`/proceso/${pid}`),
          api.get(`/reuniones/proyecto/${pid}`),
        ])

        if (procesoRes.status === 'fulfilled') setProceso(procesoRes.value.data)
        if (reunRes.status === 'fulfilled') setReuniones(reunRes.value.data)
      } catch (e) {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const proximaReunion = reuniones.find((r) => new Date(r.fecha) >= new Date()) || reuniones[0]

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
          Proceso
        </h1>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            height: '200px',
            border: '1px solid #f3f4f6',
          }}
        />
      </div>
    )
  }

  const etapas = proceso?.etapas || []
  const progreso = proceso?.progreso || 20
  const etapaLabel = proceso?.etapa_label || 'Primer contacto'

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0a0a4e' }}>Proceso</h1>

      {/* Main process card */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #f3f4f6',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '4px' }}>
              Proceso
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Tu empresa está en la 2da etapa de digitalización.
            </p>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
            <MoreHorizontal size={22} />
          </button>
        </div>

        {/* Timeline stepper */}
        <div style={{ marginTop: '2.5rem', paddingBottom: '0.5rem' }}>
          <div style={{ position: 'relative' }}>
            {/* Background track */}
            <div
              style={{
                position: 'absolute',
                top: '5px',
                left: 0,
                right: 0,
                height: '12px',
                backgroundColor: '#E5E7EB',
                borderRadius: '9999px',
                zIndex: 0,
              }}
            />
            {/* Progress fill */}
            <div
              style={{
                position: 'absolute',
                top: '5px',
                left: 0,
                height: '12px',
                backgroundColor: '#0099cc',
                borderRadius: '9999px',
                zIndex: 0,
                width: `${progreso}%`,
                transition: 'width 0.5s ease',
              }}
            />

            {/* Etapa dots */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                zIndex: 1,
              }}
            >
              {etapas.map((etapa) => {
                const Icon = ETAPA_ICONS[etapa.key] || CheckCircle
                const isCompleted = etapa.estado === 'completado'
                const isCurrent = etapa.estado === 'activo'
                const isActive = isCompleted || isCurrent

                return (
                  <div
                    key={etapa.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {/* Dot on the line */}
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '9999px',
                        border: `2px solid ${isActive ? '#0099cc' : '#D1D5DB'}`,
                        backgroundColor: isActive ? '#0099cc' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isCompleted && <CheckCircle size={12} color="white" />}
                      {isCurrent && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: 'white' }} />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: isActive ? '#374151' : '#9CA3AF',
                        fontWeight: isActive ? '500' : '400',
                        textAlign: 'center',
                        maxWidth: '64px',
                        lineHeight: '1.3',
                      }}
                    >
                      {etapa.label}
                    </span>

                    {/* Icon */}
                    <Icon size={16} color={isActive ? '#6B7280' : '#D1D5DB'} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      {proceso?.historial?.length > 0 && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #f3f4f6',
          }}
        >
          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            Historial de cambios
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {proceso.historial.slice(0, 5).map((h) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: '#0099cc',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    {h.etapa_label || h.etapa}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    {new Date(h.fecha_inicio).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                    {h.notas && ` — ${h.notas}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Reuniones */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #f3f4f6',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1rem' }}>
            Reuniones
          </h3>

          {proximaReunion ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#4B5563', fontSize: '0.875rem', marginBottom: '4px' }}>
                  Próxima reunión
                </p>
                {proximaReunion.fecha && (
                  <p style={{ color: '#4B5563', fontSize: '0.875rem' }}>
                    Hora:{' '}
                    <strong>
                      {new Date(proximaReunion.fecha).toLocaleTimeString('es-ES', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </strong>
                  </p>
                )}
                {proximaReunion.lugar && (
                  <p style={{ color: '#4B5563', fontSize: '0.875rem' }}>
                    Lugar: <strong>{proximaReunion.lugar}</strong>
                  </p>
                )}
                <p style={{ color: '#0a0a4e', fontWeight: '700', marginTop: '1rem', fontSize: '0.875rem' }}>
                  Recordar
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Llegar 15 min antes.</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: '300', color: '#0a0a4e', lineHeight: '1' }}>
                  {new Date(proximaReunion.fecha).getDate()}
                </span>
                <p style={{ fontSize: '1.25rem', fontWeight: '300', color: '#0a0a4e' }}>
                  {new Date(proximaReunion.fecha)
                    .toLocaleString('es-ES', { month: 'short' })
                    .toUpperCase()}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Sin reuniones próximas.</p>
          )}
        </div>

        {/* Cotización */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #f3f4f6',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1rem' }}>
            Cotización
          </h3>

          {/* Bar chart visualization */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '1rem',
              height: '140px',
              paddingBottom: '4px',
            }}
          >
            {[80, 112, 96].map((h, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '48px',
                    height: `${h}px`,
                    border: '2px solid #4ADE80',
                    borderRadius: '4px',
                    backgroundColor: '#F0FDF4',
                  }}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#4ADE80',
              borderRadius: '9999px',
              marginTop: '4px',
            }}
          />
        </div>
      </div>
    </div>
  )
}
