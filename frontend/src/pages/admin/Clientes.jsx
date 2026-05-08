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
  const { t } = useTranslation()
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
      {loading ? t('admin.proceso.modal.guardando') : children}
    </button>
  )
}

// ── Card de cliente ───────────────────────────────────────────────────────────

function ClienteCard({ cliente, onNuevoProyecto, onProgramarReunion }) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
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
        backgroundColor: 'white', borderRadius: '16px',
        padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative',
        border: '1px solid #d1d5db', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer', width: '160px', height: '180px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Menú contextual */}
      <div ref={menuRef} style={{ position: 'absolute', top: '12px', right: '12px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#9ca3af', padding: '4px 6px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <AlignJustify size={16} />
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute', top: '32px', right: 0,
            backgroundColor: 'white', borderRadius: '8px',
            border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: '160px', zIndex: 10, overflow: 'hidden',
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onNuevoProyecto(cliente) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#374151',
                background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              {t('admin.clientes.crearProyecto')}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onProgramarReunion(cliente) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#374151',
                background: 'none', border: 'none', cursor: 'pointer',
                borderTop: '1px solid #f3f4f6', fontWeight: '500',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              {t('admin.clientes.programarReunion')}
            </button>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        {cliente.avatar_url ? (
          <img src={resolveAvatarUrl(cliente.avatar_url)} alt={cliente.nombre}
            style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: '100px', height: '100px', backgroundColor: '#e5e7eb', borderRadius: '8px' }} />
        )}
      </div>

      <p style={{
        fontSize: '0.85rem', fontWeight: '500', color: '#4b5563',
        textAlign: 'center', lineHeight: '1.4',
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        width: '100%', paddingInline: '6px',
        margin: '0',
      }}>
        {cliente.nombre || cliente.email}
      </p>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminClientes() {
  const { t } = useTranslation()
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
      setError(t('errors.noSePudieron') + ' clientes')
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

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
          {t('admin.clientes.titulo')}
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2rem', maxWidth: '100%' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ backgroundColor: '#f3f4f6', borderRadius: '16px', border: '1px solid #e5e7eb', width: '160px', height: '180px' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e' }}>
          {t('admin.clientes.titulo')}
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
          <Plus size={16} /> {t('admin.clientes.nuevoCliente')}
        </button>
      </div>

      {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
      {clientes.length === 0 && !error && (
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{t('admin.clientes.noHay')}</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2rem', maxWidth: '100%' }}>
        {clientes.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onNuevoProyecto={(c) => { setClienteSeleccionado(c); setShowNuevoProyecto(true) }}
            onProgramarReunion={(c) => setClienteReuniones(c)}
          />
        ))}
      </div>

      {/* Modal: Nuevo cliente */}
      {showNuevoCliente && (
        <Modal title={t('admin.clientes.modal.titulo')} onClose={() => { setShowNuevoCliente(false); setErrorCliente('') }}>
          <form onSubmit={handleCrearCliente}>
            <Field label={t('admin.clientes.modal.nombre')} value={formCliente.nombre}
              onChange={(v) => setFormCliente((f) => ({ ...f, nombre: v }))}
              placeholder="Ej: Juan Pérez" required />
            <Field label={t('admin.clientes.modal.email')} type="email" value={formCliente.email}
              onChange={(v) => setFormCliente((f) => ({ ...f, email: v }))}
              placeholder="juan@empresa.com" required />
            <Field label={t('admin.clientes.modal.password')} type="password" value={formCliente.password}
              onChange={(v) => setFormCliente((f) => ({ ...f, password: v }))}
              placeholder="Mínimo 8 caracteres" required />
            {errorCliente && (
              <p style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{errorCliente}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => { setShowNuevoCliente(false); setErrorCliente('') }}
                style={{ padding: '0.6rem 1.25rem', background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                {t('buttons.cancelar')}
              </button>
              <PrimaryBtn type="submit" loading={loadingCliente}>{t('admin.clientes.modal.crear')}</PrimaryBtn>
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
                {t('buttons.cancelar')}
              </button>
              <PrimaryBtn type="submit" loading={loadingProyecto}>Crear proyecto</PrimaryBtn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
