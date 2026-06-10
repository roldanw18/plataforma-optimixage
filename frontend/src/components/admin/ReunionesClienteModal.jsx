import { useEffect, useState } from 'react'
import { Calendar, Clock, Plus, Edit3, Trash2, X, AlertCircle, CheckCircle, Video } from 'lucide-react'
import i18n from 'i18next'
import api from '../../services/api'
import Modal from '../common/Modal'
import { intlLocale } from '../../utils/locale'

const ESTADOS = [
  { value: 'pendiente',  label: 'Pendiente',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { value: 'confirmada', label: 'Confirmada', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { value: 'cancelada',  label: 'Cancelada',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  { value: 'completada', label: 'Completada', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
]

function estadoConfig(estado) {
  return ESTADOS.find(e => e.value === estado) || ESTADOS[0]
}

function fmtDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString(intlLocale(i18n.language), { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function toLocalInputValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}

function FormReunion({ inicial, proyectos, onSubmit, onCancel, saving, err }) {
  const [proyectoId, setProyectoId] = useState(inicial?.proyecto_id || (proyectos[0]?.id || ''))
  const [titulo, setTitulo]         = useState(inicial?.titulo || '')
  const [descripcion, setDescripcion] = useState(inicial?.descripcion || '')
  const [fecha, setFecha]           = useState(toLocalInputValue(inicial?.fecha))
  const [duracion, setDuracion]     = useState(inicial?.duracion_minutos || 30)
  const [enlace, setEnlace]         = useState(inicial?.enlace || '')
  const [estado, setEstado]         = useState(inicial?.estado || 'pendiente')

  function submit(e) {
    e.preventDefault()
    if (!fecha) return
    onSubmit({
      proyecto_id: proyectoId,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      fecha: new Date(fecha).toISOString(),
      duracion_minutos: duracion ? Number(duracion) : null,
      enlace: enlace.trim() || null,
      estado,
    })
  }

  const inputSt = {
    width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb',
    borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f9fafb',
    boxSizing: 'border-box',
  }

  return (
    <form onSubmit={submit}>
      {err && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          marginBottom: '12px',
        }}>
          <AlertCircle size={14} /> {err}
        </div>
      )}

      {!inicial && (
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
            Proyecto <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select value={proyectoId} onChange={e => setProyectoId(e.target.value)} style={inputSt} required>
            {proyectos.length === 0 && <option value="">— Sin proyectos —</option>}
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
          Título <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} required
          placeholder="Ej: Reunión inicial de diagnóstico" style={inputSt} />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
          Descripción
        </label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
          placeholder="Agenda u objetivos (opcional)"
          style={{ ...inputSt, minHeight: '70px', resize: 'vertical' }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 100px',
        gap: '10px', marginBottom: '10px',
      }}>
        <div style={{ minWidth: 0 }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
            Fecha y hora <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} required
            style={{ ...inputSt, boxSizing: 'border-box' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
            Min.
          </label>
          <input type="number" min="0" step="5" value={duracion} onChange={e => setDuracion(e.target.value)}
            style={{ ...inputSt, boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
          Enlace de reunión
        </label>
        <input value={enlace} onChange={e => setEnlace(e.target.value)}
          placeholder="https://meet... (opcional)" style={inputSt} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
          Estado
        </label>
        <select value={estado} onChange={e => setEstado(e.target.value)} style={inputSt}>
          {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
        <button type="button" onClick={onCancel}
          style={{ padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb',
            borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: '#374151',
            whiteSpace: 'nowrap' }}>
          Cancelar
        </button>
        <button type="submit" disabled={saving || !proyectoId}
          style={{ padding: '8px 16px', background: '#0099cc', color: 'white', border: 'none',
            borderRadius: '8px', fontSize: '13px', fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            whiteSpace: 'nowrap' }}>
          {saving ? 'Guardando...' : (inicial ? 'Guardar cambios' : 'Programar reunión')}
        </button>
      </div>
    </form>
  )
}

export default function ReunionesClienteModal({ cliente, onClose }) {
  const [proyectos, setProyectos]   = useState([])
  const [reuniones, setReuniones]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [err, setErr]               = useState(null)
  const [msg, setMsg]               = useState(null)

  async function fetchAll() {
    setLoading(true)
    try {
      const { data: misProy } = await api.get('/proyectos/admin/todos')
      const propios = misProy.filter(p => p.cliente_id === cliente.id)
      setProyectos(propios)

      const { data: reun } = await api.get(`/reuniones/cliente/${cliente.id}`)
      setReuniones(reun)
    } catch {
      setErr('No se pudo cargar la información del cliente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [cliente.id])

  async function handleCrear(payload) {
    setSaving(true); setErr(null); setMsg(null)
    try {
      const { data } = await api.post('/reuniones/', payload)
      setReuniones(prev => [...prev, data].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)))
      setShowForm(false)
      setMsg('Reunión programada correctamente.')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error al crear la reunión.')
    } finally {
      setSaving(false)
    }
  }

  async function handleActualizar(payload) {
    setSaving(true); setErr(null); setMsg(null)
    try {
      // proyecto_id no se actualiza
      const { proyecto_id, ...body } = payload
      const { data } = await api.patch(`/reuniones/${editing.id}`, body)
      setReuniones(prev => prev.map(r => r.id === data.id ? data : r))
      setEditing(null)
      setMsg('Reunión actualizada correctamente.')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error al actualizar la reunión.')
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(reunion) {
    if (!window.confirm(`¿Eliminar reunión "${reunion.titulo}"?`)) return
    try {
      await api.delete(`/reuniones/${reunion.id}`)
      setReuniones(prev => prev.filter(r => r.id !== reunion.id))
      setMsg('Reunión eliminada.')
    } catch {
      alert('No se pudo eliminar.')
    }
  }

  async function cancelar(reunion) {
    try {
      const { data } = await api.patch(`/reuniones/${reunion.id}`, { estado: 'cancelada' })
      setReuniones(prev => prev.map(r => r.id === data.id ? data : r))
    } catch {
      alert('No se pudo cancelar.')
    }
  }

  const ahora = new Date()
  const futuras = reuniones.filter(r => new Date(r.fecha) >= ahora)
  const pasadas = reuniones.filter(r => new Date(r.fecha) <  ahora)

  return (
    <Modal title={`Reuniones — ${cliente.nombre || cliente.email}`} onClose={onClose} maxWidth="640px">
      <div style={{ width: '100%', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
        {msg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
            background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
            marginBottom: '12px',
          }}>
            <CheckCircle size={14} /> {msg}
          </div>
        )}

        {!showForm && !editing && (
          <>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '14px', gap: '10px', flexWrap: 'wrap',
            }}>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                {reuniones.length} reunión{reuniones.length !== 1 ? 'es' : ''} en total
              </p>
              <button onClick={() => setShowForm(true)} disabled={proyectos.length === 0}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px', background: '#0099cc', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '12px',
                  fontWeight: '600', cursor: proyectos.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: proyectos.length === 0 ? 0.6 : 1, whiteSpace: 'nowrap',
                }}>
                <Plus size={13} /> Nueva reunión
              </button>
            </div>

            {proyectos.length === 0 && (
              <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '12px' }}>
                Este cliente aún no tiene proyectos asignados. Crea uno antes de programar reuniones.
              </p>
            )}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1,2,3].map(i => <div key={i} style={{ background: '#f3f4f6', borderRadius: '8px', height: '60px' }} />)}
              </div>
            )}

            {!loading && reuniones.length === 0 && proyectos.length > 0 && (
              <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '24px' }}>
                Sin reuniones programadas todavía.
              </p>
            )}

            {!loading && futuras.length > 0 && (
              <>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280',
                  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Próximas
                </p>
                <ListaReuniones items={futuras} onEdit={setEditing} onDelete={handleEliminar} onCancel={cancelar} />
              </>
            )}

            {!loading && pasadas.length > 0 && (
              <>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280',
                  textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>
                  Pasadas
                </p>
                <ListaReuniones items={pasadas} pasada onEdit={setEditing} onDelete={handleEliminar} onCancel={cancelar} />
              </>
            )}
          </>
        )}

        {showForm && (
          <FormReunion proyectos={proyectos} onSubmit={handleCrear}
            onCancel={() => { setShowForm(false); setErr(null) }}
            saving={saving} err={err} />
        )}

        {editing && (
          <FormReunion inicial={editing} proyectos={proyectos} onSubmit={handleActualizar}
            onCancel={() => { setEditing(null); setErr(null) }}
            saving={saving} err={err} />
        )}
      </div>
    </Modal>
  )
}

