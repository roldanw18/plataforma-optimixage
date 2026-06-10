# 🚀 GUÍA DE IMPLEMENTACIÓN - REFACTORIZACIÓN i18n

## ⚡ INICIO RÁPIDO

### 1. Importar useTranslation en tu componente:

```jsx
import { useTranslation } from 'react-i18next'
```

### 2. Usar el hook en tu componente:

```jsx
function MyComponent() {
  // Opción A: Namespace específico (RECOMENDADO)
  const { t } = useTranslation('admin')  // para admin
  const { t } = useTranslation('client') // para cliente
  const { t } = useTranslation('auth')   // para autenticación
  
  // Opción B: Namespace por defecto (common)
  const { t } = useTranslation()
}
```

### 3. Reemplazar strings:

```jsx
// ❌ ANTES
<h1>Mis Documentos</h1>
<button>Guardar</button>
<p>Cargando...</p>

// ✅ DESPUÉS
<h1>{t('documentos.title')}</h1>
<button>{t('common.guardar')}</button>
<p>{t('common.cargando')}</p>
```

---

## 📚 NAMESPACES DISPONIBLES

### **common.json** - Elementos Compartidos
```
t('nav.clientes')
t('nav.documentos')
t('nav.logout')
t('common.guardar')
t('common.cancelar')
t('common.guardar')
t('common.cargando')
t('common.subiendo')
t('common.eliminando')
t('common.actualizando')
```

### **auth.json** - Autenticación
```
t('login.title')
t('login.subtitle')
t('login.email_label')
t('login.password_label')
t('login.loading')
t('login.invalid_credentials')
t('login.forgot_password')
```

### **admin.json** - Panel Administrativo
```
// Dashboard
t('admin.dashboard.title')

// Clientes
t('admin.clientes.title')
t('admin.clientes.new_client')
t('admin.clientes.no_clients')

// Documentos
t('admin.documentos.title')
t('admin.documentos.upload_title')
t('admin.documentos.no_documents')

// Similar para: proceso, mensajes, notificaciones, contenido, configuracion, equipo
```

### **client.json** - Interfaz Cliente
```
t('client.sidebar.dashboard')
t('client.documentos.title')
t('client.mensajes.title')
t('client.contenido.title')
```

### **validation.json** - Validaciones
```
t('validation.required')
t('validation.email_invalid')
t('validation.password_min')
t('validation.passwords_not_match')
```

### **errors.json** - Errores
```
t('errors.generic')
t('errors.network')
t('errors.server')
t('errors.unauthorized')
```

---

## 💻 PATRONES COMUNES

### Uso Básico:
```jsx
<h1>{t('key.name')}</h1>
```

### Con Variables (Interpolación):
```jsx
<p>{t('auth.profile.welcome', { name: 'Juan' })}</p>
// En archivo JSON:
// "welcome": "Bienvenido {{name}}"
```

### Con Plurales:
```jsx
<span>{count} {t('admin.notificaciones.new', { count })}</span>
// En JSON: "new": "nuevo | nuevos"
```

### Con Atributos HTML:
```jsx
<input placeholder={t('key')} />
<button title={t('key')} />
<img alt={t('key')} />
```

### Con Condicionales:
```jsx
{error && <p>{t('errors.invalid_credentials')}</p>}
{loading && <p>{t('common.cargando')}</p>}
```

### Con Arrays (Opciones de Select):
```jsx
const options = [
  { value: 'es', label: t('common.spanish') },
  { value: 'en', label: t('common.english') },
]
```

---

## 📋 CHECKLIST DE REFACTORIZACIÓN

### Para cada componente:

- [ ] Identificar namespace correcto
- [ ] Agregar `import { useTranslation } from 'react-i18next'`
- [ ] Agregar `const { t } = useTranslation('namespace')`
- [ ] Reemplazar todos los strings hardcodeados
- [ ] Actualizar placeholders
- [ ] Actualizar titles y alt text
- [ ] Actualizar mensajes de error/éxito
- [ ] Verificar interpolaciones (variables dinámicas)
- [ ] Probar ambos idiomas (ES y EN)
- [ ] Verificar que el localStorage persiste el idioma

---

## 🎬 EJEMPLO COMPLETO: Componente Antes/Después

