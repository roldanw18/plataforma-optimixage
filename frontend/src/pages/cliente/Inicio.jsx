import { useEffect, useState } from 'react'
import { Play, FileText, Calendar, CheckCircle, Clock, Circle } from 'lucide-react'
import api from '../../services/api'

const ETAPAS = [
  { key: 'primer_contacto', label: 'Primer Contacto' },
  { key: 'diagnostico',     label: 'Diagnóstico' },
  { key: 'capacitacion',    label: 'Capacitación' },
  { key: 'desarrollo',      label: 'Desarrollo' },
  { key: 'entrega',         label: 'Entrega' },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function EtapaIcon({ estado }) {
  if (estado === 'completado') return <CheckCircle size={16} color="#16a34a" />
  if (estado === 'activo')     return <Clock size={16} color="#0099cc" />
  return <Circle size={16} color="#d1d5db" />
}

const VIDEOS_PLACEHOLDER = [
  { id: 1, title: 'Introducción al proceso' },
  { id: 2, title: 'Diagnóstico empresarial' },
  { id: 3, title: 'Herramientas digitales' },
]

function DocIcon() {
  return (
    <div style={{
      width: '48px', height: '60px',
      background: 'linear-gradient(180deg, #4A9BD9 0%, #2E7AB8 100%)',
      borderRadius: '6px', clipPath: 'polygon(0 0, 72% 0, 100% 28%, 100% 100%, 0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ color: 'white', fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em' }}>DOC</span>
    </div>
  )
}

export default function Inicio() {
  const [documentos, setDocumentos]   = useState([])
  const [reuniones, setReuniones]     = useState([])
  const [proceso, setProceso]         = useState(null)
  const [historial, setHistorial]     = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos?.length) return
        const pid = proyectos[0].id

        const [docsRes, reunRes, procesoRes, histRes] = await Promise.allSettled([
          api.get(`/documentos/proyecto/${pid}`),
          api.get(`/reuniones/proyecto/${pid}`),
          api.get(`/proceso/${pid}`),
          api.get(`/proceso/${pid}/historial`),
        ])

        if (docsRes.status === 'fulfilled')    setDocumentos(docsRes.value.data.slice(0, 5))
        if (reunRes.status === 'fulfilled')    setReuniones(reunRes.value.data)
        if (procesoRes.status === 'fulfilled') setProceso(procesoRes.value.data)
        if (histRes.status === 'fulfilled')    setHistorial(histRes.value.data || [])
      } catch { /* silently handle */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const proximaReunion = reuniones.find(r => new Date(r.fecha) >= new Date()) || reuniones[0]
  const etapaActual    = proceso?.etapa_actual || ''
  const progreso       = proceso?.progreso || 0
  const etapaIdx       = ETAPAS.findIndex(e => e.key === etapaActual)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── SECTION 1: Documentos recientes ───────────────── */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1rem' }}>
          Documentos
        </h2>
        {documentos.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Sin documentos disponibles.</p>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {documentos.map(doc => (
              <div key={doc.id} style={{
                backgroundColor: 'white', borderRadius: '12px', padding: '1rem',
                width: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer',
              }}>
                <div style={{ marginBottom: '0.75rem', marginTop: '0.5rem' }}>
                  <DocIcon />
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#374151', textAlign: 'center' }}>
                  {doc.titulo}
                </p>
                {doc.fecha_creacion && (
                  <p style={{ fontSize: '10px', color: '#d1d5db', marginTop: '4px' }}>
                    {formatDate(doc.fecha_creacion)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SECTION 2: Proceso + Próxima reunión ──────────── */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1rem' }}>
          Proceso
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Progress card */}
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem',
            minWidth: '280px', flex: '1', border: '1px solid #f3f4f6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ fontWeight: '700', color: '#0a0a4e', marginBottom: '4px', fontSize: '0.9rem' }}>
              Avance de digitalización
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {etapaActual
                ? `Etapa actual: ${ETAPAS.find(e => e.key === etapaActual)?.label || etapaActual}`
                : 'Proceso no iniciado'}
            </p>

            {/* Barra de progreso */}
            <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '8px', marginBottom: '8px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '999px', background: '#0099cc',
                width: `${progreso}%`, transition: 'width .5s',
              }} />
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'right' }}>{progreso}% completado</p>

            {/* Etapas visuales */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ETAPAS.map((etapa, i) => {
                const estado = i < etapaIdx ? 'completado' : i === etapaIdx ? 'activo' : 'pendiente'
                return (
                  <div key={etapa.key} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '6px 10px', borderRadius: '8px',
                    background: estado === 'activo' ? '#eff6ff' : 'transparent',
                    border: estado === 'activo' ? '1px solid #bfdbfe' : '1px solid transparent',
                  }}>
                    <EtapaIcon estado={estado} />
                    <span style={{
                      fontSize: '12px', fontWeight: estado === 'activo' ? '700' : '400',
                      color: estado === 'completado' ? '#16a34a' : estado === 'activo' ? '#0099cc' : '#9ca3af',
                    }}>
                      {etapa.label}
                    </span>
                    {estado === 'activo' && (
                      <span style={{
                        marginLeft: 'auto', fontSize: '10px', background: '#dbeafe',
                        color: '#2563eb', borderRadius: '999px', padding: '2px 8px', fontWeight: '700',
                      }}>En progreso</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Próxima reunión */}
          {proximaReunion && (
            <div style={{
              backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem',
              border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              minWidth: '200px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Calendar size={16} color="#0099cc" />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Próxima reunión
                </span>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '3rem', fontWeight: '800', color: '#0a0a4e', lineHeight: '1' }}>
                  {new Date(proximaReunion.fecha).getDate()}
                </span>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#0a0a4e' }}>
                  {new Date(proximaReunion.fecha).toLocaleString('es-ES', { month: 'short' }).toUpperCase()}
                </p>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                {proximaReunion.titulo}
              </p>
              {proximaReunion.duracion_minutos && (
                <p style={{ fontSize: '11px', color: '#9ca3af' }}>{proximaReunion.duracion_minutos} min</p>
              )}
              {proximaReunion.enlace && (
                <a href={proximaReunion.enlace} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px',
                    color: '#0099cc', fontWeight: '600', textDecoration: 'none' }}>
                  Unirse →
                </a>
              )}
            </div>
          )}

          {/* Historial de etapas */}
          {historial.length > 0 && (
            <div style={{
              backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem',
              border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              minWidth: '220px', flex: '1',
            }}>
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280',
                textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '12px' }}>
                Historial de etapas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {historial.slice(0, 5).map((h, i) => (
                  <div key={h.id || i} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', position: 'relative' }}>
                    {/* línea vertical */}
                    {i < historial.length - 1 && (
                      <div style={{
                        position: 'absolute', left: '6px', top: '16px', bottom: 0,
                        width: '2px', background: '#f3f4f6',
                      }} />
                    )}
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                      background: h.fecha_fin ? '#16a34a' : '#0099cc',
                      border: '2px solid white', boxShadow: '0 0 0 1px #e5e7eb',
                    }} />
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                        {ETAPAS.find(e => e.key === h.etapa)?.label || h.etapa}
                      </p>
                      <p style={{ fontSize: '10px', color: '#9ca3af' }}>
                        {formatDate(h.fecha_inicio)}
                        {h.fecha_fin ? ` → ${formatDate(h.fecha_fin)}` : ' · En curso'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 3: Contenido ──────────────────────────── */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1rem' }}>
          Contenido
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {VIDEOS_PLACEHOLDER.map((v, idx) => (
            <div key={v.id} style={{
              backgroundColor: idx === 0 ? '#0a0a4e' : '#374151',
              borderRadius: '12px', width: '280px', height: '160px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              gap: '10px',
            }}>
              <button style={{
                width: '56px', height: '56px', borderRadius: '9999px',
                border: '3px solid white', backgroundColor: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Play size={22} color="white" fill="white" style={{ marginLeft: '3px' }} />
              </button>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '12px', textAlign: 'center', padding: '0 16px' }}>
                {v.title}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
