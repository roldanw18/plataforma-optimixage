import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, maxWidth = '440px' }) {
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
        width: '100%', maxWidth,
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
