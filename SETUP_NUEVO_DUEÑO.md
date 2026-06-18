# Guía de Configuración para el Nuevo Dueño del Proyecto

**Bienvenido a la Plataforma de Seguimiento de Proyectos de Optimixage.**

Este documento le guía paso a paso para tomar control completo del proyecto: generar sus propios secretos, configurar la base de datos a su nombre, y levantar el sistema en su infraestructura.

Tiempo estimado: **20-30 minutos** la primera vez.

---

## Índice

1. [Pre-requisitos](#1-pre-requisitos)
2. [Clonar el repositorio](#2-clonar-el-repositorio)
3. [Tomar control de la base de datos (Supabase)](#3-tomar-control-de-la-base-de-datos-supabase)
4. [Generar sus propios secretos](#4-generar-sus-propios-secretos)
5. [Configurar variables de entorno](#5-configurar-variables-de-entorno)
6. [Levantar el sistema localmente con Docker](#6-levantar-el-sistema-localmente-con-docker)
7. [Desplegar en la nube (opcional)](#7-desplegar-en-la-nube-opcional)
8. [Primer login y cambio de contraseña admin](#8-primer-login-y-cambio-de-contraseña-admin)
9. [Soporte y documentación adicional](#9-soporte-y-documentación-adicional)

---

## 1. Pre-requisitos

Necesitará tener instalado en su computador:

| Software | Versión mínima | Descarga |
|---|---|---|
| **Git** | 2.30+ | https://git-scm.com/downloads |
| **Docker Desktop** | 24+ | https://www.docker.com/products/docker-desktop/ |

Eso es todo. Docker incluye todo lo necesario para correr la base de datos, backend y frontend sin instalar Python ni Node.

---

## 2. Clonar el repositorio

Abra una terminal (PowerShell en Windows, Terminal en Mac/Linux) y ejecute:

```bash
git clone https://github.com/roldanw18/plataforma-optimixage.git optimixage
cd optimixage
```

A partir de aquí, todos los comandos asumen que está dentro de la carpeta `optimixage`.

---

## 3. Tomar control de la base de datos (Supabase)

El proyecto usa **Supabase** (PostgreSQL gestionado en la nube) como base de datos.

### 3.1 Recibir la transferencia del proyecto

El desarrollador anterior le transferirá un proyecto Supabase ya configurado con todas las tablas y datos. Para recibirlo:

1. Cree cuenta en https://supabase.com (gratis).
2. Cree una organización (Dashboard → arriba a la izquierda → **New organization** → nombre: "Optimixage" o similar).
3. Pase el nombre/slug de la organización al desarrollador para que inicie la transferencia.
4. Acepte la transferencia desde su dashboard.

Una vez aceptada, el proyecto aparecerá en su lista.

### 3.2 Resetear la password de la base de datos

**Paso crítico de seguridad.** La password actual es conocida por el desarrollador anterior y debe rotarla:

1. Entre a su proyecto en Supabase Dashboard.
2. **Settings → Database → "Reset database password"**.
3. Genere una nueva password segura. **Cópiela y guárdela** — solo se muestra una vez.

### 3.3 Obtener la connection string

1. En el mismo Supabase Dashboard → arriba a la derecha → botón **"Connect"**.
2. Pestaña **"Connection string"** → seleccione **"Transaction pooler"** (recomendado para servicios web).
3. Copie la cadena, que se ve así:

   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
   ```

4. Reemplace `[YOUR-PASSWORD]` por la password que generó en el paso 3.2.

Esa cadena completa será su **`DATABASE_URL`**. La usará en el siguiente paso.

---

## 4. Generar sus propios secretos

Además de la password de la base de datos, necesita generar:

### 4.1 SECRET_KEY (clave de firma de JWT)

Esta clave firma los tokens de sesión. Genere una nueva ejecutando en una terminal Python:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Si no tiene Python instalado, puede usar este comando con OpenSSL (viene con Git):

```bash
openssl rand -base64 48
```

O simplemente generar una cadena aleatoria larga (mínimo 32 caracteres, recomendado 48+).

Guarde el resultado — lo usará en el archivo `.env`.

### 4.2 Password inicial del administrador

Elija una contraseña segura para el usuario administrador inicial. Por ejemplo: `Optimix@ge2026!`

Esta es la contraseña con la que entrará la primera vez al sistema. **La podrá cambiar desde la app** una vez logueado.

---

## 5. Configurar variables de entorno

El proyecto necesita un archivo `.env` en la raíz con los secretos. Hay una plantilla incluida:

```bash
# Copie la plantilla
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Abra el archivo `.env` con un editor de texto (Notepad, VS Code, etc.) y rellene los valores con los que generó:

```env
# --- Base de datos ---
DATABASE_URL=postgresql://postgres.SU-PROJECT-REF:SU-PASSWORD-NUEVA@aws-1-us-east-1.pooler.supabase.com:6543/postgres

# --- JWT (autenticación) ---
SECRET_KEY=la-secret-key-que-genero-en-el-paso-4.1
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# --- CORS (orígenes permitidos del frontend) ---
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# --- Administrador inicial (se crea solo si la BD está vacía) ---
BOOTSTRAP_ADMIN_EMAIL=admin@optimixage.com
BOOTSTRAP_ADMIN_PASSWORD=su-password-segura-del-paso-4.2
BOOTSTRAP_ADMIN_NOMBRE=Administrador

# --- Entorno ---
ENVIRONMENT=production

# --- Almacenamiento ---
UPLOADS_DIR=uploads
```

**Importante:**
- Nunca suba este archivo `.env` a Git (ya está en `.gitignore`).
- Guarde una copia segura en un gestor de contraseñas o lugar protegido.

---

## 6. Levantar el sistema localmente con Docker

Con el `.env` listo, ejecute:

```bash
docker compose up --build
```

La primera vez tarda 5-10 minutos (descarga imágenes y compila). Las siguientes veces, segundos.

Cuando vea los logs estables, abra el navegador:

- **Frontend (la app):** http://localhost:3000
- **Backend API (Swagger docs):** http://localhost:8000/docs

Para detener: presione `Ctrl+C` en la terminal.
Para levantar en segundo plano: `docker compose up -d --build`.
Para apagar (segundo plano): `docker compose down`.

---

## 7. Desplegar en la nube (opcional)

Si quiere que la plataforma esté disponible para sus clientes desde internet sin tener su PC encendida, tiene varias opciones:

### Opción A — Render (la incluida por defecto)

El repositorio contiene un archivo `render.yaml` listo para usar:

1. Cree cuenta en https://render.com → login con GitHub.
2. Dashboard → **New → Blueprint** → seleccione el repositorio.
3. Render detectará el `render.yaml` y pedirá 3 secretos: `DATABASE_URL`, `SECRET_KEY`, `BOOTSTRAP_ADMIN_PASSWORD`.
4. Pegue los valores de su `.env`.
5. **Apply** → en 5-8 minutos tendrá 2 URLs públicas: una para la app y otra para el backend.

Costo: free tier suficiente para demos. ~$7/mes si quiere que el backend no se duerma tras 15 min de inactividad.

### Opción B — VPS propio (Hetzner, DigitalOcean, AWS, etc.)

Cualquier servidor con Docker instalado puede correr el proyecto:

```bash
ssh su-servidor
git clone https://github.com/roldanw18/plataforma-optimixage.git
cd plataforma-optimixage
# Cree el .env con sus valores
docker compose up -d --build
```

### Opción C — Otros (Railway, Fly.io, AWS ECS, Azure, GCP)

Cualquier proveedor que soporte Docker funcionará. El Manual Técnico ([MANUAL_TECNICO_INTEGRAL.md](MANUAL_TECNICO_INTEGRAL.md)) tiene la sección §12 con todos los detalles.

---

## 8. Primer login y cambio de contraseña admin

Cuando entre por primera vez a la app:

1. URL: http://localhost:3000 (o la URL de la nube si desplegó).
2. **Email:** el que puso en `BOOTSTRAP_ADMIN_EMAIL` (ej. `admin@optimixage.com`).
3. **Contraseña:** la que puso en `BOOTSTRAP_ADMIN_PASSWORD`.

**Primer acto recomendado:** cambie la contraseña desde el menú **Configuración → Perfil** dentro de la app.

Desde ese mismo panel admin puede:

- Registrar nuevos clientes (cada cliente recibe sus propias credenciales).
- Crear proyectos y asignarlos a clientes.
- Cambiar etapas, subir documentos, agendar reuniones.
- Enviar notificaciones masivas (broadcasts).

---

## 9. Soporte y documentación adicional

| Recurso | Para qué sirve |
|---|---|
| [README.md](README.md) | Guía de instalación rápida |
| [MANUAL_TECNICO_INTEGRAL.md](MANUAL_TECNICO_INTEGRAL.md) | Documentación técnica completa de 20 secciones (arquitectura, BD, APIs, seguridad, mantenimiento) |
| [INFORME_PRACTICA_Y_SUSTENTACION.md](INFORME_PRACTICA_Y_SUSTENTACION.md) | Informe académico de la práctica |
| [docs/sprint1/](docs/sprint1/) | Documentación de cada sprint con decisiones técnicas |
| `docker compose logs -f backend` | Ver logs del backend en tiempo real (para debugging) |
| `http://localhost:8000/docs` | Documentación interactiva de la API (Swagger UI) |

---

## Resumen visual del flujo de toma de control

```
1. Recibir invitación al repo GitHub
        ↓
2. git clone el repositorio
        ↓
3. Recibir transferencia del proyecto Supabase
        ↓
4. Resetear password en Supabase ★ (invalida secretos viejos)
        ↓
5. Generar SECRET_KEY nueva
        ↓
6. Crear .env con todos los secretos nuevos
        ↓
7. docker compose up --build  ← levantar y probar localmente
        ↓
8. (Opcional) Desplegar en la nube
        ↓
9. Cambiar password admin al primer login
        ↓
   ✅ Sistema bajo su control completo
```

---

**Listo.** A partir del paso 4 (resetear password Supabase), el proyecto está bajo su control completo. Cualquier secreto que hubiera existido en el historial del repositorio queda invalidado.

Si tiene cualquier duda durante la configuración, contacte al desarrollador anterior o consulte el Manual Técnico Integral.
