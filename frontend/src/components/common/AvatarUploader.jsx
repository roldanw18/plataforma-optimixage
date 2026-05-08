import { useRef, useState } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import api from '../../services/api'

const ALLOWED = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export function resolveAvatarUrl(url) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url
  return `/api${url}`
}

/**
 * Permite cambiar el avatar via:
 *   - subida de archivo local (recomendado, multipart -> /usuarios/me/avatar)
 *   - URL externa (compatibilidad con sistema previo)
 *
 * Llama onChange(nuevoAvatarUrl) cuando hay cambios persistidos.
 */
export default function AvatarUploader({ value, onChange }) {
  const fileRef = useRef()
  const [preview, setPreview] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState(null)
  const [urlMode, setUrlMode] = useState(false)
  const [urlValue, setUrlValue] = useState('')

  const displayed = preview || resolveAvatarUrl(value)

  function pickFile(file) {
    setErr(null)
    if (!file) return
    if (!ALLOWED.includes(file.type)) {
      setErr('Formato no permitido. Usa PNG, JPG, GIF o WEBP.')
      return
    }
    if (file.size > MAX_SIZE) {
      setErr('La imagen supera el límite de 5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
    setPendingFile(file)
  }

  async function subir() {
    if (!pendingFile) return
    setUploading(true); setErr(null)
    try {
      const form = new FormData()
      form.append('archivo', pendingFile)
      const { data } = await api.post('/usuarios/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(data.avatar_url)
      setPreview(null)
      setPendingFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error al subir el avatar.')
    } finally {
      setUploading(false)
    }
  }

  function cancelarPreview() {
    setPreview(null); setPendingFile(null); setErr(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function guardarUrl() {
    setUploading(true); setErr(null)
    try {
      await api.patch('/usuarios/me', { avatar_url: urlValue })
      onChange(urlValue)
      setUrlMode(false)
      setUrlValue('')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error al guardar la URL.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
        <div style={{
          width: '76px', height: '76px', borderRadius: '50%',
          background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', border: '2px solid #e5e7eb', flexShrink: 0,
        }}>
          {displayed ? (
            <img src={displayed} alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Sin foto</span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <input ref={fileRef} type="file" style={{ display: 'none' }}
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={e => pickFile(e.target.files[0])} />

          {!preview && !urlMode && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', background: '#0099cc', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '12px',
                  fontWeight: '600', cursor: 'pointer',
                }}>
                <Upload size={13} /> Subir archivo
              </button>
              <button type="button" onClick={() => setUrlMode(true)}
                style={{
                  padding: '8px 14px', background: 'white', color: '#374151',
                  border: '1px solid #e5e7eb', borderRadius: '8px',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                }}>
                Usar URL
              </button>
            </div>
          )}

          {preview && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={subir} disabled={uploading}
                style={{
                  padding: '8px 14px', background: '#16a34a', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1,
                }}>
                {uploading ? 'Subiendo...' : 'Confirmar y subir'}
              </button>
              <button type="button" onClick={cancelarPreview}
                style={{
                  padding: '8px 14px', background: 'white', color: '#374151',
                  border: '1px solid #e5e7eb', borderRadius: '8px',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                <X size={13} /> Cancelar
              </button>
            </div>
          )}

          {urlMode && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input value={urlValue} onChange={e => setUrlValue(e.target.value)}
                placeholder="https://..."
                style={{
                  flex: '1 1 220px', padding: '7px 10px',
                  border: '1px solid #d1d5db', borderRadius: '8px',
                  fontSize: '12px', outline: 'none',
                }} />
              <button type="button" onClick={guardarUrl} disabled={uploading || !urlValue.trim()}
                style={{
                  padding: '7px 12px', background: '#0099cc', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1,
                }}>
                Guardar
              </button>
              <button type="button" onClick={() => { setUrlMode(false); setUrlValue('') }}
                style={{
                  padding: '7px 10px', background: 'white', color: '#374151',
                  border: '1px solid #e5e7eb', borderRadius: '8px',
                  fontSize: '12px', cursor: 'pointer',
                }}>
                <X size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {err && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          marginBottom: '8px',
        }}>
          <AlertCircle size={14} /> {err}
        </div>
      )}

      <p style={{ fontSize: '11px', color: '#9ca3af' }}>
        PNG, JPG, GIF o WEBP · máx 5 MB
      </p>
    </div>
  )
}
