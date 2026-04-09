import { useEffect, useRef, useState } from 'react'
import { AlignJustify, X } from 'lucide-react'
import api from '../../services/api'

const ETAPA_LABELS = {
  primer_contacto: 'Primer contacto',
  diagnostico: 'Diagnóstico',
  capacitacion: 'Capacitación',
  desarrollo: 'Desarrollo',
  entrega: 'Entrega',
}

const ETAPAS_ORDER = ['primer_contacto', 'diagnostico', 'capacitacion', 'desarrollo', 'entrega']

// ── Componentes base ──────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        width: '100%', maxWidth: '420px',
        padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0a0a4e' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Card de proyecto/cliente ──────────────────────────────────────────────────

function ProyectoCard({ proyecto, onCambiarEtapa }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const nombre = proyecto.cliente?.nombre || proyecto.nombre
  const avatarUrl = proyecto.cliente?.avatar_url || null

  return (
    <div
      style={{
        backgroundColor: 'white', borderRadius: '16px',
        padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column',
        alignItems: 'center', position: 'relative',
        border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        cursor: 'pointer', width: '120px', minHeight: '110px',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)')}
    >
      <div ref={menuRef} style={{ position: 'absolute', top: '8px', right: '8px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px' }}
        >
          <AlignJustify size={13} />
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute', top: '20px', right: 0,
            backgroundColor: 'white', borderRadius: '8px',
            border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: '150px', zIndex: 10, overflow: 'hidden',
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onCambiarEtapa(proyecto) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#374151',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#F3F4F6')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              Cambiar etapa
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={nombre}
            style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px' }} />
        ) : (
          <div style={{ width: '56px', height: '56px', backgroundColor: '#E5E7EB', borderRadius: '8px' }} />
        )}
      </div>

      <p style={{
        fontSize: '0.75rem', fontWeight: '600', color: '#1a1a4e',
        textAlign: 'center', lineHeight: '1.3',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        width: '100%', paddingInline: '4px',
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

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        {[1, 2].map((i) => (
          <div key={i} style={{
            backgroundColor: 'white', borderRadius: '12px',
            height: '120px', border: '1px solid #f3f4f6', marginBottom: '1.5rem',
          }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && <p style={{ color: '#EF4444', fontSize: '0.875rem' }}>{error}</p>}

      {Object.keys(grouped).length === 0 && !error && (
        <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
          No hay proyectos activos. Creá un proyecto desde la sección Clientes.
        </p>
      )}

      {Object.entries(grouped).map(([etapaKey, items]) => (
        <section key={etapaKey}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1rem' }}>
            {ETAPA_LABELS[etapaKey]}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
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
