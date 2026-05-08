import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
  ]

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>
        {t('idioma')}:
      </span>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: i18n.language === lang.code ? '1px solid #0099cc' : '1px solid #e5e7eb',
            backgroundColor: i18n.language === lang.code ? '#e8f7fc' : 'transparent',
            color: i18n.language === lang.code ? '#0099cc' : '#6b7280',
            fontSize: '0.75rem',
            fontWeight: i18n.language === lang.code ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (i18n.language !== lang.code) {
              e.target.style.backgroundColor = '#f3f4f6'
            }
          }}
          onMouseLeave={(e) => {
            if (i18n.language !== lang.code) {
              e.target.style.backgroundColor = 'transparent'
            }
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
