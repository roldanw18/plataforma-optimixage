import { useEffect, useState } from 'react'
import { User, Search, Clipboard, Users, CheckCircle, MoreHorizontal, Calendar, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { intlLocale } from '../../utils/locale'

const ESTADO_REUNION_STYLES = {
  pendiente:  { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  confirmada: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  cancelada:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  completada: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
}

function fmtDateTime(iso, lng) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(intlLocale(lng), { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const ETAPA_ICONS = {
  primer_contacto: User,
  diagnostico: Search,
  capacitacion: Clipboard,
  desarrollo: Users,
  entrega: CheckCircle,
}

function ReunionesSection({ reuniones, t, lng }) {
  const ahora = new Date()
  const ordenadas = [...reuniones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const futuras = ordenadas.filter(r => new Date(r.fecha) >= ahora)
  const pasadas = ordenadas.filter(r => new Date(r.fecha) <  ahora).reverse()

  if (reuniones.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '0.75rem',
          display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#0099cc" /> {t('cliente.proceso.reuniones')}
        </h3>
        <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '12px' }}>
          {t('cliente.proceso.sinReuniones')}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6',
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '12px',
        display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={16} color="#0099cc" /> {t('cliente.proceso.reuniones')}
        <span style={{ fontWeight: '400', color: '#9ca3af', fontSize: '12px' }}>({reuniones.length})</span>
      </h3>

      {futuras.length > 0 && (
        <>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            {t('cliente.proceso.proximas')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {futuras.map(r => <ReunionItem key={r.id} reunion={r} t={t} lng={lng} />)}
          </div>
        </>
      )}

      {pasadas.length > 0 && (
        <>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            {t('cliente.proceso.anteriores')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pasadas.slice(0, 5).map(r => <ReunionItem key={r.id} reunion={r} pasada t={t} lng={lng} />)}
          </div>
        </>
      )}
    </div>
  )
}

function ReunionItem({ reunion, pasada, t, lng }) {
  const cfg = ESTADO_REUNION_STYLES[reunion.estado] || ESTADO_REUNION_STYLES.pendiente
  const estadoLabel = t(`cliente.proceso.estadoReunion.${reunion.estado}`, { defaultValue: reunion.estado })
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '10px 12px', borderRadius: '8px',
      background: pasada ? '#fafafa' : '#f9fafb',
      border: '1px solid #f3f4f6', opacity: pasada ? 0.75 : 1,
    }}>
      <div style={{
        width: '44px', textAlign: 'center', flexShrink: 0,
        padding: '4px', background: 'white', borderRadius: '6px',
        border: '1px solid #e5e7eb',
      }}>
        <p style={{ fontSize: '16px', fontWeight: '800', color: '#0a0a4e', lineHeight: '1' }}>
          {new Date(reunion.fecha).getDate()}
        </p>
        <p style={{ fontSize: '9px', fontWeight: '700', color: '#6b7280',
          textTransform: 'uppercase', marginTop: '2px' }}>
          {new Date(reunion.fecha).toLocaleString(intlLocale(lng), { month: 'short' })}
        </p>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#0a0a4e' }}>{reunion.titulo}</p>
          <span style={{
            fontSize: '9px', fontWeight: '700', padding: '1px 7px', borderRadius: '999px',
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{estadoLabel}</span>
        </div>
        <p style={{ fontSize: '11px', color: '#6b7280' }}>
          {fmtDateTime(reunion.fecha, lng)}
          {reunion.duracion_minutos && ` · ${reunion.duracion_minutos} ${t('cliente.inicio.minutos')}`}
        </p>
        {reunion.descripcion && (
          <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.4', marginTop: '4px' }}>
            {reunion.descripcion}
          </p>
        )}
        {reunion.enlace && reunion.estado !== 'cancelada' && (
          <a href={reunion.enlace} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '11px', color: '#0099cc', fontWeight: '700',
              display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <Video size={11} /> {t('cliente.proceso.unirseReunion')}
          </a>
        )}
      </div>
    </div>
  )
}

export default function Proceso() {
  const { t, i18n } = useTranslation()
  const lng = i18n.language?.split('-')[0] || 'es'
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
          {t('cliente.proceso.titulo')}
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

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0a0a4e' }}>{t('cliente.proceso.titulo')}</h1>

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
              {t('cliente.proceso.titulo')}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              {t('cliente.proceso.subtitulo')}
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
                      {t(`cliente.etapas.${etapa.key}`, { defaultValue: etapa.label })}
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
            {t('cliente.proceso.historialCambios')}
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
                    {t(`cliente.etapas.${h.etapa}`, { defaultValue: h.etapa_label || h.etapa })}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    {new Date(h.fecha_inicio).toLocaleDateString(intlLocale(lng), {
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

      {/* Reuniones — sección completa */}
      <ReunionesSection reuniones={reuniones} t={t} lng={lng} />

      {/* Bottom cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Próxima reunión card resumida */}
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
            {t('cliente.proceso.proximaReunionTitulo')}
          </h3>

          {proximaReunion ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#4B5563', fontSize: '0.875rem', marginBottom: '4px', fontWeight: '700' }}>
                  {proximaReunion.titulo}
                </p>
                {proximaReunion.fecha && (
                  <p style={{ color: '#4B5563', fontSize: '0.875rem' }}>
                    {t('cliente.proceso.hora')}{' '}
                    <strong>
                      {new Date(proximaReunion.fecha).toLocaleTimeString(intlLocale(lng), {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </strong>
                  </p>
                )}
                <p style={{ color: '#0a0a4e', fontWeight: '700', marginTop: '1rem', fontSize: '0.875rem' }}>
                  {t('cliente.proceso.recordar')}
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{t('cliente.proceso.llegarAntes')}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: '300', color: '#0a0a4e', lineHeight: '1' }}>
                  {new Date(proximaReunion.fecha).getDate()}
                </span>
                <p style={{ fontSize: '1.25rem', fontWeight: '300', color: '#0a0a4e' }}>
                  {new Date(proximaReunion.fecha)
                    .toLocaleString(intlLocale(lng), { month: 'short' })
                    .toUpperCase()}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>{t('cliente.proceso.sinProximaReunion')}</p>
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
            {t('cliente.proceso.cotizacion')}
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
