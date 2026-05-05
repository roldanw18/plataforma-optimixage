import { useEffect, useState, useRef } from 'react'
import { Download, FileText, FileSpreadsheet, Image, Archive, File } from 'lucide-react'
import api from '../../services/api'

const EXT_ICONS = {
  pdf: { icon: FileText, color: '#dc2626', label: 'PDF' },
  doc:  { icon: FileText, color: '#2563eb', label: 'DOC' },
  docx: { icon: FileText, color: '#2563eb', label: 'DOCX' },
  xls:  { icon: FileSpreadsheet, color: '#16a34a', label: 'XLS' },
  xlsx: { icon: FileSpreadsheet, color: '#16a34a', label: 'XLSX' },
  png:  { icon: Image, color: '#7c3aed', label: 'IMG' },
  jpg:  { icon: Image, color: '#7c3aed', label: 'IMG' },
  jpeg: { icon: Image, color: '#7c3aed', label: 'IMG' },
  zip:  { icon: Archive, color: '#ea580c', label: 'ZIP' },
}

function DocIcon({ url }) {
  const ext = (url || '').split('.').pop().toLowerCase()
  const cfg = EXT_ICONS[ext] || { icon: File, color: '#6b7280', label: 'FILE' }
  const Icon = cfg.icon
  return (
    <div style={{
      width: '52px', height: '64px',
      background: `linear-gradient(160deg, ${cfg.color}22, ${cfg.color}44)`,
      border: `1px solid ${cfg.color}44`,
      borderRadius: '8px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '4px', flexShrink: 0,
    }}>
      <Icon size={20} color={cfg.color} />
      <span style={{ fontSize: '8px', fontWeight: '700', color: cfg.color, letterSpacing: '0.05em' }}>
        {cfg.label}
      </span>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function EstadoBadge({ estado }) {
  const colors = {
    publicado: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    borrador:  { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  }
  const c = colors[estado] || colors.borrador
  return (
    <span style={{
      fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {estado}
    </span>
  )
}

export default function Documentos() {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [proyectoId, setProyectoId] = useState(null)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos?.length) { setLoading(false); return }
        const pid = proyectos[0].id
        setProyectoId(pid)
        const { data } = await api.get(`/documentos/proyecto/${pid}`)
        setDocumentos(data)
      } catch {
        setError('No se pudieron cargar los documentos.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function descargar(doc) {
    if (!doc.url?.startsWith('/documentos/download/')) {
      window.open(doc.url, '_blank')
      return
    }
    setDownloading(doc.id)
    try {
      const resp = await api.get(doc.url, { responseType: 'blob' })
      const blob = new Blob([resp.data])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = doc.titulo
      link.click()
      URL.revokeObjectURL(link.href)
    } catch {
      alert('No se pudo descargar el documento.')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>Documentos</h1>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: '#f3f4f6', borderRadius: '12px', height: '80px', marginBottom: '12px' }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0a0a4e' }}>Documentos</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
            {documentos.length} documento{documentos.length !== 1 ? 's' : ''} disponible{documentos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}

      {documentos.length === 0 && !error && (
        <div style={{
          textAlign: 'center', padding: '48px 24px', background: 'white',
          borderRadius: '12px', border: '1px dashed #d1d5db',
        }}>
          <File size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>No hay documentos disponibles.</p>
          <p style={{ color: '#d1d5db', fontSize: '12px', marginTop: '4px' }}>El administrador aún no ha cargado documentos.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {documentos.map(doc => (
          <div key={doc.id} style={{
            background: 'white', borderRadius: '12px', border: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <DocIcon url={doc.url} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a4e' }}>
                  {doc.titulo}
                </h3>
                <EstadoBadge estado={doc.estado} />
              </div>
              {doc.descripcion && (
                <p style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.5' }}>{doc.descripcion}</p>
              )}
              <p style={{ color: '#d1d5db', fontSize: '11px', marginTop: '4px' }}>
                {formatDate(doc.fecha_creacion)}
                {doc.tipo && doc.tipo !== 'otro' && ` · ${doc.tipo}`}
              </p>
            </div>
            <button
              onClick={() => descargar(doc)}
              disabled={downloading === doc.id}
              title="Descargar"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: downloading === doc.id ? '#f3f4f6' : '#eff6ff',
                border: '1px solid #bfdbfe', borderRadius: '8px',
                padding: '8px 14px', fontSize: '12px', fontWeight: '600',
                color: '#2563eb', cursor: downloading === doc.id ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}
            >
              <Download size={14} />
              {downloading === doc.id ? 'Descargando...' : 'Descargar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
