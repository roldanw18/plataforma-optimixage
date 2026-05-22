import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Send, Users, UserCheck } from 'lucide-react'
import api from '../../services/api'

export default function BroadcastModal({ open, onClose, onSent }) {
  const { t } = useTranslation()
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [destino, setDestino] = useState('todos')
  const [usuarios, setUsuarios] = useState([])
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // Cargar lista de usuarios cuando el modal se abre y se elige "seleccionados"
  useEffect(() => {
    if (!open) return
    setError('')
    if (destino === 'seleccionados' && usuarios.length === 0) {
      api.get('/usuarios/').then(({ data }) => setUsuarios(data)).catch(() => {})
    }
  }, [open, destino, usuarios.length])

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setTitulo(''); setContenido(''); setDestino('todos')
      setUsuariosSeleccionados([]); setError(''); setSending(false)
    }
  }, [open])

  if (!open) return null

  async function handleEnviar() {
    if (!titulo.trim()) return
    setSending(true)
    setError('')
    try {
      const payload = {
        titulo: titulo.trim(),
        contenido: contenido.trim() || null,
        tipo: 'anuncio',
        usuario_ids: destino === 'seleccionados' ? usuariosSeleccionados : null,
      }
      const { data } = await api.post('/notificaciones/broadcast', payload)
      onSent?.(data.enviadas)
      onClose()
    } catch {
      setError(t('admin.notificaciones.broadcast.error'))
    } finally {
      setSending(false)
    }
  }

  function toggleUsuario(id) {
    setUsuariosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const puedeEnviar =
    titulo.trim().length > 0 &&
    !sending &&
    (destino === 'todos' || usuariosSeleccionados.length > 0)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: '16px',
          width: '100%', maxWidth: '500px', maxHeight: '90vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0a0a4e' }}>
              {t('admin.notificaciones.broadcast.titulo')}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
              {t('admin.notificaciones.broadcast.subtitulo')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            {t('admin.notificaciones.broadcast.labelTitulo')}
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder={t('admin.notificaciones.broadcast.placeholderTitulo')}
            maxLength={200}
            style={{
              width: '100%', padding: '0.6rem 0.85rem',
              border: '1px solid #E5E7EB', borderRadius: '8px',
              fontSize: '0.875rem', marginBottom: '1rem',
            }}
          />

          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            {t('admin.notificaciones.broadcast.labelContenido')}
          </label>
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder={t('admin.notificaciones.broadcast.placeholderContenido')}
            maxLength={2000}
            rows={4}
            style={{
              width: '100%', padding: '0.6rem 0.85rem',
              border: '1px solid #E5E7EB', borderRadius: '8px',
              fontSize: '0.875rem', resize: 'vertical', marginBottom: '1rem',
              fontFamily: 'inherit',
            }}
          />

          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            {t('admin.notificaciones.broadcast.destino')}
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setDestino('todos')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '0.6rem', borderRadius: '8px',
                border: destino === 'todos' ? '2px solid #0099cc' : '1px solid #E5E7EB',
                backgroundColor: destino === 'todos' ? '#e0f5fb' : 'white',
                color: destino === 'todos' ? '#0099cc' : '#374151',
                fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
              }}
            >
              <Users size={14} />
              {t('admin.notificaciones.broadcast.todos')}
            </button>
            <button
              type="button"
              onClick={() => setDestino('seleccionados')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '0.6rem', borderRadius: '8px',
                border: destino === 'seleccionados' ? '2px solid #0099cc' : '1px solid #E5E7EB',
                backgroundColor: destino === 'seleccionados' ? '#e0f5fb' : 'white',
                color: destino === 'seleccionados' ? '#0099cc' : '#374151',
                fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
              }}
            >
              <UserCheck size={14} />
              {t('admin.notificaciones.broadcast.seleccionados')}
            </button>
          </div>

          {destino === 'seleccionados' && (
            <div style={{
              maxHeight: '180px', overflowY: 'auto',
              border: '1px solid #E5E7EB', borderRadius: '8px',
              padding: '0.5rem',
            }}>
              {usuarios.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', textAlign: 'center', padding: '0.5rem' }}>…</p>
              ) : (
                usuarios.map((u) => (
                  <label
                    key={u.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '0.4rem 0.5rem', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '0.85rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={usuariosSeleccionados.includes(u.id)}
                      onChange={() => toggleUsuario(u.id)}
                    />
                    <span>{u.nombre}</span>
                    <span style={{ color: '#9CA3AF', fontSize: '0.75rem', marginLeft: 'auto' }}>{u.email}</span>
                  </label>
                ))
              )}
            </div>
          )}

          {error && (
            <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.75rem' }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem', borderTop: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'flex-end', gap: '8px',
        }}>
          <button
            onClick={onClose}
            disabled={sending}
            style={{
              padding: '0.55rem 1rem', borderRadius: '8px',
              border: '1px solid #E5E7EB', backgroundColor: 'white',
              fontSize: '0.85rem', color: '#374151', cursor: 'pointer',
            }}
          >
            {t('admin.notificaciones.broadcast.cancelar')}
          </button>
          <button
            onClick={handleEnviar}
            disabled={!puedeEnviar}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: '8px',
              border: 'none', backgroundColor: puedeEnviar ? '#0099cc' : '#cdd0d4',
              color: 'white', fontSize: '0.85rem', fontWeight: 600,
              cursor: puedeEnviar ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Send size={14} />
            {sending
              ? t('admin.notificaciones.broadcast.enviando')
              : t('admin.notificaciones.broadcast.enviar')}
          </button>
        </div>
      </div>
    </div>
  )
}
