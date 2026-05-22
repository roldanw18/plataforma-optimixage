/**
 * Resuelve el título/contenido de una notificación.
 * Si trae `titulo_key` / `contenido_key` se traduce con i18next interpolando `params`.
 * Si no (ej. broadcasts manuales del admin), se usa el texto original ya guardado.
 */
export function notifTitulo(t, notif) {
  if (notif?.titulo_key) return t(notif.titulo_key, notif.params || {})
  return notif?.titulo || ''
}

export function notifContenido(t, notif) {
  if (notif?.contenido_key) return t(notif.contenido_key, notif.params || {})
  return notif?.contenido || ''
}

export function notifTipoLabel(t, tipo) {
  const key = `notif.tipos.${tipo}`
  const v = t(key)
  // Si no existe la traducción, fallback al string crudo
  return v === key ? (tipo || '').replace('_', ' ') : v
}