### ANTES (Hardcodeado):
```jsx
import { useState } from 'react'

export default function DocumentList() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleDelete(doc) {
    if (!window.confirm(`¿Eliminar "${doc.titulo}"?`)) return
    setLoading(true)
    // ...
    setLoading(false)
  }

  return (
    <div>
      <h2>Mis documentos</h2>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {documents.length === 0 && <p>No hay documentos disponibles</p>}
      
      <div>
        {documents.map(doc => (
          <div key={doc.id}>
            <h3>{doc.titulo}</h3>
            <p>{new Date(doc.fecha).toLocaleDateString()}</p>
            <button onClick={() => download(doc)}>Descargar</button>
            <button onClick={() => handleDelete(doc)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### DESPUÉS (Traducido):
```jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function DocumentList() {
  const { t } = useTranslation('client')  // ← Namespace específico
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleDelete(doc) {
    if (!window.confirm(t('documentos.confirm_delete', { titulo: doc.titulo }))) return
    setLoading(true)
    // ...
    setLoading(false)
  }

  return (
    <div>
      <h2>{t('documentos.title')}</h2>  {/* ← Traducido */}
      {loading && <p>{t('common.cargando')}</p>}  {/* ← Traducido */}
      {error && <p style={{ color: 'red' }}>{t('errors.generic')}</p>}  {/* ← Traducido */}
      {documents.length === 0 && <p>{t('documentos.no_documents')}</p>}  {/* ← Traducido */}
      
      <div>
        {documents.map(doc => (
          <div key={doc.id}>
            <h3>{doc.titulo}</h3>
            <p>{new Date(doc.fecha).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US')}</p>
            <button onClick={() => download(doc)}>{t('common.descargar')}</button>  {/* ← Traducido */}
            <button onClick={() => handleDelete(doc)}>{t('common.eliminar')}</button>  {/* ← Traducido */}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🔧 PARA MENSAJES DINÁMICOS EN FORMULARIOS

### Validaciones:
```jsx
import { useTranslation } from 'react-i18next'

function LoginForm() {
  const { t } = useTranslation('validation')
  
  function validateEmail(email) {
    if (!email) return t('validation.email_required')
    if (!email.includes('@')) return t('validation.email_invalid')
    return null
  }
}
```

### Errores de API:
```jsx
try {
  await api.post('/login', data)
} catch (err) {
  // Usar traducción de error genérico
  setError(t('errors.server'))
}
```

### Mensajes de Éxito:
```jsx
const { t } = useTranslation('admin')

showSuccess(t('admin.clientes.success_created', { name: 'Juan' }))
// JSON: "success_created": "Cliente \"{{name}}\" creado correctamente"
```

---

## 🎨 PARA COMPONENTES CON ARRAYS/OPCIONES

### Select/Dropdown:
```jsx
const { t } = useTranslation('admin')

const states = [
  { value: 'borrador', label: t('admin.documentos.statuses.borrador') },
  { value: 'publicado', label: t('admin.documentos.statuses.publicado') },
]

return (
  <select>
    {states.map(state => (
      <option key={state.value} value={state.value}>
        {state.label}
      </option>
    ))}
  </select>
)
```

### Radio Buttons:
```jsx
const types = [
  { value: 'contrato', label: t('admin.documentos.types.contrato') },
  { value: 'propuesta', label: t('admin.documentos.types.propuesta') },
  { value: 'informe', label: t('admin.documentos.types.informe') },
]
```

---

## 🌍 CAMBIO DE IDIOMA DESDE CUALQUIER COMPONENTE

```jsx
import { useTranslation } from 'react-i18next'

function LanguageSwitcherButton() {
  const { i18n } = useTranslation()  // ← Solo i18n, sin t
  
  return (
    <button onClick={() => i18n.changeLanguage('en')}>
      English
    </button>
  )
}
```

---

## ⚠️ ERRORES COMUNES A EVITAR

### ❌ INCORRECTO:
```jsx
// Falta namespace
const { t } = useTranslation()  // Usa 'common' por defecto
<h1>{t('admin.clientes.title')}</h1>  // FALLA: no está en 'common'

// Clave incorrecta
<p>{t('documentos.titulo')}</p>  // FALLA: debería ser 'title'

// Namespace duplicado en la clave
const { t } = useTranslation('admin')
<h1>{t('admin.clientes.title')}</h1>  // FALLA: admin está dos veces
```

### ✅ CORRECTO:
```jsx
// Especificar namespace correcto
const { t } = useTranslation('admin')
<h1>{t('clientes.title')}</h1>  // ✅ Correcto

// O usar 'common' para elementos compartidos
const { t } = useTranslation('common')
<button>{t('common.guardar')}</button>  // ✅ Correcto

// Interpolación correcta
<p>{t('intro.welcome', { name: 'Juan' })}</p>  // ✅ Correcto
```

---

## 📊 PROGRESO DE REFACTORIZACIÓN

### Estado Actual (14 Mayo 2026):

```
COMPLETADO ✅
├── Estructura de traducciones (12 archivos JSON)
├── Configuración i18n.js (con namespaces)
├── LanguageSwitcher mejorado
├── Login.jsx refactorizado
└── Admin components (Clientes, Proceso, Documentos, Mensajes, etc.)

PENDIENTE ⏳
├── Componentes cliente adicionales:
│   ├── Inicio.jsx
│   ├── Documentos.jsx (cliente)
│   ├── Proceso.jsx (cliente)
│   ├── Contenido.jsx (cliente)
│   ├── Contacto.jsx
│   └── Configuracion.jsx (cliente)
├── Componentes comunes:
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── Modal.jsx
│   └── Otros...
└── Testing y validación final
```

---

## 📞 SOPORTE

Para preguntas sobre las claves disponibles, consulta:
- **Español:** `frontend/public/locales/es/`
- **English:** `frontend/public/locales/en/`

Cada namespace tiene su propio archivo JSON con todas las claves disponibles.

---

**Documento generado:** 2026-05-14  
**Version i18n:** 1.0.0  
**Status:** Ready for Implementation ✅

