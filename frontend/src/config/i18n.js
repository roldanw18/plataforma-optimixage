import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

// Solo se soportan español e inglés
const SUPPORTED_LNGS = ['es', 'en']

// Namespaces disponibles. `common` contiene la mayor parte del catálogo
// (admin, errors, buttons, dashboard, nav, etc.) y es el namespace por defecto.
// Mantenemos `auth` y `client` para los flujos que usan `useTranslation('auth' | 'client')`.
// `validation` y `errors` se conservan por compatibilidad con código heredado.
const NAMESPACES = ['common', 'auth', 'client', 'validation', 'errors']

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: undefined, // permite que el detector elija (o lo guardado en localStorage)
    fallbackLng: 'es',
    supportedLngs: SUPPORTED_LNGS,
    nonExplicitSupportedLngs: true, // 'es-ES' → 'es'
    load: 'languageOnly',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    ns: NAMESPACES,
    defaultNS: 'common',
    fallbackNS: ['common', 'auth', 'client'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
      format: (value, format) => {
        if (format === 'uppercase') return value.toUpperCase()
        if (format === 'lowercase') return value.toLowerCase()
        if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1)
        return value
      },
    },
    react: {
      useSuspense: false,
    },
    // Evita que claves sin traducir se muestren como "admin.x.y":
    // si no se encuentra, mostramos cadena vacía mientras carga / segmento final como fallback.
    returnNull: false,
    returnEmptyString: false,
    parseMissingKeyHandler: (key) => {
      // Si la clave parece estar todavía sin resolver (contiene puntos y minúsculas),
      // mejor mostrar el último segmento legible que la clave técnica completa.
      if (typeof key === 'string' && key.includes('.')) {
        const last = key.split('.').pop()
        return last.replace(/_/g, ' ')
      }
      return key
    },
  })

// Mantener <html lang> sincronizado con el idioma activo.
function syncHtmlLang(lng) {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = (lng || 'es').split('-')[0]
  }
}
syncHtmlLang(i18n.language)
i18n.on('languageChanged', syncHtmlLang)

export default i18n
export { NAMESPACES, SUPPORTED_LNGS }
