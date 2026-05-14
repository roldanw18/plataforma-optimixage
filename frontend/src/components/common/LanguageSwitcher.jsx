import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common')

  const languages = [
    { code: 'es', label: t('common.spanish'), flag: '🇪🇸' },
    { code: 'en', label: t('common.english'), flag: '🇺🇸' },
  ]

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          title={`${t('common.select_language')}: ${lang.label}`}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: i18n.language === lang.code ? '2px solid #0099cc' : '1px solid #d1d5db',
            backgroundColor: i18n.language === lang.code ? '#eff6ff' : 'white',
            color: i18n.language === lang.code ? '#0099cc' : '#6b7280',
            fontSize: '0.8rem',
            fontWeight: i18n.language === lang.code ? '700' : '500',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
          onMouseEnter={(e) => {
            if (i18n.language !== lang.code) {
              e.target.style.backgroundColor = '#f3f4f6'
              e.target.style.borderColor = '#9ca3af'
            }
          }}
          onMouseLeave={(e) => {
            if (i18n.language !== lang.code) {
              e.target.style.backgroundColor = 'white'
              e.target.style.borderColor = '#d1d5db'
            }
          }}
        >
          <span>{lang.flag}</span>
          <span style={{ display: 'none' }}>{lang.label}</span>
        </button>
      ))}
    </div>
  )
}
