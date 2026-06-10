# Sprint Mejoras — Resumen Técnico

Fecha: 2026-05-08
Versión backend: 3.0.0

Este documento resume las cuatro funcionalidades implementadas en este sprint,
las decisiones técnicas tomadas, los problemas detectados y las mejoras futuras
recomendadas.

---

## 1. Análisis previo de la arquitectura

### Stack actual encontrado

- **Backend**: FastAPI 0.115 + SQLAlchemy 2.0 + Alembic + JWT (`python-jose`).
  La base de datos por defecto es SQLite (`optimixage.db`), pero la cadena
  `DATABASE_URL` permite conectar a PostgreSQL/Supabase.
- **Frontend**: React (Vite) + Axios + react-router-dom + lucide-react.
  El cliente HTTP usa `/api` como `baseURL` y Vite proxiona ese prefijo al
  backend en desarrollo.
- **Autenticación**: JWT con `OAuth2PasswordBearer`. Existe `require_role("Admin")`
  que sirvió para todos los endpoints administrativos nuevos.
- **Almacenamiento**: subida de documentos vía endpoint custom
  (`/documentos/upload`) que persiste en `backend/uploads/<proyecto_id>/`.
  No existía un mount de StaticFiles, los archivos se sirven con
  `FileResponse` y validación de path.

### Convenciones detectadas y respetadas

- Routers en `app/api/*_router.py`, modelos en `app/models/`, schemas en
  `app/schemas/`. Cada router se incluye en `app/main.py`.
- Estilos UI inline (no CSS modules ni Tailwind extensivo): se mantuvo el
  mismo lenguaje visual (azul `#0099cc`, marino `#0a0a4e`, radios 8–12 px).
- Validación de uploads por extensión + tamaño máximo + nombre seguro
  (`uuid4`).
- Frontend usa `api` (instancia axios) que añade `Authorization` automáticamente.

---

## 2. Funcionalidades agregadas

### 2.1 Gestión dinámica de contenido (videos/imágenes)

**Objetivo**: el admin sube imágenes o videos desde su panel y los clientes
autenticados los ven automáticamente al final de su pantalla de Inicio.

**Backend nuevo**:

| Archivo | Descripción |
| --- | --- |
| `app/models/contenido.py` | Modelo `Contenido` (id, titulo, descripcion, tipo, url, creado_por, created_at, updated_at) |
| `app/schemas/contenido_schema.py` | `ContenidoCreate`, `ContenidoUpdate`, `ContenidoResponse` |
| `app/api/contenidos_router.py` | CRUD + serving de archivos |

