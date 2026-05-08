import { useEffect, useRef, useState } from 'react'
import { AlignJustify, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import Modal from '../../components/common/Modal'
import { resolveAvatarUrl } from '../../components/common/AvatarUploader'
import ReunionesClienteModal from '../../components/admin/ReunionesClienteModal'

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%', padding: '0.6rem 0.875rem',
          borderRadius: '8px', border: '1px solid #E5E7EB',
          fontSize: '0.875rem', color: '#374151',
          outline: 'none', backgroundColor: '#F9FAFB',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#0099cc')}
        onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
      />
    </div>
  )
}

function PrimaryBtn({ children, onClick, loading, type = 'button', fullWidth }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '0.6rem 1.5rem',
        backgroundColor: '#0099cc', color: 'white',
        border: 'none', borderRadius: '8px',
        fontWeight: '600', fontSize: '0.875rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        width: fullWidth ? '100%' : undefined,
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#007aa3')}
      onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#0099cc')}
    >
      {loading ? 'Guardando…' : children}
    </button>
  )
}

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

// ── Card de cliente ───────────────────────────────────────────────────────────

function ClienteCard({ cliente, onNuevoProyecto, onProgramarReunion }) {
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
          title="Opciones"
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
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onNuevoProyecto(cliente) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.625rem 1rem', fontSize: '0.8rem', color: '#374151',
                background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: '500', transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Crear proyecto
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onProgramarReunion(cliente) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.625rem 1rem', fontSize: '0.8rem', color: '#374151',
                background: 'none', border: 'none', cursor: 'pointer',
                borderTop: '1px solid #f3f4f6', fontWeight: '500',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Programar reunión
            </button>
          </div>
        )}
      </div>

      {/* Logo / avatar */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', marginTop: '8px',
      }}>
        {cliente.avatar_url ? (
          <img
            src={resolveAvatarUrl(cliente.avatar_url)}
            alt={cliente.nombre}
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

      {/* Nombre */}
      <p style={{
        fontSize: '0.82rem', fontWeight: '500', color: '#4b5563',
        textAlign: 'center', lineHeight: '1.35',
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        width: '100%', paddingInline: '4px',
        margin: '0 0 2px',
        flexShrink: 0,
      }}>
        {cliente.nombre || cliente.email}
      </p>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal: nuevo cliente
  const [showNuevoCliente, setShowNuevoCliente] = useState(false)
  const [formCliente, setFormCliente] = useState({ nombre: '', email: '', password: '' })
  const [loadingCliente, setLoadingCliente] = useState(false)
  const [errorCliente, setErrorCliente] = useState('')

  // Modal: nuevo proyecto
  const [showNuevoProyecto, setShowNuevoProyecto] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [formProyecto, setFormProyecto] = useState({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '' })
  const [loadingProyecto, setLoadingProyecto] = useState(false)
  const [errorProyecto, setErrorProyecto] = useState('')

  // Modal: reuniones del cliente
  const [clienteReuniones, setClienteReuniones] = useState(null)

  async function fetchClientes() {
    try {
      const { data } = await api.get('/usuarios/')
      const filtered = data.filter((u) => u.rol?.nombre?.toLowerCase() === 'cliente')
      setClientes(filtered)
    } catch {
      setError('No se pudieron cargar los clientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClientes() }, [])

  async function handleCrearCliente(e) {
    e.preventDefault()
    setErrorCliente('')
    if (!formCliente.nombre || !formCliente.email || !formCliente.password) {
      setErrorCliente('Todos los campos son requeridos.')
      return
    }
    setLoadingCliente(true)
    try {
      await api.post('/auth/register', formCliente)
      setShowNuevoCliente(false)
      setFormCliente({ nombre: '', email: '', password: '' })
      await fetchClientes()
    } catch (err) {
      setErrorCliente(err?.response?.data?.detail || 'Error al crear el cliente.')
    } finally {
      setLoadingCliente(false)
    }
  }

  async function handleCrearProyecto(e) {
    e.preventDefault()
    setErrorProyecto('')
    if (!formProyecto.nombre) {
      setErrorProyecto('El nombre del proyecto es requerido.')
      return
    }
    setLoadingProyecto(true)
    try {
      const payload = {
        nombre: formProyecto.nombre,
        descripcion: formProyecto.descripcion || null,
        fecha_inicio: formProyecto.fecha_inicio || null,
        fecha_fin: formProyecto.fecha_fin || null,
      }
      const { data: proyecto } = await api.post('/proyectos/', payload)
      await api.put(`/proyectos/${proyecto.id}/asignar-cliente`, { cliente_id: clienteSeleccionado.id })
      setShowNuevoProyecto(false)
      setFormProyecto({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '' })
      setClienteSeleccionado(null)
    } catch (err) {
      setErrorProyecto(err?.response?.data?.detail || 'Error al crear el proyecto.')
    } finally {
      setLoadingProyecto(false)
    }
  }

  return (
    <div style={{ padding: '2rem 2.5rem', minHeight: '100%' }}>
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0a0a4e', margin: 0 }}>
          Nuestros clientes
        </h1>
        <button
          onClick={() => setShowNuevoCliente(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '0.5rem 1.25rem', backgroundColor: '#0099cc', color: 'white',
            border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem',
            cursor: 'pointer', transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#007aa3')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0099cc')}
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '2rem',
      }}>
        {loading
          ? [1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)
          : clientes.length === 0 && !error
            ? <p style={{ color: '#9CA3AF', fontSize: '0.875rem', gridColumn: '1/-1' }}>No hay clientes registrados.</p>
            : clientes.map((cliente) => (
                <ClienteCard
                  key={cliente.id}
                  cliente={cliente}
                  onNuevoProyecto={(c) => { setClienteSeleccionado(c); setShowNuevoProyecto(true) }}
                  onProgramarReunion={(c) => setClienteReuniones(c)}
                />
              ))
        }
      </div>

      {/* Modal: Nuevo cliente */}
      {showNuevoCliente && (
        <Modal title="Nuevo cliente" onClose={() => { setShowNuevoCliente(false); setErrorCliente('') }}>
          <form onSubmit={handleCrearCliente}>
            <Field label="Nombre completo" value={formCliente.nombre}
              onChange={(v) => setFormCliente((f) => ({ ...f, nombre: v }))}
              placeholder="Ej: Juan Pérez" required />
            <Field label="Correo electrónico" type="email" value={formCliente.email}
              onChange={(v) => setFormCliente((f) => ({ ...f, email: v }))}
              placeholder="juan@empresa.com" required />
            <Field label="Contraseña inicial" type="password" value={formCliente.password}
              onChange={(v) => setFormCliente((f) => ({ ...f, password: v }))}
              placeholder="Mínimo 8 caracteres" required />
            {errorCliente && (
              <p style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{errorCliente}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => { setShowNuevoCliente(false); setErrorCliente('') }}
                style={{ padding: '0.6rem 1.25rem', background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                Cancelar
              </button>
              <PrimaryBtn type="submit" loading={loadingCliente}>Crear cliente</PrimaryBtn>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Reuniones del cliente */}
      {clienteReuniones && (
        <ReunionesClienteModal
          cliente={clienteReuniones}
          onClose={() => setClienteReuniones(null)}
        />
      )}

      {/* Modal: Nuevo proyecto */}
      {showNuevoProyecto && clienteSeleccionado && (
        <Modal
          title={`Nuevo proyecto para ${clienteSeleccionado.nombre}`}
          onClose={() => { setShowNuevoProyecto(false); setErrorProyecto('') }}
        >
          <form onSubmit={handleCrearProyecto}>
            <Field label="Nombre del proyecto" value={formProyecto.nombre}
              onChange={(v) => setFormProyecto((f) => ({ ...f, nombre: v }))}
              placeholder="Ej: Digitalización Pyme 2025" required />
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Descripción
              </label>
              <textarea
                value={formProyecto.descripcion}
                onChange={(e) => setFormProyecto((f) => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción del proyecto (opcional)"
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Fecha inicio" type="date" value={formProyecto.fecha_inicio}
                onChange={(v) => setFormProyecto((f) => ({ ...f, fecha_inicio: v }))} />
              <Field label="Fecha fin" type="date" value={formProyecto.fecha_fin}
                onChange={(v) => setFormProyecto((f) => ({ ...f, fecha_fin: v }))} />
            </div>
            {errorProyecto && (
              <p style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{errorProyecto}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => { setShowNuevoProyecto(false); setErrorProyecto('') }}
                style={{ padding: '0.6rem 1.25rem', background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                Cancelar
              </button>
              <PrimaryBtn type="submit" loading={loadingProyecto}>Crear proyecto</PrimaryBtn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
