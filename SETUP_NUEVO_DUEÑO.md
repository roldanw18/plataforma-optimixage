# Guía de Instalación y Configuración — Plataforma Optimixage

**Bienvenido.** Este documento le permite levantar la plataforma desde cero, probarla, y luego pasarla a producción con Supabase. Está pensado para que un desarrollador (incluso sin contexto previo del proyecto) pueda dejarlo funcionando en su PC y luego en la nube.

**Tiempo estimado:** 20-30 minutos la primera vez.

---

## Índice

0. [Resumen visual](#0-resumen-visual--qué-vamos-a-hacer)
1. [Pre-requisitos](#1-pre-requisitos)
2. [Clonar el repositorio](#2-clonar-el-repositorio)
3. [Configurar variables de entorno (`.env`)](#3-configurar-variables-de-entorno-env)
4. [Levantar el proyecto con Docker (modo prueba)](#4-levantar-el-proyecto-con-docker-modo-prueba)
5. [Crear usuarios y datos de prueba](#5-crear-usuarios-y-datos-de-prueba)
6. [Dónde se guardan los datos](#6-dónde-se-guardan-los-datos)
7. [Pasar de Postgres local a Supabase (producción)](#7-pasar-de-postgres-local-a-supabase-producción)
8. [Despliegue en la nube (opcional)](#8-despliegue-en-la-nube-opcional)
9. [Comandos del día a día](#9-comandos-del-día-a-día)
10. [Solución de problemas comunes](#10-solución-de-problemas-comunes)
11. [Checklist de seguridad post-instalación](#11-checklist-de-seguridad-post-instalación)
12. [Recursos adicionales](#12-recursos-adicionales)

---

## 0. Resumen visual — qué vamos a hacer

```
PASO 1-4: Arranque local con Docker (prueba)
    │
    │  Backend, Frontend y PostgreSQL corren dentro de Docker
    │  Datos guardados en volumen Docker (su PC, local)
    │
    ▼
PASO 5-6: Probar la app y entender dónde viven los datos
    │
    │  Login admin → crear cliente → crear proyecto
    │  Verificar volumen Docker donde está la BD
    │
    ▼
PASO 7: Migrar a Supabase para producción
    │
    │  Cambia 1 línea del .env (DATABASE_URL)
    │  Datos ahora viven en la nube, con backups automáticos
    │
    ▼
PASO 8 (opcional): Desplegar el backend en la nube
    │
    │  Render / VPS / otra plataforma que soporte Docker
    │
    ▼
   ✅ Plataforma productiva accesible desde internet
```

---

## 1. Pre-requisitos

Solo necesita 2 cosas instaladas en su computador:

| Software | Versión mínima | Descarga |
|---|---|---|
| **Git** | 2.30+ | https://git-scm.com/downloads |
| **Docker Desktop** | 24+ | https://www.docker.com/products/docker-desktop/ |

> **Importante:** no necesita instalar Python ni Node.js — Docker se encarga de todo eso internamente.

Verifique que ambos funcionan abriendo PowerShell (Windows) o Terminal (Mac/Linux):

```bash
git --version
docker --version
docker compose version
```

Las 3 líneas deben devolver una versión sin errores. Si Docker falla, abra **Docker Desktop** y espere a que diga "Engine running" abajo a la izquierda.

---

## 2. Clonar el repositorio

Abra una terminal en la carpeta donde quiera dejar el proyecto y ejecute:

```bash
git clone https://github.com/roldanw18/plataforma-optimixage.git optimixage
cd optimixage
```

> A partir de aquí, **todos los comandos asumen que está dentro de la carpeta `optimixage`**.

---

## 3. Configurar variables de entorno (`.env`)

### 3.1 Qué es y por qué se necesita

El proyecto necesita un archivo `.env` en la raíz con los valores que la app usará para conectarse a la base de datos, firmar tokens, etc. Hay dos archivos relacionados:

| Archivo | ¿En Git? | ¿Para qué sirve? |
|---|---|---|
| `.env.example` | ✅ Sí | **Plantilla pública** con valores placeholder. Es la documentación de qué variables existen. |
| `.env` | ❌ **NO** (en `.gitignore`) | **Sus valores reales**. Vive solo en su PC, nunca se sube a GitHub. |

### 3.2 Generar secretos

Antes de crear el `.env`, genere una clave secreta para firmar los tokens JWT. En PowerShell:

```powershell
# Opción A — con Docker (no necesita Python instalado)
docker run --rm python:3.11-slim python -c "import secrets; print(secrets.token_urlsafe(48))"

# Opción B — con OpenSSL (viene con Git)
openssl rand -base64 48
```

Copie el resultado — lo usará en el siguiente paso como `SECRET_KEY`.

### 3.3 Crear el `.env` (modo prueba local)

Copie la plantilla y ábrala:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
notepad .env
```

**Mac / Linux:**
```bash
cp .env.example .env
nano .env
```

Reemplace el contenido del `.env` por esto (los valores marcados con `← CAMBIAR`):

```env
# =============================================================
# Base de datos — para PRUEBA LOCAL usamos el Postgres del
# docker-compose. Más adelante (sección 7) lo cambiaremos a
# Supabase para producción.
# =============================================================
DATABASE_URL=postgresql://postgres:postgres@db:5432/optimixagedb

# =============================================================
# JWT — clave que firma los tokens de sesión
# =============================================================
SECRET_KEY=PEGUE-AQUÍ-LA-CLAVE-DEL-PASO-3.2          # ← CAMBIAR
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# =============================================================
# CORS — orígenes del frontend que pueden hablar con el backend
# =============================================================
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# =============================================================
# Administrador inicial — solo se crea si la BD está vacía
# (al primer arranque). Después podrá cambiar la contraseña
# desde la propia app.
# =============================================================
BOOTSTRAP_ADMIN_EMAIL=admin@optimixage.com           # ← CAMBIAR si quiere
BOOTSTRAP_ADMIN_PASSWORD=Optimixage2026!             # ← CAMBIAR a algo seguro
BOOTSTRAP_ADMIN_NOMBRE=Administrador

# =============================================================
# Entorno y almacenamiento
# =============================================================
ENVIRONMENT=development
UPLOADS_DIR=uploads

# =============================================================
# Postgres del docker-compose (solo aplica si usa BD local)
# =============================================================
POSTGRES_PASSWORD=postgres
POSTGRES_DB=optimixagedb
POSTGRES_USER=postgres
```

Guarde y cierre. **Importante:** este archivo nunca se sube a Git (está en `.gitignore`). Guárdelo en un lugar seguro localmente.

---

## 4. Levantar el proyecto con Docker (modo prueba)

### 4.1 Asegurar que Docker Desktop esté encendido

Abra Docker Desktop. Espere a que abajo a la izquierda diga **"Engine running"**.

### 4.2 Comando único — levantar todo

Dentro de la carpeta `optimixage`:

```bash
docker compose up --build
```

**Primera vez:** tarda 5-10 minutos porque descarga e instala todo (Postgres, Python + dependencias, Node + build del frontend, Nginx).
**Siguientes veces:** segundos.

### 4.3 Verificar que arrancó bien

Verá muchos logs scrollendo. Cuando se detengan y se vuelvan constantes, busque estas líneas:

```
db-1        | database system is ready to accept connections
backend-1   | INFO:     Uvicorn running on http://0.0.0.0:8000
backend-1   | Rol creado: Admin
backend-1   | Rol creado: Cliente
backend-1   | Usuario admin de bootstrap creado: admin@optimixage.com
frontend-1  | nginx: ready
```

Si las ve, la plataforma está lista.

### 4.4 URLs disponibles

| URL | Qué ver |
|---|---|
| **http://localhost:3000** | La aplicación (pantalla de login) |
| **http://localhost:8000/docs** | Documentación interactiva de la API (Swagger) |
| **http://localhost:8000/health** | `{"status":"ok"}` — verificación rápida |

### 4.5 Primer login

Abra http://localhost:3000 e ingrese:

- **Email:** el que puso en `BOOTSTRAP_ADMIN_EMAIL` (ej. `admin@optimixage.com`)
- **Contraseña:** la que puso en `BOOTSTRAP_ADMIN_PASSWORD` (ej. `Optimixage2026!`)

Si entra al panel admin → todo funciona. Si dice "credenciales incorrectas", revise que el `.env` tenga los valores que está usando para entrar.

---

## 5. Crear usuarios y datos de prueba

### 5.1 Crear un cliente

El sistema **no permite auto-registro**. El admin debe crear cada cliente manualmente:

1. En el sidebar (panel admin), click en **"Clientes"**.
2. Botón **"Nuevo cliente"** (arriba a la derecha).
3. Llene el modal:
   - Nombre: `Cliente Demo`
   - Email: `cliente@demo.com`
   - Password: `Cliente2026!`
4. Click **"Crear"**.

### 5.2 Crear un proyecto y asignárselo

1. En la tarjeta del cliente recién creado → menú (icono `≡` arriba a la derecha) → **"Crear proyecto"**.
2. Llene nombre, descripción, fechas.
3. Click **"Crear proyecto"**.

El proyecto queda asignado al cliente con etapa inicial `primer_contacto`.

### 5.3 Probar como cliente

1. **Logout** (botón abajo en el sidebar).
2. Login con las credenciales del cliente.
3. Verá una interfaz totalmente diferente: módulos **Inicio, Documentos, Proceso, Contenido, Contacto, Configuración**.
4. Si intenta ir a `/admin/clientes` escribiéndolo en la URL → será redirigido automáticamente. Esto valida que el control de acceso por roles funciona.

### 5.4 Otras pruebas recomendadas

- **Cambiar idioma:** selector arriba en el sidebar (ES/EN).
- **Subir documento:** como admin → módulo Documentos → asociar al proyecto del cliente.
- **Cambiar etapa:** como admin → módulo Proceso → seleccionar proyecto → cambiar etapa. El cliente debería recibir una notificación.
- **Chat:** mensajes entre admin y cliente en el módulo correspondiente.

---

## 6. Dónde se guardan los datos

Esta sección es clave para entender qué pasa con los datos que va creando.

### 6.1 En modo local (lo que está haciendo ahora)

```
SU COMPUTADOR
├── C:\...\optimixage\                  ← código del proyecto
│   ├── .env                           ← su configuración local
│   └── uploads/                       ← archivos subidos (PDFs, imágenes)
│
└── Docker Desktop
    └── Volúmenes Docker
        ├── optimixage_postgres_data   ← LA BASE DE DATOS está aquí
        │   └── (archivos PostgreSQL internos)
        └── optimixage_backend_uploads ← copia gestionada de uploads/
```

> Los nombres `optimixage_*` usan el nombre de su carpeta como prefijo. Si clonó a otra carpeta, los prefijos cambian.

### 6.2 Cómo verificar los volúmenes desde la terminal

```bash
# Listar volúmenes del proyecto
docker volume ls | findstr optimixage    # Windows
docker volume ls | grep optimixage       # Mac/Linux

# Ver detalles de uno
docker volume inspect optimixage_postgres_data
```

### 6.3 Persistencia entre reinicios

| Acción | ¿Se borran los datos? |
|---|---|
| Cerrar la terminal con `Ctrl+C` | ❌ No, los contenedores siguen vivos en background |
| `docker compose stop` | ❌ No, solo pausa los contenedores |
| `docker compose down` | ❌ No, elimina contenedores pero **los volúmenes se conservan** |
| `docker compose down -v` | ✅ **Sí, elimina volúmenes** — empieza desde cero |
| Apagar la PC | ❌ No, sigue todo al reencender Docker |

### 6.4 Cada PC tiene su propia BD

Si otra persona clona el repositorio y ejecuta `docker compose up`:
- En su computador se crea un volumen Postgres SEPARADO.
- **No comparten datos.** Cada quien ve solo su propia BD local.
- Esto es lo deseado para desarrollo: pruebas aisladas.

Para que múltiples personas vean los mismos datos (clientes reales, proyectos reales) → debe pasar a Supabase (sección 7).

---

## 7. Pasar de Postgres local a Supabase (producción)

Cuando quiera usar la plataforma "en serio" con sus clientes reales, debe sustituir el Postgres local por una base de datos en la nube. Recomendamos **Supabase** porque ya está soportado por el proyecto y es gratis para empezar.

### 7.1 Por qué Supabase para producción

| Postgres local (Docker) | Supabase |
|---|---|
| Datos solo en SU PC | Datos en la nube, accesibles desde cualquier despliegue |
| Sin backups automáticos | Backups diarios automáticos (free tier) |
| Si la PC se daña, se pierden datos | Datos protegidos en infraestructura AWS |
| No escala a múltiples instancias | Soporta múltiples backends conectados simultáneamente |
| Sin dashboard administrativo | Dashboard web para ver tablas, ejecutar SQL, gestionar accesos |

### 7.2 Crear o usar el proyecto Supabase

**Si ya tiene un proyecto Supabase de Optimixage:**
- Entre a https://supabase.com/dashboard
- Use el proyecto existente.

**Si no, créelo nuevo:**
1. https://supabase.com → cree cuenta (gratis, login con GitHub o correo).
2. Cree una organización llamada "Optimixage" (o como prefiera).
3. **New Project** dentro de esa organización.
4. Nombre del proyecto: `optimixage-prod` (o lo que prefiera).
5. Genere una password fuerte para la BD — **guárdela en un lugar seguro, solo se muestra una vez**.
6. Region: elija la más cercana a sus clientes (ej. `us-east-1` para Latinoamérica).
7. Espere ~2 minutos mientras Supabase provisiona el Postgres.

### 7.3 Resetear la password (recomendado)

Por seguridad, si recibió el proyecto de manos de otro desarrollador:

1. **Settings → Database → "Reset database password"**.
2. Genere una nueva password. Cópiela y guárdela.

Esto invalida cualquier credencial anterior.

### 7.4 Obtener la connection string

1. En su proyecto Supabase → arriba a la derecha, botón **"Connect"**.
2. Pestaña **"Connection string"**.
3. Seleccione **"Transaction pooler"** (recomendado para servicios web — puerto 6543).
4. Verá algo como:

   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
   ```

5. Reemplace `[YOUR-PASSWORD]` por la password real que generó en el paso 7.3.

### 7.5 Cambiar el `.env`

Abra su `.env` y modifique **solo la línea `DATABASE_URL`**:

```env
# Antes (Postgres local del Docker)
DATABASE_URL=postgresql://postgres:postgres@db:5432/optimixagedb

# Después (Supabase)
DATABASE_URL=postgresql://postgres.SU-PROJECT-REF:SU-PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

El resto del archivo queda igual.

### 7.6 Reiniciar y verificar

```bash
docker compose down
docker compose up --build
```

En los logs busque:

```
backend-1 | INFO:     Iniciando aplicacion en entorno 'development'
backend-1 | Rol creado: Admin       ← solo aparece la primera vez
backend-1 | Rol creado: Cliente
```

Si aparece sin errores de conexión, el backend ya está hablando con Supabase. Pruebe entrar a http://localhost:3000 — verá la app, pero **vacía** (la BD de Supabase está limpia, no comparte datos con el Postgres local de antes).

### 7.7 Dónde viven los datos ahora

```
SU COMPUTADOR
├── optimixage\                          ← código (sin cambios)
│   └── .env                            ← apunta a Supabase
│
└── Docker Desktop
    └── optimixage_postgres_data        ← este volumen quedó sin uso
                                           (puede borrarlo si quiere)

NUBE (Supabase, infraestructura AWS)
└── Proyecto Supabase de Optimixage
    └── Postgres con TODAS las tablas y datos
        └── Backup automático diario
```

Los datos ya **no están en su PC** — están en la nube. Si otra persona configura su propio `.env` con la misma `DATABASE_URL`, verá exactamente los mismos datos. Esto es lo que permite trabajo colaborativo y despliegue en producción.

### 7.8 (Opcional) Borrar el volumen Postgres local

Si está seguro que ya no necesita los datos de prueba locales:

```bash
docker volume rm optimixage_postgres_data
```

Esto libera ~50-100 MB de su disco. Si en el futuro vuelve a `DATABASE_URL=postgresql://postgres:postgres@db:5432/optimixagedb`, Docker creará el volumen de nuevo, vacío.

---

## 8. Despliegue en la nube (opcional)

Si quiere que la plataforma sea accesible desde internet sin tener su PC encendida, tiene varias opciones.

### Opción A — Render (la incluida por defecto en el repo)

El repositorio contiene un archivo `render.yaml` listo para usar:

1. Cree cuenta en https://render.com → login con GitHub (gratis).
2. Dashboard → **New → Blueprint** → seleccione el repositorio.
3. Render detectará el `render.yaml` y le pedirá 3 secretos:
   - `DATABASE_URL` → la connection string de Supabase del paso 7.4
   - `SECRET_KEY` → la del paso 3.2
   - `BOOTSTRAP_ADMIN_PASSWORD` → la del paso 3.3
4. **Apply** → en 5-8 minutos tendrá 2 URLs públicas: una para la app y otra para el backend.

> **Si Render rechaza el nombre** porque el subdominio ya está tomado (`optimixage-plataforma.onrender.com` es first-come-first-served), edite `render.yaml` antes del paso 2 y cambie las 3 referencias por un nombre único como `mi-empresa-app`.

**Costo:** free tier suficiente para demos. ~$7/mes si quiere que el backend no se duerma tras 15 min de inactividad.

### Opción B — VPS propio (Hetzner, DigitalOcean, AWS, etc.)

Cualquier servidor con Docker instalado puede correr el proyecto:

```bash
ssh su-servidor
git clone https://github.com/roldanw18/plataforma-optimixage.git
cd plataforma-optimixage
# Cree el .env igual que en el paso 3.3 (con la DATABASE_URL de Supabase)
docker compose up -d --build
```

Acceso por la IP del servidor (`http://203.0.113.45:3000`) o configure un dominio.

### Opción C — Otros (Railway, Fly.io, AWS ECS, Azure, GCP)

Cualquier proveedor que soporte Docker funcionará. El Manual Técnico ([MANUAL_TECNICO_INTEGRAL.md](MANUAL_TECNICO_INTEGRAL.md)) tiene la sección §12 con detalles.

---

## 9. Comandos del día a día

| Acción | Comando |
|---|---|
| Levantar todo en foreground (ver logs) | `docker compose up --build` |
| Levantar en background | `docker compose up -d --build` |
| Ver logs en vivo del backend | `docker compose logs -f backend` |
| Ver logs en vivo de la BD | `docker compose logs -f db` |
| Apagar todo (mantener datos) | `docker compose down` |
| Apagar y **borrar todos los datos** | `docker compose down -v` |
| Entrar a una shell del backend | `docker compose exec backend bash` |
| Entrar al Postgres local | `docker compose exec db psql -U postgres -d optimixagedb` |
| Ver el estado de los servicios | `docker compose ps` |
| Reconstruir solo el backend | `docker compose up -d --build backend` |
| Actualizar a la última versión (git) | `git pull && docker compose up -d --build` |

---

## 10. Solución de problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `docker compose up` se queda en "waiting for db" | Postgres aún no listo, o puerto 5432 ocupado | Esperar 10s. Si persiste, cambiar puerto en `docker-compose.yml` |
| Frontend abre pero login devuelve "credenciales incorrectas" | El `.env` que estaba al primer arranque tenía otra contraseña | Apagar (`docker compose down -v`), corregir `.env`, levantar de nuevo |
| Frontend dice "Error de red" o muestra CORS error en consola | `CORS_ORIGINS` no incluye la URL del frontend | Agregar la URL exacta a `CORS_ORIGINS` en el `.env`, reiniciar backend |
| Cambio el `.env` pero el backend no reacciona | Las variables se leen solo al arranque | `docker compose restart backend` |
| Conexión a Supabase falla con "password authentication failed" | Password incorrecta en `DATABASE_URL` | Resetear password en Supabase Dashboard, actualizar `.env` |
| Conexión a Supabase falla con "connection timeout" | Firewall corporativo bloquea puerto 6543 | Probar con puerto 5432 (Session pooler) o desde otra red |
| El frontend muestra estilos rotos / página en blanco | El build de Vite falló durante `docker compose up` | Revisar logs: `docker compose logs frontend` |
| Cobertura de tests CI baja del 60% | Tests fallaron o se removieron sin reemplazo | Correr local: `docker compose exec backend pytest --cov=app` |
| `git pull` da merge conflicts en `.env` | (No debería pasar — `.env` está en `.gitignore`) | Verificar `.gitignore` |

Para más diagnóstico:

```bash
# Healthcheck del backend
curl http://localhost:8000/health

# Ver últimos 50 logs de cada servicio
docker compose logs --tail=50

# Reiniciar todo desde cero (borra datos)
docker compose down -v
docker compose up --build
```

---

## 11. Checklist de seguridad post-instalación

Marque cada item al desplegar a producción:

- [ ] `SECRET_KEY` generada con `secrets.token_urlsafe(48)` (no usar el placeholder)
- [ ] `BOOTSTRAP_ADMIN_PASSWORD` cambiada al primer login (desde Configuración → Perfil)
- [ ] Password de Supabase reseteada (Settings → Database → Reset password)
- [ ] `ENVIRONMENT=production` en el `.env` (activa cabeceras HSTS)
- [ ] `CORS_ORIGINS` contiene solo dominios reales (sin `*` ni `http://localhost`)
- [ ] `.env` nunca subido a GitHub (`git status` no debe mostrarlo)
- [ ] Backups de Supabase verificados activos (Dashboard → Database → Backups)
- [ ] Acceso a la organización Supabase limitado al equipo autorizado
- [ ] Usuario admin inicial cambió su contraseña

---

## 12. Recursos adicionales

| Recurso | Para qué sirve |
|---|---|
| [README.md](README.md) | Guía de instalación rápida (versión corta) |
| [MANUAL_TECNICO_INTEGRAL.md](MANUAL_TECNICO_INTEGRAL.md) | Documentación técnica completa de 20 secciones (arquitectura, BD, APIs, seguridad, mantenimiento) |
| [INFORME_PRACTICA_Y_SUSTENTACION.md](INFORME_PRACTICA_Y_SUSTENTACION.md) | Informe académico del desarrollo |
| [docs/sprint1/](docs/sprint1/) | Documentación de cada sprint con decisiones técnicas |
| `http://localhost:8000/docs` | Swagger UI — documentación interactiva de la API |
| `docker compose logs -f backend` | Logs en vivo del backend para debugging |

---

## Resumen visual del flujo completo

```
   ┌──────────────────────────────────────────────────────────┐
   │  1. git clone + cd optimixage                            │
   └─────────────────────────┬────────────────────────────────┘
                             │
   ┌─────────────────────────▼────────────────────────────────┐
   │  2. Crear .env con secrets generados                     │
   │     (DATABASE_URL apuntando al Postgres del compose)     │
   └─────────────────────────┬────────────────────────────────┘
                             │
   ┌─────────────────────────▼────────────────────────────────┐
   │  3. docker compose up --build                            │
   │     → Plataforma corriendo en localhost:3000             │
   │     → Datos en volumen Docker local                      │
   └─────────────────────────┬────────────────────────────────┘
                             │
   ┌─────────────────────────▼────────────────────────────────┐
   │  4. Probar: admin → crear cliente → crear proyecto       │
   │            → cliente → ver su proyecto                   │
   └─────────────────────────┬────────────────────────────────┘
                             │
                             │  ¿Listo para producción?
                             │
   ┌─────────────────────────▼────────────────────────────────┐
   │  5. Crear proyecto Supabase + resetear password          │
   └─────────────────────────┬────────────────────────────────┘
                             │
   ┌─────────────────────────▼────────────────────────────────┐
   │  6. Cambiar DATABASE_URL en .env                         │
   │     docker compose down && docker compose up --build     │
   │     → Datos ahora en la nube, con backups                │
   └─────────────────────────┬────────────────────────────────┘
                             │
   ┌─────────────────────────▼────────────────────────────────┐
   │  7. (Opcional) Desplegar backend en Render / VPS         │
   │     → Plataforma accesible desde internet                │
   └──────────────────────────────────────────────────────────┘
```

---

**Cualquier duda, consulte el Manual Técnico Integral o abra un issue en el repositorio.**
