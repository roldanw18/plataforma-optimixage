// Devuelve el locale BCP-47 a usar con `Intl` / `toLocaleDateString` /
// `toLocaleTimeString` a partir del código corto que usa i18next ('es' | 'en' | 'pt').
export function intlLocale(lng) {
  const base = (lng || 'es').split('-')[0]
  if (base === 'en') return 'en-US'
  if (base === 'pt') return 'pt-BR'
  return 'es-ES'
}
