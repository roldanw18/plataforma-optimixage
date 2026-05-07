# Optimixage — Plataforma de Seguimiento de Proyectos

Aplicacion fullstack (FastAPI + React) para la gestion y seguimiento del avance de proyectos entre administradores y clientes. Soporta autenticacion JWT, control de acceso por roles, gestion de etapas / hitos / tareas, mensajeria, gestion documental y notificaciones.

> Este README es la **fuente de verdad** para instalacion y ejecucion. Si algo no funciona desde un clon limpio, es un bug del repositorio, no de tu maquina.

---

## Tabla de contenidos

1. [Stack tecnologico](#stack-tecnologico)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Requisitos](#requisitos)
4. [Quick start](#quick-start)
5. [Variables de entorno](#variables-de-entorno)
6. [Comandos de desarrollo](#comandos-de-desarrollo)
7. [Migraciones de base de datos](#migraciones-de-base-de-datos)
8. [Despliegue con Docker](#despliegue-con-docker)
9. [Tests](#tests)
10. [Solucion de problemas](#solucion-de-problemas)
11. [Checklist de verificacion](#checklist-de-verificacion)

---

## Stack tecnologico

| Capa | Tecnologia |
|------|-----------|
| Backend | FastAPI 0.115 · SQLAlchemy 2 · Alembic · python-jose (JWT) · passlib/bcrypt |
| Frontend | React 19 · Vite · React Router · Axios · Tailwind v4 |
| Base de datos | PostgreSQL 15 (Supabase / Docker) o SQLite (modo prueba) |
| Infra | Docker Compose · GitHub Actions |

---

## Estructura del proyecto

```
.
├── backend/
│   ├── app/
│   │   ├── api/            # routers FastAPI
│   │   ├── core/           # config, database, security, dependencies
│   │   ├── models/         # ORM SQLAlchemy
│   │   ├── repositories/
│   │   ├── schemas/        # Pydantic
│   │   ├── services/       # logica de negocio
│   │   └── main.py
│   ├── alembic/            # migraciones
│   ├── tests/              # pytest (sqlite en memoria)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/                # componentes React
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── scripts/                # setup.ps1 / setup.sh / verify-env.py / dev-*
├── .env.example            # plantilla del .env raiz
├── docker-compose.yml
├── requirements.txt        # copia espejo (CI / dev rapido)
└── README.md
```

---

## Requisitos

| Software | Version minima | Recomendada | Verificar con |
|----------|---------------|-------------|---------------|
| Python | 3.10 | **3.11** | `python --version` |
| pip | 23.0 | ultima | `pip --version` |
| Node.js | 18 | **20 LTS** | `node --version` |
| npm | 9 | 10 | `npm --version` |
| Git | 2.30 | ultima | `git --version` |
| Docker (opcional) | 24 | 26 | `docker --version` |
| PostgreSQL local (opcional) | 14 | 15 | `psql --version` |

> **Windows**: instala Python desde [python.org](https://www.python.org/downloads/) marcando la opcion *"Add python.exe to PATH"*. Para Node usa [nodejs.org](https://nodejs.org/) o `nvm-windows`.

---

## Quick start

### Opcion 1 — Setup automatico (recomendado)

**Windows / PowerShell**

```powershell
git clone <repo_url> optimixage
cd optimixage
.\scripts\setup.ps1
```

**Linux / macOS / WSL**

```bash
git clone <repo_url> optimixage
cd optimixage
bash scripts/setup.sh
```

Estos scripts:

1. Verifican versiones de Python y Node.
2. Crean `.env` y `frontend/.env` desde sus plantillas si no existen.
3. Crean el virtualenv del backend e instalan dependencias.
4. Ejecutan `alembic upgrade head`.
5. Instalan `node_modules` del frontend.

Despues:

```bash
# terminal 1
.\scripts\dev-backend.ps1     # o: bash scripts/dev-backend.sh
# terminal 2
.\scripts\dev-frontend.ps1    # o: bash scripts/dev-frontend.sh
```

Abre `http://localhost:5173` y entra con las credenciales de bootstrap (`admin@optimixage.local` / `Admin1234!` por defecto — cambialas en `.env`).

### Opcion 2 — Setup manual (paso a paso)

```bash
# 1. Clonar
git clone <repo_url> optimixage
cd optimixage

# 2. Variables de entorno
cp .env.example .env
cp frontend/.env.example frontend/.env
# (edita ambos archivos si vas a usar Supabase/Postgres real)

# 3. Backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install --upgrade pip
pip install -r backend/requirements.txt

# 4. Migraciones
cd backend
alembic upgrade head
cd ..

# 5. Frontend
cd frontend
npm install
cd ..

# 6. Diagnostico (opcional pero recomendado)
python scripts/verify-env.py
```

Ejecucion en dos terminales:

```bash
# Terminal 1 (con venv activo)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2
cd frontend
npm run dev
```

### Opcion 3 — Docker Compose

```bash
cp .env.example .env   # ajusta SECRET_KEY y POSTGRES_PASSWORD
docker compose up --build
```

* Backend → `http://localhost:8000`
* Frontend → `http://localhost:3000`
* Postgres → `localhost:5432`

---

## Variables de entorno

Toda la configuracion vive en `.env` (raiz, backend) y `frontend/.env`. Los valores por defecto estan documentados en los respectivos `.env.example`.

### Backend (`/.env`)

| Variable | Obligatoria | Default | Descripcion |
|----------|-------------|---------|-------------|
| `DATABASE_URL` | si | `sqlite:///./optimixage.db` | URL SQLAlchemy. Soporta SQLite, Postgres local o Supabase. |
| `SECRET_KEY` | **si** | `change-me-...` | Clave de firma JWT. **Obligatorio rotar en produccion.** |
| `JWT_ALGORITHM` | no | `HS256` | Algoritmo JWT. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | no | `60` | Vida util del token. |
| `CORS_ORIGINS` | no | `localhost:5173, localhost:3000, ...` | Lista CSV de origenes permitidos. |
| `BOOTSTRAP_ADMIN_EMAIL` | no | `admin@optimixage.local` | Admin inicial creado si la BD esta vacia. |
| `BOOTSTRAP_ADMIN_PASSWORD` | no | `Admin1234!` | Contrasena del admin inicial. |
| `BOOTSTRAP_ADMIN_NOMBRE` | no | `Administrador` | Nombre mostrado del admin. |
| `UPLOADS_DIR` | no | `uploads` | Carpeta donde se guardan los archivos subidos. |
| `ENVIRONMENT` | no | `development` | `development` / `staging` / `production`. |

### Frontend (`/frontend/.env`)

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | URL del backend. En desarrollo Vite proxiea `/api` aqui. En build de produccion el bundle apunta directamente. |

---

## Comandos de desarrollo

```bash
# Backend (con venv activo)
cd backend
uvicorn app.main:app --reload          # dev
pytest -v                              # tests
pytest --cov=app                       # cobertura
alembic revision --autogenerate -m ".. # nueva migracion
alembic upgrade head                   # aplicar migraciones

# Frontend
cd frontend
npm run dev      # dev server (HMR)
npm run build    # build produccion
npm run preview  # servir el build
npm run lint     # ESLint
```

---

## Migraciones de base de datos

`alembic` usa la `DATABASE_URL` del `.env` (no la del `alembic.ini`). Si cambias de SQLite a Postgres simplemente actualiza `.env` y vuelve a correr:

```bash
cd backend
alembic upgrade head
```

Para crear una migracion despues de modificar modelos:

```bash
cd backend
alembic revision --autogenerate -m "descripcion del cambio"
alembic upgrade head
```

---

## Despliegue con Docker

```bash
docker compose up --build       # build + run
docker compose down             # parar
docker compose logs -f backend  # logs del backend
docker compose exec backend alembic upgrade head
```

Docker Compose levanta tres contenedores: `db` (Postgres), `backend` (FastAPI/uvicorn) y `frontend` (build estatico servido por nginx). Los volumenes `postgres_data` y `backend_uploads` persisten datos entre reinicios.

---

## Tests

```bash
cd backend
pytest -v
```

Los tests usan SQLite en memoria (`conftest.py`) y no tocan tu base de datos real. CI ejecuta los tests en cada push y exige `--cov-fail-under=60`.

---

## Solucion de problemas

| Sintoma | Causa probable | Solucion |
|---------|----------------|----------|
| `pip install -r requirements.txt` falla con `'utf-8' codec can't decode byte 0xff` | `requirements.txt` se guardo en UTF-16 | Reemplaza el archivo con la version UTF-8 del repo (ya corregido). |
| Backend arranca pero `/auth/login` devuelve "credenciales incorrectas" | `python-dotenv` no instalado o `.env` no encontrado, asi que cae al DATABASE_URL fallback (Postgres local inexistente) | `pip install python-dotenv`, copia `.env.example` a `.env`. Confirma con `python scripts/verify-env.py`. |
| Login falla con error de CORS en consola del navegador | El backend no tenia `CORSMiddleware` o el origen del frontend no esta en `CORS_ORIGINS` | Asegurate de tener `CORS_ORIGINS` con la URL del frontend. |
| `alembic upgrade head` falla con `connection refused` | `DATABASE_URL` apunta a un Postgres local que no existe | Usa SQLite (`sqlite:///./optimixage.db`) o levanta `docker compose up db`. |
| `npm run dev` falla con `EACCES` o `ENOENT` | `node_modules` corrupto / version de Node incompatible | `rm -rf node_modules package-lock.json && npm install`. Usa Node 20 LTS. |
| El frontend conecta pero recibe 401 en cada request | El JWT esta expirado o `SECRET_KEY` cambio entre arranques | Cierra sesion (limpia `localStorage`) o estabiliza `SECRET_KEY` en `.env`. |
| `docker compose up` se queda en "waiting for db" | Postgres aun no esta listo (healthcheck) o el puerto 5432 esta ocupado | Espera ~10s o cambia el puerto en `docker-compose.yml`. |

Diagnostico automatico:

```bash
python scripts/verify-env.py
```

---

## Checklist de verificacion

Marca cada item al instalar el proyecto en una maquina nueva:

- [ ] `git clone` exitoso
- [ ] `python --version` >= 3.10
- [ ] `node --version` >= 18
- [ ] `cp .env.example .env` y revisado `SECRET_KEY` + `DATABASE_URL`
- [ ] `cp frontend/.env.example frontend/.env`
- [ ] `pip install -r backend/requirements.txt` sin errores
- [ ] `npm install` (en `frontend/`) sin errores
- [ ] `python scripts/verify-env.py` reporta todos OK
- [ ] `alembic upgrade head` aplica migraciones
- [ ] `uvicorn app.main:app --reload` arranca y responde en `http://localhost:8000/health`
- [ ] `npm run dev` arranca y abre `http://localhost:5173`
- [ ] Login con `admin@optimixage.local` / `Admin1234!` funciona
- [ ] Cabecera `Access-Control-Allow-Origin` presente al hacer login (Network tab)
- [ ] `pytest` corre y todos los tests pasan

---

## Autor

Proyecto desarrollado como practica universitaria de ingenieria de software para Optimixage.