**Endpoints** (registrados bajo `/contenidos`):

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/contenidos/upload` | Admin | Multipart con `titulo`, `descripcion`, `tipo` (`imagen`/`video`) y `archivo` |
| `GET`  | `/contenidos/` | Cualquier autenticado | Lista todo el contenido publicado (orden desc) |
| `GET`  | `/contenidos/file/{filename}` | Autenticado | Sirve el archivo físico (usa `FileResponse` con verificación de path) |
| `PATCH`| `/contenidos/{id}` | Admin | Edita título y descripción |
| `DELETE`| `/contenidos/{id}` | Admin | Elimina registro y archivo en disco |

**Validaciones**:

- Imágenes: `.png .jpg .jpeg .gif .webp .svg` · máx 10 MB.
- Videos: `.mp4 .webm .ogg .mov .avi .mkv` · máx 200 MB.
- `tipo` debe ser `imagen` o `video`.

**Almacenamiento**: `backend/uploads/contenidos/<uuid4>.<ext>`. La URL guardada
en BD es relativa (`/contenidos/file/<safe_name>`) — esto desacopla de cambios
de host y se prefija con `/api` desde el frontend.

**Frontend**:

- `frontend/src/pages/admin/Contenido.jsx`: rediseñado con CRUD completo —
  formulario de subida (selector imagen/video), grid de tarjetas con previsualización,
  botones Editar/Eliminar/Previsualizar y modales de preview/edit.
- `frontend/src/pages/cliente/Inicio.jsx`: nueva sección al final que renderiza
  imágenes inline y videos con controles HTML5. Layout responsive con
  `auto-fill, minmax(260px, 1fr)`.

### 2.2 Selector de proyectos con propietario en Documentos

**Antes**: el admin solo veía el nombre del proyecto en el `<select>`.

**Después**: el `<option>` muestra `Proyecto Alpha — Juan Pérez` y, debajo del
selector, un texto `Propietario: Juan Pérez · juan@empresa.com`.

**Backend**: no requirió cambios. El endpoint `/proyectos/admin/todos` ya
devolvía `ProyectoAdminResponse` con un campo `cliente: { id, nombre, email, avatar_url }`.

**Frontend** (`frontend/src/pages/admin/Documentos.jsx`):

- Helper `labelProyecto(p)` que formatea el option.
- Bloque informativo con datos del propietario debajo del select.
- Si el proyecto no tiene cliente, muestra `— sin asignar`.

### 2.3 Avatar desde archivo local

**Objetivo**: subir el avatar desde un archivo del disco con previsualización
y validación, manteniendo la compatibilidad con URLs externas existentes.

**Backend**:

- `POST /usuarios/me/avatar` — multipart con `archivo`. Valida formato
  (`.png .jpg .jpeg .gif .webp`), tamaño (5 MB máx), borra el archivo previo
  si era local, guarda en `uploads/avatars/{user_id}_{rand}.<ext>` y actualiza
  `usuarios.avatar_url` con la ruta relativa (`/usuarios/avatar/<safe_name>`).
- `GET /usuarios/avatar/{filename}` — endpoint público (no requiere auth, igual
  que un CDN) que sirve el archivo con `FileResponse`.

**Frontend**:

- Nuevo componente reutilizable: `frontend/src/components/common/AvatarUploader.jsx`.
  - Subida desde archivo local con previsualización (`FileReader`).
  - Modo alternativo "Usar URL" para mantener compatibilidad.
  - Exporta también `resolveAvatarUrl(url)` para resolver paths relativos
    contra `/api`.
- Páginas integradas:
  - `frontend/src/pages/cliente/Configuracion.jsx`
  - `frontend/src/pages/admin/Configuracion.jsx`
- Lugares donde se renderiza el avatar y que se actualizaron para usar
  `resolveAvatarUrl`:
  - `frontend/src/pages/admin/Clientes.jsx`
  - `frontend/src/pages/admin/Proceso.jsx`
  - `frontend/src/pages/admin/Notificaciones.jsx`

### 2.4 Sistema de programación de reuniones

**Objetivo**: convertir el modelo `Reunion` (que ya existía pero solo
exponía POST/GET/DELETE básicos) en un sistema completo con estados,
filtrado por cliente, edición y vistas tanto para admin como cliente.

**Cambios al modelo `Reunion`**:

```python
estado = Column(String, nullable=False, default="pendiente")
# estados: pendiente | confirmada | cancelada | completada
updated_at = Column(DateTime(timezone=True), ...)
```

Para evitar romper el dev sin alembic, en `lifespan` se agrega
`_ensure_schema_actualizado()` que llama a `Base.metadata.create_all()` y, si
faltan, ejecuta `ALTER TABLE reuniones ADD COLUMN estado/updated_at`. En
producción se incluyó la migración Alembic
`d3e4f5a6b7c8_contenidos_y_reunion_estado.py`.

**Endpoints de reuniones**:

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST`  | `/reuniones/` | Admin | Crear (incluye `estado` opcional) |
| `GET`   | `/reuniones/proyecto/{proyecto_id}` | Autenticado | Lista por proyecto |
| `GET`   | `/reuniones/cliente/{cliente_id}` | Admin | **NUEVO** — agrupa todas las reuniones de los proyectos del cliente |
| `GET`   | `/reuniones/mias` | Autenticado | **NUEVO** — reuniones del usuario actual como cliente |
| `PATCH` | `/reuniones/{id}` | Admin | **NUEVO** — edita campos y/o estado |
| `DELETE`| `/reuniones/{id}` | Admin | Elimina |

**Frontend admin** (`frontend/src/pages/admin/Clientes.jsx`):

- En el menú contextual de cada cliente se agregó la opción
  **"Programar reunión"** (junto a "Crear proyecto").
