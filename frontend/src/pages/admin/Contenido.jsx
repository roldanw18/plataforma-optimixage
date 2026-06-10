import { useEffect, useRef, useState } from 'react'
import {
  Play, Image as ImageIcon, Upload, Trash2, Edit3, X,
  CheckCircle, AlertCircle, Eye, Video as VideoIcon, Search, Globe, User,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

function Alert({ type, message, onClose }) {
  if (!message) return null
  const isError = type === 'error'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
      background: isError ? '#fef2f2' : '#f0fdf4',
      border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
      color: isError ? '#dc2626' : '#16a34a',
      marginBottom: '16px',
    }}>
      {isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
        <X size={14} />
      </button>
    </div>
  )
}

function resolveUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `/api${url}`
}

function DestinatarioPicker({ proyectos, value, onChange, t }) {
  // value = '' (global) o un cliente_id (UUID)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef(null)

  // Construir lista de opciones: una entrada por proyecto con cliente
  const opciones = proyectos
    .filter(p => p.cliente)
    .map(p => ({
      cliente_id: p.cliente.id,
      label: `${p.nombre} — ${p.cliente.nombre}`,
      proyecto: p.nombre,
      cliente: p.cliente.nombre,
      email: p.cliente.email,
    }))

  const filtradas = search.trim()
    ? opciones.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : opciones

  const seleccionada = value
    ? opciones.find(o => o.cliente_id === value)
    : null

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false); setSearch('')
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px',
        fontSize: '13px', background: '#f9fafb', color: '#374151', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
        textAlign: 'left',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flex: 1 }}>
          {value ? <User size={13} color="#d97706" /> : <Globe size={13} color="#16a34a" />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {seleccionada ? seleccionada.label : t('common.todos_clientes_global')}
          </span>
        </span>
        <span style={{ color: '#9ca3af', fontSize: '10px', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden',
          maxHeight: '280px', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', gap: '6px', background: '#fafafa' }}>
            <Search size={13} color="#9ca3af" />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('common.buscar_proyecto_cliente')}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '12px',
                background: 'transparent', color: '#374151' }} />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <button type="button" onClick={() => { onChange(''); setOpen(false); setSearch('') }}
              style={{
                width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none',
                background: !value ? '#eff6ff' : 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px',
                borderBottom: '1px solid #f3f4f6',
              }}>
              <Globe size={13} color="#16a34a" />
              <span style={{ fontWeight: !value ? '700' : '500', color: '#0a0a4e' }}>
                {t('common.todos_clientes_global')}
              </span>
            </button>
            {filtradas.length === 0 && (
              <p style={{ padding: '12px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
                {t('common.sin_resultados')}
              </p>
            )}
            {filtradas.map((o, i) => (
              <button key={`${o.cliente_id}-${i}`} type="button"
                onClick={() => { onChange(o.cliente_id); setOpen(false); setSearch('') }}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none',
                  background: value === o.cliente_id ? '#eff6ff' : 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px',
                  borderBottom: '1px solid #f3f4f6',
                }}>
                <User size={13} color="#d97706" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', color: '#0a0a4e',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.proyecto}
                  </p>
                  <p style={{ fontSize: '10px', color: '#9ca3af',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.cliente}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PreviewModal({ contenido, onClose }) {
  if (!contenido) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: '12px', maxWidth: '900px', width: '100%',
        maxHeight: '90vh', overflow: 'auto', padding: '24px', position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '14px', right: '14px',
          background: '#f3f4f6', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={16} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0a0a4e', marginBottom: '6px' }}>
          {contenido.titulo}
        </h2>
        {contenido.descripcion && (
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{contenido.descripcion}</p>
        )}
        {contenido.tipo === 'imagen' ? (
          <img src={resolveUrl(contenido.url)} alt={contenido.titulo}
            style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh', objectFit: 'contain' }} />
        ) : (
          <video src={resolveUrl(contenido.url)} controls
            style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh' }} />
        )}
      </div>
    </div>
  )
}

function EditModal({ contenido, onClose, onSave, t }) {
  const [titulo, setTitulo] = useState(contenido.titulo)
  const [descripcion, setDescripcion] = useState(contenido.descripcion || '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const { data } = await api.patch(`/contenidos/${contenido.id}`, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
      })
      onSave(data)
    } catch (e) {
      setErr(e.response?.data?.detail || t('admin.contenido.errorGuardar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '24px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0a0a4e', marginBottom: '16px' }}>
          {t('admin.contenido.editarContenido')}
        </h2>
        <Alert type="error" message={err} onClose={() => setErr(null)} />
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>{t('admin.contenido.titulo_label')}</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} required
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f9fafb' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>{t('admin.contenido.descripcionItem')}</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f9fafb', minHeight: '70px', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
              {t('admin.contenido.cancelar')}
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: '8px 16px', background: '#0099cc', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? t('admin.contenido.guardando') : t('admin.contenido.guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminContenido() {
  const { t } = useTranslation()
  const [contenidos, setContenidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [proyectos, setProyectos] = useState([])

  // Form
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState('imagen')
  const [clienteId, setClienteId] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const fileRef = useRef()

  // Modales
  const [previewing, setPreviewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const ACCEPT = tipo === 'imagen'
    ? '.png,.jpg,.jpeg,.gif,.webp,.svg'
    : '.mp4,.webm,.ogg,.mov,.avi,.mkv'

  async function fetchContenidos() {
    setLoading(true)
    try {
      const { data } = await api.get('/contenidos/')
      setContenidos(data)
    } catch {
      setContenidos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContenidos()
    api.get('/proyectos/admin/todos').then(r => setProyectos(r.data || [])).catch(() => {})
  }, [])

  async function handleUpload(e) {
    e.preventDefault()
    if (!archivo) { setErr(t('admin.contenido.errorSinArchivo')); return }
    if (!titulo.trim()) { setErr(t('admin.contenido.errorSinTitulo')); return }
    setErr(null); setMsg(null); setUploading(true)

    const form = new FormData()
    form.append('titulo', titulo.trim())
    form.append('descripcion', descripcion)
    form.append('tipo', tipo)
    form.append('cliente_id', clienteId)
    form.append('archivo', archivo)

    try {
      const { data } = await api.post('/contenidos/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setContenidos(prev => [data, ...prev])
      setMsg(t('admin.contenido.exito', { titulo: data.titulo }))
      setTitulo(''); setDescripcion(''); setClienteId(''); setArchivo(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setErr(e.response?.data?.detail || t('admin.contenido.errorSubir'))
    } finally {
      setUploading(false)
    }
  }

  async function eliminar(c) {
    if (!window.confirm(t('admin.contenido.confirmarEliminar', { titulo: c.titulo }))) return
    setDeleting(c.id)
    try {
      await api.delete(`/contenidos/${c.id}`)
      setContenidos(prev => prev.filter(x => x.id !== c.id))
    } catch {
      alert(t('admin.contenido.errorEliminar'))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0a0a4e', marginBottom: '6px' }}>
        {t('admin.contenido.titulo')}
      </h1>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
        {t('admin.contenido.descripcion')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* UPLOAD FORM */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '20px',
          border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a4e', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={16} color="#0099cc" /> {t('admin.contenido.nuevoContenido')}
          </h2>

          <Alert type="success" message={msg} onClose={() => setMsg(null)} />
          <Alert type="error"   message={err} onClose={() => setErr(null)} />

          <form onSubmit={handleUpload}>
            {/* Tipo */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                {t('admin.contenido.tipoContenido')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { v: 'imagen', label: t('admin.contenido.imagen'), Icon: ImageIcon },
                  { v: 'video',  label: t('admin.contenido.video'),  Icon: VideoIcon },
                ].map(({ v, label, Icon }) => (
                  <button key={v} type="button" onClick={() => { setTipo(v); setArchivo(null); if (fileRef.current) fileRef.current.value = '' }}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer',
                      background: tipo === v ? '#0099cc' : '#fff',
                      color: tipo === v ? '#fff' : '#374151',
                      border: `1px solid ${tipo === v ? '#0099cc' : '#e5e7eb'}`,
                      fontSize: '12px', fontWeight: '600',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Archivo */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>
                {t('admin.contenido.archivo')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${archivo ? '#0099cc' : '#d1d5db'}`,
                  borderRadius: '8px', padding: '16px', textAlign: 'center',
                  cursor: 'pointer', background: archivo ? '#eff6ff' : '#fafafa',
                }}>
                <input ref={fileRef} type="file" style={{ display: 'none' }}
                  accept={ACCEPT}
                  onChange={e => setArchivo(e.target.files[0] || null)} />
                {archivo ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {tipo === 'imagen' ? <ImageIcon size={16} color="#0099cc" /> : <VideoIcon size={16} color="#0099cc" />}
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#0099cc' }}>{archivo.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} color="#9ca3af" style={{ margin: '0 auto 6px' }} />
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>{t('admin.contenido.clickSeleccionar')}</p>
                    <p style={{ fontSize: '10px', color: '#d1d5db', marginTop: '2px' }}>
                      {tipo === 'imagen' ? t('admin.contenido.imagenFormats') : t('admin.contenido.videoFormats')}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>
                {t('admin.contenido.titulo_label')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder={t('admin.contenido.placeholderNombre')}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f9fafb' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>
                {t('admin.contenido.descripcionItem')}
              </label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder={t('admin.contenido.placeholderDescripcion')}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f9fafb', minHeight: '60px', resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>
                {t('admin.contenido.destinatario')}
              </label>
              <DestinatarioPicker proyectos={proyectos} value={clienteId} onChange={setClienteId} t={t} />
              <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>
                {t('admin.contenido.destinatarioInfo')}
              </p>
            </div>

            <button type="submit" disabled={uploading}
              style={{
                width: '100%', padding: '10px', background: '#0099cc', color: 'white',
                border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
              <Upload size={15} /> {uploading ? t('admin.contenido.subiendo') : t('admin.contenido.subirContenido')}
            </button>
          </form>
        </div>

        {/* GRID */}
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a4e', marginBottom: '12px' }}>
            {t('admin.contenido.publicado')}
            {!loading && <span style={{ fontWeight: '400', color: '#9ca3af', marginLeft: '6px' }}>({contenidos.length})</span>}
          </h2>

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {[1,2,3].map(i => <div key={i} style={{ background: '#f3f4f6', borderRadius: '12px', height: '160px' }} />)}
            </div>
          )}

          {!loading && contenidos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', background: 'white',
              borderRadius: '12px', border: '1px dashed #d1d5db' }}>
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('admin.contenido.sinContenido')}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {contenidos.map(c => (
              <div key={c.id} style={{
                background: 'white', borderRadius: '12px', overflow: 'hidden',
                border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Thumbnail */}
                <div style={{
                  position: 'relative', aspectRatio: '16/9', background: '#0a0a4e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', cursor: 'pointer',
                }} onClick={() => setPreviewing(c)}>
                  {c.tipo === 'imagen' ? (
                    <img src={resolveUrl(c.url)} alt={c.titulo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <video src={resolveUrl(c.url)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        muted preload="metadata" />
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          border: '3px solid white', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Play size={20} color="white" fill="white" style={{ marginLeft: '3px' }} />
                        </div>
                      </div>
                    </>
                  )}
                  <span style={{
                    position: 'absolute', top: '8px', left: '8px',
                    fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    padding: '3px 8px', borderRadius: '999px', letterSpacing: '0.05em',
                  }}>{c.tipo}</span>
                </div>

                {/* Info */}
                <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0a0a4e', flex: 1 }}>
                      {c.titulo}
                    </h3>
                    {c.cliente_id ? (
                      <span style={{ fontSize: '9px', fontWeight: '700', background: '#fef3c7', color: '#d97706',
                        borderRadius: '999px', padding: '2px 7px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {proyectos.find(p => p.cliente?.id === c.cliente_id)?.cliente?.nombre || t('admin.contenido.etiquetaPersonal')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '9px', fontWeight: '700', background: '#d1fae5', color: '#065f46',
                        borderRadius: '999px', padding: '2px 7px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {t('admin.contenido.etiquetaGlobal')}
                      </span>
                    )}
                  </div>
                  {c.descripcion && (
                    <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.4', flex: 1 }}>
                      {c.descripcion}
                    </p>
                  )}

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    <button onClick={() => setPreviewing(c)} title={t('admin.contenido.previsualizar')} style={{
                      flex: 1, padding: '6px', background: '#eff6ff', border: '1px solid #bfdbfe',
                      borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Eye size={13} color="#2563eb" />
                    </button>
                    <button onClick={() => setEditing(c)} title={t('admin.contenido.editar')} style={{
                      flex: 1, padding: '6px', background: '#fef3c7', border: '1px solid #fde68a',
                      borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Edit3 size={13} color="#d97706" />
                    </button>
                    <button onClick={() => eliminar(c)} disabled={deleting === c.id} title={t('admin.contenido.eliminar')} style={{
                      flex: 1, padding: '6px', background: '#fef2f2', border: '1px solid #fecaca',
                      borderRadius: '6px', cursor: deleting === c.id ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deleting === c.id ? 0.5 : 1,
                    }}>
                      <Trash2 size={13} color="#dc2626" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {previewing && <PreviewModal contenido={previewing} onClose={() => setPreviewing(null)} />}
      {editing && (
        <EditModal contenido={editing} onClose={() => setEditing(null)} t={t}
          onSave={(updated) => {
            setContenidos(prev => prev.map(x => x.id === updated.id ? updated : x))
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
