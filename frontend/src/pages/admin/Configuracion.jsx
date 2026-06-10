import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Lock, Save, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import api from '../../services/api'
import AvatarUploader from '../../components/common/AvatarUploader'

function Alert({ type, message }) {
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
      {message}
    </div>
  )
}

function Section({ title, icon: Icon, accent = '#2563eb', children }) {
  return (
    <div style={{
      background: 'white', borderRadius: '12px', padding: '24px',
      border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={accent} />
        </div>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a4e' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
  borderRadius: '8px', fontSize: '13px', color: '#111827', outline: 'none', background: '#fff',
}

export default function AdminConfiguracion() {
  const { t } = useTranslation()
  const [perfil, setPerfil] = useState({ nombre: '', email: '', telefono: '', avatar_url: '' })
  const [pwd, setPwd] = useState({ actual: '', nuevo: '', confirmar: '' })
  const [perfilMsg, setPerfilMsg] = useState(null)
  const [perfilErr, setPerfilErr] = useState(null)
  const [pwdMsg, setPwdMsg] = useState(null)
  const [pwdErr, setPwdErr] = useState(null)
  const [saving, setSaving] = useState(false)
  const [totalUsuarios, setTotalUsuarios] = useState(null)

  useEffect(() => {
    api.get('/usuarios/me').then(({ data }) => {
      setPerfil({
        nombre: data.nombre || '',
        email: data.email || '',
        telefono: data.telefono || '',
        avatar_url: data.avatar_url || '',
      })
    })
    api.get('/usuarios/').then(({ data }) => setTotalUsuarios(data.length)).catch(() => {})
  }, [])

  async function guardarPerfil(e) {
    e.preventDefault()
    setPerfilErr(null); setPerfilMsg(null); setSaving(true)
    try {
      await api.patch('/usuarios/me', {
        nombre: perfil.nombre,
        telefono: perfil.telefono,
      })
      setPerfilMsg(t('admin.configuracion.perfilExito'))
    } catch (err) {
      setPerfilErr(err.response?.data?.detail || t('admin.configuracion.perfilError'))
    } finally {
      setSaving(false)
    }
  }

  async function cambiarPassword(e) {
    e.preventDefault()
    setPwdErr(null); setPwdMsg(null)
    if (pwd.nuevo !== pwd.confirmar) { setPwdErr(t('admin.configuracion.passwordNoCoincide')); return }
    if (pwd.nuevo.length < 6) { setPwdErr(t('admin.configuracion.passwordMinChars')); return }
    setSaving(true)
    try {
      await api.patch('/usuarios/me/password', {
        password_actual: pwd.actual,
        password_nuevo: pwd.nuevo,
      })
      setPwdMsg(t('admin.configuracion.passwordExito'))
      setPwd({ actual: '', nuevo: '', confirmar: '' })
    } catch (err) {
      setPwdErr(err.response?.data?.detail || t('admin.configuracion.passwordError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0a0a4e', marginBottom: '6px' }}>
        {t('admin.configuracion.titulo')}
      </h1>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
        {t('admin.configuracion.descripcion')}
      </p>

      {/* Stats rápidas */}
      {totalUsuarios !== null && (
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '24px',
        }}>
          <div style={{
            flex: 1, background: '#0a0a4e', color: 'white', borderRadius: '10px',
            padding: '14px 18px',
          }}>
            <div style={{ fontSize: '22px', fontWeight: '800' }}>{totalUsuarios}</div>
            <div style={{ fontSize: '11px', opacity: 0.75 }}>{t('admin.configuracion.usuariosRegistrados')}</div>
          </div>
          <div style={{
            flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px',
            padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} color="#16a34a" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#15803d' }}>{t('admin.configuracion.rolAdmin')}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{perfil.email}</div>
          </div>
        </div>
      )}

      {/* Perfil */}
      <Section title={t('admin.configuracion.infoPersonal')} icon={User}>
        <Alert type="success" message={perfilMsg} />
        <Alert type="error" message={perfilErr} />
        <form onSubmit={guardarPerfil}>
          <Field label={t('admin.configuracion.nombreCompleto')}>
            <input style={inputStyle} value={perfil.nombre}
              onChange={e => setPerfil(p => ({ ...p, nombre: e.target.value }))} placeholder={t('admin.configuracion.tuNombre')} />
          </Field>
          <Field label={t('admin.configuracion.email')}>
            <input style={{ ...inputStyle, background: '#f9fafb', color: '#9ca3af' }} value={perfil.email} disabled />
          </Field>
          <Field label={t('admin.configuracion.telefono')}>
            <input style={inputStyle} value={perfil.telefono}
              onChange={e => setPerfil(p => ({ ...p, telefono: e.target.value }))} placeholder={t('admin.configuracion.telefonoPlaceholder')} />
          </Field>
          <Field label={t('admin.configuracion.avatar')}>
            <AvatarUploader
              value={perfil.avatar_url}
              onChange={(url) => {
                setPerfil(p => ({ ...p, avatar_url: url }))
                setPerfilMsg(t('admin.configuracion.avatarActualizado'))
              }}
            />
          </Field>
          <button type="submit" disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#0a0a4e', color: 'white', border: 'none',
            borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
            fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            <Save size={15} /> {saving ? t('admin.configuracion.guardando') : t('admin.configuracion.guardarCambios')}
          </button>
        </form>
      </Section>

      {/* Contraseña */}
      <Section title={t('admin.configuracion.cambiarPassword')} icon={Lock} accent="#dc2626">
        <Alert type="success" message={pwdMsg} />
        <Alert type="error" message={pwdErr} />
        <form onSubmit={cambiarPassword}>
          <Field label={t('admin.configuracion.passwordActual')}>
            <input type="password" style={inputStyle} value={pwd.actual}
              onChange={e => setPwd(p => ({ ...p, actual: e.target.value }))} placeholder={t('admin.configuracion.passwordPlaceholder')} />
          </Field>
          <Field label={t('admin.configuracion.passwordNueva')}>
            <input type="password" style={inputStyle} value={pwd.nuevo}
              onChange={e => setPwd(p => ({ ...p, nuevo: e.target.value }))} placeholder={t('admin.configuracion.passwordPlaceholderNueva')} />
          </Field>
          <Field label={t('admin.configuracion.passwordConfirmar')}>
            <input type="password" style={inputStyle} value={pwd.confirmar}
              onChange={e => setPwd(p => ({ ...p, confirmar: e.target.value }))} placeholder={t('admin.configuracion.passwordPlaceholderRepetir')} />
          </Field>
          <button type="submit" disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#dc2626', color: 'white', border: 'none',
            borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
            fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            <Lock size={15} /> {saving ? t('admin.configuracion.cambiando') : t('admin.configuracion.cambiarPassword')}
          </button>
        </form>
      </Section>
    </div>
  )
}