- Nuevo componente `frontend/src/components/admin/ReunionesClienteModal.jsx`:
  - Lista todas las reuniones del cliente, separadas en **Próximas** y **Pasadas**.
  - Botón "Nueva reunión" → formulario con todos los campos del modelo.
  - Acciones por fila: Editar, Cancelar (cambia estado), Eliminar.
  - Validación de proyecto requerido (si el cliente no tiene proyectos,
    muestra mensaje y deshabilita el botón).
  - Usa `datetime-local` para el input y convierte a/desde ISO automáticamente.

**Frontend cliente** (`frontend/src/pages/cliente/Proceso.jsx`):

- Nueva sección `ReunionesSection` con badge de estado, fecha+hora con un
  pequeño calendario visual, descripción y botón **"Unirse a la reunión"**
  cuando hay enlace y la reunión no está cancelada.
- Separa próximas vs anteriores; las pasadas se muestran con opacidad
  reducida.

---

## 3. Decisiones técnicas

| Decisión | Justificación |
| --- | --- |
| URLs relativas en BD (`/contenidos/file/...`, `/usuarios/avatar/...`) | Desacoplar del dominio. El frontend prefija `/api` automáticamente, igual que con `/documentos/download/`. |
| `ALTER TABLE` automático en `lifespan` para columnas nuevas de `reuniones` | Permite seguir desarrollando con SQLite sin pasos manuales. En producción se debe usar la migración Alembic. |
| `Base.metadata.create_all()` además de la migración | Crea automáticamente la tabla `contenidos` en dev. Idempotente, no afecta tablas existentes. |
| `AvatarUploader` con dos modos (archivo + URL) | Mantiene retrocompatibilidad con avatares que ya estaban guardados como URL externa. |
| Endpoint avatar **sin** autenticación | Las imágenes se cargan desde `<img>` que no envía el header `Authorization`. Si se quiere proteger, se debe usar tokens en query params o servir vía `/api/usuarios/avatar` con cookies. |
| Endpoint contenidos `file/...` **con** autenticación | Mantiene la restricción "solo usuarios autenticados ven contenido", coherente con el requisito. Como el frontend ya envía el token en `axios`, funciona vía proxy. |
| `mias` y `cliente/{id}` agregados en lugar de filtros con `?cliente_id=` | Más explícito y permite documentación clara en OpenAPI. |
| Separación de `crear` vs `actualizar` en `ReunionesClienteModal` | Un único formulario reusado para ambos modos vía la prop `inicial`. |

---

## 4. Problemas detectados durante el análisis

1. **`AdminContenido.jsx` original era estático**: contenía un array hardcodeado.
   Se reemplazó completamente respetando el mismo grid 3 columnas y el botón
   play.
2. **Las URLs de avatar estaban guardadas como strings absolutos**: en cuanto se
   subía un avatar local, los lugares que renderizaban `<img src={user.avatar_url}>`
   no apuntaban a `/api/...` y se rompía la imagen. Se centralizó con
   `resolveAvatarUrl`.
3. **El endpoint `/usuarios/avatar/{filename}` sin autenticación**: decisión
   consciente — los `<img>` no envían `Authorization`. Se documenta como
   posible mejora futura (firmar URLs).
4. **El campo `lugar` en `Proceso.jsx` cliente** se referenciaba pero nunca
   existió en el modelo `Reunion`. Sigue siendo un acceso seguro (devuelve
   `undefined`), pero se aprovechó la migración para reemplazar la lógica
   con campos reales (`titulo`, `duracion_minutos`, `enlace`, `descripcion`).
5. **Sin Static Files mount en FastAPI**: todos los archivos se sirven con
   `FileResponse` y validación. Funciona, pero aumenta superficie de código.
   Ver mejoras futuras.

---

## 5. Mejoras futuras recomendadas

### Seguridad

- **URLs firmadas para avatares y contenido**: usar tokens efímeros (JWT) en
  query string para que los `<img>`/`<video>` puedan autenticarse sin cookies.
- **Antivirus / sanitización**: para uploads de video/imagen agregar
  ClamAV o un servicio en la nube antes de persistir.
- **Limit de uploads por usuario**: hoy un admin puede subir N videos sin
  límite. Agregar quota.