function ListaReuniones({ items, pasada, onEdit, onDelete, onCancel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map(r => {
        const cfg = estadoConfig(r.estado)
        return (
          <div key={r.id} style={{
            background: 'white', borderRadius: '10px', border: '1px solid #f3f4f6',
            padding: '12px 14px', opacity: pasada ? 0.7 : 1,
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              gap: '12px', flexWrap: 'wrap',
            }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '4px', flexWrap: 'wrap',
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#0a0a4e', wordBreak: 'break-word' }}>
                    {r.titulo}
                  </p>
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px',
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                    textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                  }}>{cfg.label}</span>
                </div>
                <p style={{
                  fontSize: '11px', color: '#6b7280',
                  display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap',
                }}>
                  <Calendar size={11} /> {fmtDateTime(r.fecha)}
                  {r.duracion_minutos && (
                    <>
                      <Clock size={11} style={{ marginLeft: '6px' }} /> {r.duracion_minutos} min
                    </>
                  )}
                </p>
                {r.descripcion && (
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', lineHeight: '1.4' }}>
                    {r.descripcion}
                  </p>
                )}
                {r.enlace && (
                  <a href={r.enlace} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: '#0099cc', fontWeight: '600',
                      display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Video size={11} /> Abrir enlace
                  </a>
                )}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button onClick={() => onEdit(r)} title="Editar"
                  style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}>
                  <Edit3 size={12} color="#d97706" />
                </button>
                {r.estado !== 'cancelada' && (
                  <button onClick={() => onCancel(r)} title="Cancelar reunión"
                    style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}>
                    <X size={12} color="#ea580c" />
                  </button>
                )}
                <button onClick={() => onDelete(r)} title="Eliminar"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}>
                  <Trash2 size={12} color="#dc2626" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
