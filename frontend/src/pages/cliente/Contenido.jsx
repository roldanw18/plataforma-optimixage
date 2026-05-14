import { useEffect, useState } from 'react'
import { Play, Image as ImageIcon, Video as VideoIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

function resolveUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `/api${url}`
}

export default function Contenido() {
  const { t } = useTranslation()
  const [contenidos, setContenidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todos') // todos | imagen | video
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    api.get('/contenidos/')
      .then(r => setContenidos(r.data || []))
      .catch(e => {
        const detail = e?.response?.data?.detail || e?.message || t('cliente.contenido.errorCargar')
        setError(typeof detail === 'string' ? detail : t('cliente.contenido.errorCargar'))
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibles = filtro === 'todos'
    ? contenidos
    : contenidos.filter(c => c.tipo === filtro)

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0a0a4e' }}>{t('cliente.contenido.titulo')}</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { v: 'todos', label: t('cliente.contenido.filtros.todos') },
            { v: 'imagen', label: t('cliente.contenido.filtros.imagenes') },
            { v: 'video', label: t('cliente.contenido.filtros.videos') },
          ].map(({ v, label }) => (
            <button key={v} onClick={() => setFiltro(v)} style={{
              padding: '8px 18px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600',
              background: filtro === v ? '#0099cc' : '#f3f4f6',
              color: filtro === v ? 'white' : '#374151',
              transition: 'background .15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ borderRadius: '16px', background: '#f3f4f6', aspectRatio: '16/9' }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '10px', marginBottom: '1.5rem', color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>
          {error}
        </div>
      )}

      {!loading && !error && visibles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>{t('cliente.contenido.sinContenido')}</p>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.75rem',
      }}>
        {visibles.map((c) => (
          <div key={c.id} style={{
            background: 'white', borderRadius: '16px', overflow: 'hidden',
            border: '1px solid #e9ecef', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            cursor: 'pointer', transition: 'box-shadow .2s, transform .2s',
          }}
            onClick={() => setPreview(c)}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.11)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {/* Thumbnail */}
            <div style={{
              position: 'relative', aspectRatio: '16/9', background: '#0a0a4e', overflow: 'hidden',
              borderRadius: '16px 16px 0 0',
            }}>
              {c.tipo === 'imagen' ? (
                <img src={resolveUrl(c.url)} alt={c.titulo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <video src={resolveUrl(c.url)} muted preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '50%',
                      border: '3px solid white', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Play size={26} color="white" fill="white" style={{ marginLeft: '3px' }} />
                    </div>
                  </div>
                </>
              )}
              <span style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(0,0,0,0.55)', color: 'white',
                fontSize: '9px', fontWeight: '700', textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: '999px', letterSpacing: '0.05em',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                {c.tipo === 'imagen' ? <ImageIcon size={9} /> : <VideoIcon size={9} />}
                {c.tipo}
              </span>
            </div>

            {/* Info */}
            <div style={{ padding: '18px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0a0a4e', marginBottom: '6px' }}>
                {c.titulo}
              </h3>
              {c.descripcion && (
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.descripcion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '16px', maxWidth: '900px', width: '100%',
            maxHeight: '90vh', overflow: 'auto', padding: '24px', position: 'relative',
          }}>
            <button onClick={() => setPreview(null)} style={{
              position: 'absolute', top: '14px', right: '14px',
              background: '#f3f4f6', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
            onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
            >✕</button>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0a0a4e', marginBottom: '6px', paddingRight: '40px' }}>
              {preview.titulo}
            </h2>
            {preview.descripcion && (
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{preview.descripcion}</p>
            )}
            {preview.tipo === 'imagen' ? (
              <img src={resolveUrl(preview.url)} alt={preview.titulo}
                style={{ width: '100%', borderRadius: '12px', maxHeight: '65vh', objectFit: 'contain' }} />
            ) : (
              <video src={resolveUrl(preview.url)} controls autoPlay
                style={{ width: '100%', borderRadius: '12px', maxHeight: '65vh' }} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
