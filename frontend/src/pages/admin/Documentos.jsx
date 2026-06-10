import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Trash2, Download, X, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import { intlLocale } from '../../utils/locale'

const TIPOS = ['contrato', 'propuesta', 'informe', 'diseño', 'otro']
const ESTADOS = ['borrador', 'publicado']

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

function formatDate(iso, lng) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(intlLocale(lng), { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminDocumentos() {
  const { t, i18n } = useTranslation()
  const lng = i18n.language?.split('-')[0] || 'es'
  const [proyectos, setProyectos] = useState([])
  const [proyectoId, setProyectoId] = useState('')
  const [documentos, setDocumentos] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  // Upload form
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState('otro')
  const [estado, setEstado] = useState('borrador')
  const [archivo, setArchivo] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const fileRef = useRef()

  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    api.get('/proyectos/admin/todos')
      .then(({ data }) => {
        setProyectos(data)
        if (data.length > 0) setProyectoId(data[0].id)
      })
      .catch(() => {
        api.get('/proyectos/mis-proyectos').then(({ data }) => {
          setProyectos(data)
          if (data.length > 0) setProyectoId(data[0].id)
        })
      })
  }, [])

  function labelProyecto(p) {
    const owner = p.cliente?.nombre || p.cliente?.email
    return owner ? `${p.nombre} — ${owner}` : `${p.nombre} — ${t('common.sin_asignar')}`
  }

  useEffect(() => {
    if (!proyectoId) return
    setLoadingDocs(true)
    api.get(`/documentos/proyecto/${proyectoId}`)
      .then(({ data }) => setDocumentos(data))
      .catch(() => setDocumentos([]))
      .finally(() => setLoadingDocs(false))
  }, [proyectoId])

  async function handleUpload(e) {
    e.preventDefault()
    if (!archivo) { setErr(t('admin.documentos.errorSinArchivo')); return }
    if (!titulo.trim()) { setErr(t('admin.documentos.errorSinTitulo')); return }
    setErr(null); setMsg(null); setUploading(true)

    const form = new FormData()
    form.append('proyecto_id', proyectoId)
    form.append('titulo', titulo.trim())
    form.append('descripcion', descripcion)
    form.append('tipo', tipo)
    form.append('estado', estado)
    form.append('archivo', archivo)

    try {
      const { data } = await api.post('/documentos/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDocumentos(prev => [data, ...prev])
      setMsg(t('admin.documentos.exito', { titulo: data.titulo }))
      setTitulo(''); setDescripcion(''); setArchivo(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setErr(e.response?.data?.detail || t('admin.documentos.errorSubir'))
    } finally {
      setUploading(false)
    }
  }

  async function eliminar(doc) {
    if (!window.confirm(t('admin.documentos.confirmarEliminar', { titulo: doc.titulo }))) return
    setDeleting(doc.id)
    try {
      await api.delete(`/documentos/${doc.id}`)
      setDocumentos(prev => prev.filter(d => d.id !== doc.id))
    } catch {
      alert(t('admin.documentos.errorEliminar'))
    } finally {
      setDeleting(null)
    }
  }

  async function descargar(doc) {
    if (!doc.url?.startsWith('/documentos/download/')) {
      window.open(doc.url, '_blank'); return
    }
    try {
      const resp = await api.get(doc.url, { responseType: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([resp.data]))
      link.download = doc.titulo
      link.click()
      URL.revokeObjectURL(link.href)
    } catch {
      alert(t('admin.documentos.errorDescargar'))
    }
  }

  const inputSt = {
    width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb',
    borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f9fafb',
  }
  const selectSt = { ...inputSt }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0a0a4e', marginBottom: '6px' }}>
        {t('admin.documentos.titulo')}
      </h1>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
        {t('admin.documentos.descripcion')}
      </p>

      {/* Selector de proyecto */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
          {t('admin.documentos.proyecto')}
        </label>
        <select value={proyectoId} onChange={e => setProyectoId(e.target.value)} style={{ ...selectSt, maxWidth: '420px' }}>
          {proyectos.map(p => (
            <option key={p.id} value={p.id}>{labelProyecto(p)}</option>
          ))}
        </select>
        {proyectoId && (() => {
          const p = proyectos.find(x => x.id === proyectoId)
          if (!p?.cliente) return null
          return (
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
              {t('admin.documentos.propietario')}{' '}
              <span style={{ color: '#374151', fontWeight: '600' }}>{p.cliente.nombre}</span>
              {p.cliente.email && <span> · {p.cliente.email}</span>}
            </p>
          )
        })()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* UPLOAD FORM */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '20px',
          border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a4e', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={16} color="#0099cc" /> {t('admin.documentos.subir')}
          </h2>

          <Alert type="success" message={msg} onClose={() => setMsg(null)} />
          <Alert type="error"   message={err} onClose={() => setErr(null)} />

          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>
                {t('admin.documentos.archivo')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${archivo ? '#0099cc' : '#d1d5db'}`,
                  borderRadius: '8px', padding: '16px', textAlign: 'center',
                  cursor: 'pointer', background: archivo ? '#eff6ff' : '#fafafa',
                  transition: 'all .2s',
                }}
              >
                <input ref={fileRef} type="file" style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip"
                  onChange={e => setArchivo(e.target.files[0] || null)} />
                {archivo ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FileText size={16} color="#0099cc" />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#0099cc' }}>{archivo.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} color="#9ca3af" style={{ margin: '0 auto 6px' }} />
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>{t('admin.documentos.clickSeleccionar')}</p>
                    <p style={{ fontSize: '10px', color: '#d1d5db', marginTop: '2px' }}>{t('admin.documentos.formatosArchivo')}</p>
                  </>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>
                {t('admin.documentos.titulo_label')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input style={inputSt} value={titulo}
                onChange={e => setTitulo(e.target.value)} placeholder={t('admin.documentos.placeholderNombre')} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>
                {t('admin.documentos.descripcionDoc')}
              </label>
              <textarea style={{ ...inputSt, resize: 'vertical', minHeight: '60px' }}
                value={descripcion} onChange={e => setDescripcion(e.target.value)}
                placeholder={t('admin.documentos.placeholderDescripcion')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>{t('admin.documentos.tipo')}</label>
                <select style={selectSt} value={tipo} onChange={e => setTipo(e.target.value)}>
                  {TIPOS.map(tp => <option key={tp} value={tp}>{t('admin.documentos.tipos.' + tp)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>{t('admin.documentos.estado')}</label>
                <select style={selectSt} value={estado} onChange={e => setEstado(e.target.value)}>
                  {ESTADOS.map(s => <option key={s} value={s}>{t('admin.documentos.estados.' + s)}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={uploading || !proyectoId} style={{
              width: '100%', padding: '10px', background: '#0099cc', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
              cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <Upload size={15} /> {uploading ? t('admin.documentos.subiendo') : t('admin.documentos.subir')}
            </button>
          </form>
        </div>

        {/* LISTA DE DOCUMENTOS */}
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a4e', marginBottom: '12px' }}>
            {t('admin.documentos.documentosDelProyecto')}
            {!loadingDocs && <span style={{ fontWeight: '400', color: '#9ca3af', marginLeft: '6px' }}>({documentos.length})</span>}
          </h2>

          {loadingDocs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1,2,3].map(i => <div key={i} style={{ background: '#f3f4f6', borderRadius: '10px', height: '64px' }} />)}
            </div>
          )}

          {!loadingDocs && documentos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', background: 'white',
              borderRadius: '12px', border: '1px dashed #d1d5db' }}>
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('admin.documentos.noHay')}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {documentos.map(doc => (
              <div key={doc.id} style={{
                background: 'white', borderRadius: '10px', border: '1px solid #f3f4f6',
                display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <FileText size={20} color="#6b7280" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#0a0a4e' }}>{doc.titulo}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {formatDate(doc.fecha_creacion, lng)} · {doc.tipo} ·{' '}
                    <span style={{
                      color: doc.estado === 'publicado' ? '#16a34a' : '#d97706',
                      fontWeight: '600',
                    }}>{doc.estado}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => descargar(doc)} title={t('admin.documentos.descargar')} style={{
                    background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '7px',
                    padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  }}>
                    <Download size={14} color="#2563eb" />
                  </button>
                  <button onClick={() => eliminar(doc)} disabled={deleting === doc.id} title={t('admin.documentos.eliminar')} style={{
                    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px',
                    padding: '7px', cursor: deleting === doc.id ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', opacity: deleting === doc.id ? 0.5 : 1,
                  }}>
                    <Trash2 size={14} color="#dc2626" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
