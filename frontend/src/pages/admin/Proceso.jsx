import { useEffect, useRef, useState } from 'react'
import { AlignJustify } from 'lucide-react'
import api from '../../services/api'
import Modal from '../../components/common/Modal'
import { resolveAvatarUrl } from '../../components/common/AvatarUploader'

const ETAPA_LABELS = {
  primer_contacto: 'Primer contacto',
  diagnostico: 'Diagnóstico',
  capacitacion: 'Capacitación',
  desarrollo: 'Desarrollo',
  entrega: 'Entrega',
}

const ETAPAS_ORDER = ['primer_contacto', 'diagnostico', 'capacitacion', 'desarrollo', 'entrega']

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '16px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      width: '100%', height: '215px',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }} />
    </div>
  )
}

// ── Card de proyecto ──────────────────────────────────────────────────────────

function ProyectoCard({ proyecto, onCambiarEtapa }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const nombre = proyecto.nombre
  const avatarUrl = proyecto.cliente?.avatar_url || null

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.25rem 1rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        border: '1px solid #e9ecef',
        boxShadow: hovered
          ? '0 8px 24px rgba(0,0,0,0.11)'
          : '0 2px 8px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        width: '100%',
        height: '215px',
        transition: 'box-shadow 0.22s ease, transform 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxSizing: 'border-box',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Menú contextual */}
      <div ref={menuRef} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
          style={{
            background: menuOpen ? '#f3f4f6' : 'transparent',
            border: 'none', cursor: 'pointer',
            color: '#9ca3af', padding: '3px 5px', borderRadius: '5px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = menuOpen ? '#f3f4f6' : 'transparent'; e.currentTarget.style.color = '#9ca3af' }}
        >
          <AlignJustify size={15} strokeWidth={1.8} />
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute', top: '30px', right: 0,
            backgroundColor: 'white', borderRadius: '10px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
            minWidth: '168px', zIndex: 20, overflow: 'hidden',
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onCambiarEtapa(proyecto) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.625rem 1rem', fontSize: '0.8rem', color: '#374151',
                background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: '500', transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Cambiar etapa
            </button>
          </div>
        )}
      </div>

      {/* Logo / avatar del cliente */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', marginTop: '8px',
      }}>
        {avatarUrl ? (
          <img
            src={resolveAvatarUrl(avatarUrl)}
            alt={nombre}
            style={{ maxWidth: '130px', maxHeight: '108px', objectFit: 'contain' }}
          />
        ) : (
          <div style={{
            width: '92px', height: '110px',
            backgroundColor: '#d1d5db',
            borderRadius: '6px',
          }} />
        )}
      </div>

      {/* Nombre del proyecto */}
      <p style={{
        fontSize: '0.82rem', fontWeight: '500', color: '#4b5563',
        textAlign: 'center', lineHeight: '1.35',
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        width: '100%', paddingInline: '4px',
        margin: '0 0 2px',
        flexShrink: 0,
      }}>
        {nombre}
      </p>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminProceso() {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal cambiar etapa
  const [modalProyecto, setModalProyecto] = useState(null)
  const [etapaSeleccionada, setEtapaSeleccionada] = useState('')
  const [notas, setNotas] = useState('')
  const [loadingEtapa, setLoadingEtapa] = useState(false)
  const [errorEtapa, setErrorEtapa] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function fetchProyectos() {
    try {
      const { data } = await api.get('/proyectos/admin/todos')
      setProyectos(data)
    } catch {
      setError('No se pudieron cargar los proyectos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProyectos() }, [])

  function abrirModal(proyecto) {
    setModalProyecto(proyecto)
    setEtapaSeleccionada(proyecto.etapa_actual)
    setNotas('')
    setErrorEtapa('')
    setSuccessMsg('')
  }

  function cerrarModal() {
    setModalProyecto(null)
    setEtapaSeleccionada('')
    setNotas('')
    setErrorEtapa('')
  }

  async function handleCambiarEtapa(e) {
    e.preventDefault()
    if (!etapaSeleccionada) { setErrorEtapa('Seleccioná una etapa.'); return }
    if (etapaSeleccionada === modalProyecto.etapa_actual) {
      setErrorEtapa('La etapa seleccionada es la misma que la actual.')
      return
    }
    setLoadingEtapa(true)
    setErrorEtapa('')
    try {
      await api.post(`/proceso/${modalProyecto.id}/cambiar-etapa`, {
        etapa: etapaSeleccionada,
        notas: notas || null,
      })
      setSuccessMsg(`Etapa actualizada a "${ETAPA_LABELS[etapaSeleccionada]}"`)
      await fetchProyectos()
      setTimeout(cerrarModal, 1200)
    } catch (err) {
      setErrorEtapa(err?.response?.data?.detail || 'Error al cambiar la etapa.')
    } finally {
      setLoadingEtapa(false)
    }
  }

  // Agrupar proyectos por etapa
  const grouped = ETAPAS_ORDER.reduce((acc, key) => {
    const items = proyectos.filter((p) => p.etapa_actual === key)
    if (items.length > 0) acc[key] = items
    return acc
  }, {})

  return (
    <div style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {error && <p style={{ color: '#EF4444', fontSize: '0.875rem' }}>{error}</p>}

      {loading && (
        <section>
          <div style={{ height: '1.5rem', width: '120px', backgroundColor: '#e5e7eb', borderRadius: '6px', marginBottom: '1rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2rem' }}>
            {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
          </div>
        </section>
      )}

      {!loading && Object.keys(grouped).length === 0 && !error && (
        <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
          No hay proyectos activos. Creá un proyecto desde la sección Clientes.
        </p>
      )}

      {!loading && Object.entries(grouped).map(([etapaKey, items]) => (
        <section key={etapaKey}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.25rem', margin: '0 0 1.25rem' }}>
            {ETAPA_LABELS[etapaKey]}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2rem' }}>
            {items.map((proyecto) => (
              <ProyectoCard
                key={proyecto.id}
                proyecto={proyecto}
                onCambiarEtapa={abrirModal}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Modal: Cambiar etapa */}
      {modalProyecto && (
        <Modal
          title={`Cambiar etapa — ${modalProyecto.cliente?.nombre || modalProyecto.nombre}`}
          onClose={cerrarModal}
          maxWidth="420px"
        >
          <form onSubmit={handleCambiarEtapa}>
            {/* Etapa actual */}
            <div style={{ marginBottom: '1rem', padding: '0.6rem 0.875rem', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '2px' }}>Etapa actual</p>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0a0a4e' }}>
                {ETAPA_LABELS[modalProyecto.etapa_actual]}
              </p>
            </div>

            {/* Selector nueva etapa */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Nueva etapa <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ETAPAS_ORDER.map((key) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '0.6rem 0.875rem', borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid ${etapaSeleccionada === key ? '#0099cc' : '#E5E7EB'}`,
                      backgroundColor: etapaSeleccionada === key ? '#e8f7fc' : 'white',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="etapa"
                      value={key}
                      checked={etapaSeleccionada === key}
                      onChange={() => setEtapaSeleccionada(key)}
                      style={{ accentColor: '#0099cc' }}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: etapaSeleccionada === key ? '600' : '400' }}>
                      {ETAPA_LABELS[key]}
                    </span>
                    {modalProyecto.etapa_actual === key && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#9CA3AF' }}>actual</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Notas (opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Se completó el diagnóstico inicial…"
                rows={3}
                style={{
                  width: '100%', padding: '0.6rem 0.875rem',
                  borderRadius: '8px', border: '1px solid #E5E7EB',
                  fontSize: '0.875rem', color: '#374151',
                  outline: 'none', backgroundColor: '#F9FAFB',
                  resize: 'vertical', boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0099cc')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            {errorEtapa && (
              <p style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{errorEtapa}</p>
            )}
            {successMsg && (
              <p style={{ color: '#10B981', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{successMsg}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button" onClick={cerrarModal}
                style={{
                  padding: '0.6rem 1.25rem', background: 'none',
                  border: '1px solid #E5E7EB', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '0.875rem', color: '#374151',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loadingEtapa}
                style={{
                  padding: '0.6rem 1.5rem', backgroundColor: '#0099cc', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem',
                  cursor: loadingEtapa ? 'not-allowed' : 'pointer',
                  opacity: loadingEtapa ? 0.6 : 1,
                }}
              >
                {loadingEtapa ? 'Guardando…' : 'Confirmar cambio'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