- **Compresión / thumbnailing**: cuando se sube una imagen grande, generar
  variantes con `Pillow` (thumbnail 320 px y full size).

### Rendimiento

- **Streaming en videos**: hoy se devuelve el video con `FileResponse`. Para
  archivos grandes, soportar `Range` requests permitirá scrubbing en clientes
  con conexión limitada.
- **CDN / S3**: mover `uploads/` a un bucket S3 / Supabase Storage. Hoy todo
  vive en disco junto con el contenedor del backend, lo que no escala
  horizontalmente.

### UX

- **Drag & drop** en `Contenido.jsx` y `AvatarUploader.jsx` (hoy es solo clic).
- **Notificación al cliente** cuando se programa o cambia una reunión: ya
  existe el modelo `Notificacion`, falta crear la notificación dentro del
  endpoint `POST /reuniones/`.
- **Calendario visual** en Proceso → reuniones (vista mensual).
- **Sincronización con Google/Outlook Calendar**: generar `.ics` o usar
  Google Calendar API con OAuth (los MCPs de Google Calendar ya están
  disponibles en el entorno).

### Arquitectura

- **Static files mount**: en `main.py`, agregar
  `app.mount("/static", StaticFiles(directory="uploads"), name="static")`
  y servir avatares públicos directamente desde nginx en producción.
- **Tests de integración**: ningún módulo nuevo tiene tests. Replicar el
  patrón de `backend/tests/` para reuniones (CRUD + estados) y contenidos.
- **Frontend hooks**: extraer la lógica repetida de "cargar lista + alertas
  + saving" a hooks (`useResource`).

---

## 6. Archivos modificados / creados

### Backend (creados)

```
backend/app/models/contenido.py
backend/app/schemas/contenido_schema.py
backend/app/api/contenidos_router.py
backend/alembic/versions/d3e4f5a6b7c8_contenidos_y_reunion_estado.py
```

### Backend (modificados)

```
backend/app/main.py                 # router contenidos + auto-migración
backend/app/core/database.py        # import Contenido
backend/app/models/reunion.py       # estado + updated_at
backend/app/schemas/reunion_schema.py # ReunionUpdate + estado en response
backend/app/api/reuniones_router.py # PATCH, /cliente/{id}, /mias
backend/app/api/usuarios_router.py  # POST /me/avatar + GET /avatar/{f}
```

### Frontend (creados)

```
frontend/src/components/common/AvatarUploader.jsx
frontend/src/components/admin/ReunionesClienteModal.jsx
```

### Frontend (modificados)

```
frontend/src/pages/admin/Contenido.jsx       # CRUD completo
frontend/src/pages/admin/Documentos.jsx      # select con propietario
frontend/src/pages/admin/Configuracion.jsx   # AvatarUploader
frontend/src/pages/admin/Clientes.jsx        # menú "Programar reunión"
frontend/src/pages/admin/Proceso.jsx         # resolveAvatarUrl
frontend/src/pages/admin/Notificaciones.jsx  # resolve avatar
frontend/src/pages/cliente/Inicio.jsx        # sección contenido dinámico
frontend/src/pages/cliente/Proceso.jsx       # ReunionesSection completa
frontend/src/pages/cliente/Configuracion.jsx # AvatarUploader
```

---

## 7. Cómo probar

```bash
# Backend
cd backend
# (opcional) aplicar migracion alembic en produccion
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

1. Login como admin (credenciales bootstrap del `.env`).
2. **Contenido**: ir a Panel Admin → Contenido. Subir una imagen y un video.
   Verificar previsualización, edición y eliminación.
3. **Documentos**: ir a Panel Admin → Documentos. Verificar que el select muestra
   "Nombre — usuario" y la línea de propietario debajo.
4. **Reuniones**: ir a Panel Admin → Clientes → menú de un cliente con proyecto →
   "Programar reunión". Crear reunión con varios estados.
5. **Avatar**: Configuración → Información personal. Subir archivo desde
   computador, verificar previsualización y guardar.
6. Login como cliente:
   - **Inicio**: scroll hasta el final, ver sección "Contenido" con los
     videos/imágenes subidos por el admin.
   - **Proceso**: sección "Reuniones" muestra próximas/pasadas con estado y
     botón de unirse cuando hay enlace.
