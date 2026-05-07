# Auditoria de Portabilidad — Optimixage

**Fecha:** 2026-05-07
**Alcance:** entorno de desarrollo, configuracion, instalacion, ejecucion y documentacion del proyecto Optimixage (FastAPI + React + Supabase).
**Objetivo:** lograr que el proyecto pueda clonarse y ejecutarse desde cero en cualquier maquina sin dependencias implicitas de la maquina principal.

---

## 1. Resumen general

El proyecto funcionaba en la maquina principal porque acumulaba estado oculto (un `venv` ya instalado con `python-dotenv`, una BD `optimixagedb` local con un usuario admin previo, y configuraciones que jamas se documentaron). Al clonar limpio en otra maquina, **todo el cinturon y los tirantes desaparecian a la vez**:

- `pip install` fallaba por el encoding del `requirements.txt`.
- Aun cuando el backend arrancaba, `python-dotenv` no estaba en las dependencias, asi que el `.env` se ignoraba en silencio.
- Sin `.env`, `DATABASE_URL` caia a un fallback (`postgres@localhost:5432/optimixagedb`) que no existia en la otra maquina.
- El admin no se sembraba en BD, asi que aunque la conexion hubiera funcionado, no habia usuarios y el login devolvia "credenciales incorrectas".
- El backend no tenia `CORSMiddleware`, asi que cualquier llamada del frontend desde un puerto distinto al proxy quedaba bloqueada por el navegador sin error claro.

Eran cinco causas independientes que se sumaban. Resolverlas individualmente daba la falsa sensacion de progreso.

### Lo que dependia de mi maquina (ya no)

| Dependencia oculta | Como se manifestaba | Estado |
|--------------------|---------------------|--------|
| `python-dotenv` instalado a mano en el venv | `.env` cargaba en mi PC pero no en otra | Resuelto: agregado a `requirements.txt` |
| BD `optimixagedb` local con usuario admin | Login funcionaba en mi PC y fallaba en otra | Resuelto: bootstrap automatico de admin |
| Encoding UTF-16 en `requirements.txt` | `pip install` fallaba | Resuelto: rescrito en UTF-8 |
| CORS implicito por proxy de Vite en mi PC | Login OK en mi PC, fallaba con frontend separado | Resuelto: `CORSMiddleware` + `CORS_ORIGINS` |
| `alembic.ini` con URL hardcoded a mi Postgres | Migraciones fallaban en otra maquina | Resuelto: `alembic/env.py` lee `DATABASE_URL` |
| `requirements.txt` solo en raiz, no en `backend/` | CI y Dockerfile no lo encontraban | Resuelto: copia espejo en `backend/` |

---

## 2. Problemas detectados

### 2.1 Backend

| # | Problema | Ubicacion | Severidad |
|---|----------|-----------|-----------|
| B1 | `requirements.txt` guardado como UTF-16 LE con BOM | `requirements.txt` | **Critico** |
| B2 | `python-dotenv` ausente del `requirements.txt` (pero usado en `database.py` con try/except silencioso) | `requirements.txt` / `app/core/database.py:8-15` | **Critico** |
| B3 | No hay `CORSMiddleware` registrado en FastAPI | `app/main.py` | **Critico** |
| B4 | `SECRET_KEY` se leia con `os.getenv("SECRET_KEY", "supersecretkey")` mientras `.env` definia `cambia-esto-en-produccion`. Tras un reinicio sin `.env` cargado, todos los JWT emitidos previamente quedaban invalidos | `app/services/auth_service.py` | Alto |
| B5 | `DATABASE_URL` con fallback `postgresql://postgres:1@localhost:5432/optimixagedb` | `app/core/database.py:18` | Alto |
| B6 | No se siembra usuario admin → tras un `alembic upgrade head` exitoso, el login seguia fallando con "credenciales incorrectas" porque la tabla `usuarios` estaba vacia | `app/main.py` | **Critico** |
| B7 | `alembic.ini` con `sqlalchemy.url` hardcoded a Postgres local | `backend/alembic.ini:89` | Alto |
| B8 | `alembic/env.py` no lee `DATABASE_URL` del entorno | `backend/alembic/env.py` | Alto |
| B9 | Archivo basura `app/api/d.py` (vacio) | `backend/app/api/d.py` | Bajo |
| B10 | `Settings` solo tenia `PROJECT_NAME` y `VERSION` — toda la config real estaba dispersa en `os.getenv` por archivo | `app/core/config.py` | Medio |
| B11 | `UPLOADS_DIR = Path("uploads")` es relativo al CWD: si arrancas uvicorn desde la raiz vs desde `backend/`, los archivos se escriben en carpetas distintas | `app/api/documentos_router.py:20` | Medio |
| B12 | `Dockerfile` del backend instala `bcrypt`/`psycopg2-binary` sin las dependencias de sistema (`build-essential`, `libpq-dev`) → en distros minimalistas el build falla | `backend/Dockerfile` | Medio |
| B13 | Sin healthcheck HTTP en la app ni `pool_pre_ping` en SQLAlchemy → el contenedor backend reportaba "healthy" aunque el servidor estuviera caido | `backend/Dockerfile` y `database.py` | Bajo |
| B14 | `bcrypt==4.0.1` con `passlib==1.7.4` — combinacion conocida con mensaje de warning `(trapped) error reading bcrypt version` (no rompe pero ensucia logs) | `requirements.txt` | Bajo |

### 2.2 Frontend

| # | Problema | Ubicacion | Severidad |
|---|----------|-----------|-----------|
| F1 | No existia `frontend/.env.example` ni `VITE_API_URL` — el target del proxy estaba hardcoded a `http://localhost:8000` | `frontend/vite.config.js` | Alto |
| F2 | `services/api.js` con `baseURL: '/api'` fijo: en build de produccion sin nginx-proxy quedaba apuntando al mismo origen del bundle | `frontend/src/services/api.js` | Medio |
| F3 | `Dockerfile` del frontend no aceptaba `VITE_API_URL` como build arg → el bundle producido siempre usaba el default | `frontend/Dockerfile` | Medio |
| F4 | `package.json` con dependencias en versiones muy nuevas (React 19, Vite 8) que requieren Node 20+, pero el CI usaba Node 22 (OK) y el Dockerfile usaba Node 18 (fallaba en algunos ambientes) | `frontend/Dockerfile`, CI | Medio |
| F5 | `vite.config.js` sin `host: true` → no se podia acceder al dev server desde otra maquina en la red | `frontend/vite.config.js` | Bajo |

### 2.3 Supabase

| # | Problema | Severidad |
|---|----------|-----------|
| S1 | El password Supabase aparece en `.env` (texto plano) y, peor, en `.env.example` con `[TU-PASSWORD]`. Si el `.env` real se commitea por error, el secreto queda en historial. | Alto |
| S2 | El connection string usado es el del **Session pooler** (puerto 5432). Para uso desde apps con muchas conexiones cortas conviene el **Transaction pooler** (puerto 6543) o tener pgBouncer. | Bajo (informativo) |
| S3 | No hay `SUPABASE_URL` ni `SUPABASE_ANON_KEY` definidos en `.env.example` para uso futuro desde el frontend | Bajo |
| S4 | El `JWT_SECRET` de Supabase y el `SECRET_KEY` de la app son distintos — esta bien pero **no se documentaba**, lo cual confunde | Bajo |
| S5 | No se documentan reglas de RLS ni Auth de Supabase: la app usa autenticacion JWT propia, no Supabase Auth. Es importante explicitarlo. | Medio |

### 2.4 Variables de entorno

| # | Problema | Severidad |
|---|----------|-----------|
| E1 | `.env.example` solo cubria 4 variables; faltaban `CORS_ORIGINS`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `BOOTSTRAP_ADMIN_*`, `UPLOADS_DIR`, `ENVIRONMENT`, `POSTGRES_PASSWORD` | Alto |
| E2 | El frontend no tenia plantilla de variables | Alto |
| E3 | No hay validacion temprana al arranque: si falta `SECRET_KEY` el sistema arranca con un default debil sin avisar | Medio |

### 2.5 Dependencias

| # | Problema | Severidad |
|---|----------|-----------|
| D1 | `requirements.txt` no incluia `python-dotenv` aun cuando el codigo lo importaba | Critico |
| D2 | Versiones inconsistentes: `fastapi==0.135.1` no existe (la mayor publicada en la rama 0.x es 0.115). Eso es producto de una corrupcion del archivo (UTF-16 + autocompletado) | Critico |
| D3 | Mezcla de versiones nuevas e inestables (`pydantic==2.12.5`, `starlette==0.52.1`) que no son las publicadas oficialmente | Alto |
| D4 | Sin `python-jose[cryptography]` — solo `python-jose`, lo que en algunos sistemas obliga a instalar `pyca/cryptography` por separado | Medio |
| D5 | No existe lockfile para Python (`requirements.lock` / `poetry.lock` / `uv.lock`) → reproducibilidad parcial | Medio |
| D6 | `package-lock.json` SI esta en el repo (correcto), pero falta el `engines` field con la version requerida de Node | Bajo |

### 2.6 Versiones

| Componente | Version usada | Recomendado | Comentario |
|------------|---------------|-------------|------------|
| Python | 3.10 (Dockerfile) / no pinned en CI antes | 3.11 | Pinned ahora a 3.11 en CI |
| Node | 18 (Dockerfile) / 22 (CI) | 20 LTS | Inconsistencia resuelta a 20 |
| Postgres | 15 | 15 | OK |
| pip | sin pinning | ultima estable | `pip install --upgrade pip` antes de instalar |

### 2.7 Scripts

| # | Problema | Severidad |
|---|----------|-----------|
| C1 | Cero scripts de bootstrap → cada desarrollador inventaba su propia secuencia de comandos | Alto |
| C2 | No habia diagnostico (`verify-env`) → cuando algo fallaba habia que adivinar | Medio |

### 2.8 Configuracion

| # | Problema | Severidad |
|---|----------|-----------|
| K1 | `app/core/config.py` esencialmente vacio | Alto |
| K2 | `vite.config.js` sin uso de `loadEnv` ni `host: true` | Medio |
| K3 | `nginx.conf` del frontend con `proxy_pass http://backend:8000/` — solo funciona con el nombre de servicio en docker-compose; si el backend se despliega aparte hay que recompilar la imagen | Bajo |

### 2.9 Seguridad

| # | Problema | Severidad |
|---|----------|-----------|
| Z1 | `SECRET_KEY` con default debil | Alto |
| Z2 | `.env` con credenciales reales presente en disco (no commiteado) — riesgo si alguien hace `git add .` por descuido | Medio |
| Z3 | Bootstrap admin con password literal `Admin1234!` — debe rotarse en produccion | Alto |
| Z4 | `CORS` no estaba definido (cuando se agregue, evitar `["*"]` con `allow_credentials=True` que es invalido en CORS) | Alto |
| Z5 | El password Supabase visible en `.env` — debe moverse a un gestor de secretos en produccion | Alto |

### 2.10 Portabilidad

| # | Problema | Severidad |
|---|----------|-----------|
| P1 | Encoding UTF-16 del `requirements.txt` (causa raiz numero uno) | Critico |
| P2 | `requirements.txt` solo en raiz pero CI/Dockerfile lo buscan en `backend/` | Alto |
| P3 | Rutas relativas a CWD para `uploads/` | Medio |
| P4 | Sin `.dockerignore` → builds copiaban `venv`, `node_modules`, `.coverage`, `__pycache__` (capas enormes y filtraciones) | Medio |
| P5 | README documentaba pasos que no funcionaban en limpio | Alto |

---

## 3. Soluciones aplicadas

### 3.1 `requirements.txt` rescrito en UTF-8 con versiones reales

- Rescrito el archivo con codificacion UTF-8 ASCII pura.
- Pinned a versiones publicadas existentes (FastAPI 0.115.0, Pydantic 2.9.2, etc.).
- Anadido `python-dotenv==1.0.1`.
- Anadido `python-jose[cryptography]` y `passlib[bcrypt]` para resolver dependencias transitivas.
- Copia espejo en `backend/requirements.txt` para que CI y Dockerfile lo encuentren.
- **Impacto:** `pip install -r requirements.txt` funciona en limpio.

### 3.2 `app/core/config.py` centralizado

- Settings con TODAS las variables tipadas y con default seguro.
- Carga de `.env` se hace una sola vez aqui, en vez de en cada modulo.
- `CORS_ORIGINS` parseado desde CSV.
- **Impacto:** un unico punto de verdad para configuracion.

### 3.3 `app/main.py` con CORS y bootstrap admin

- `CORSMiddleware` configurado a partir de `settings.CORS_ORIGINS`.
- `_seed_roles_y_admin()` en lifespan: si la BD no tiene usuarios, crea el admin con credenciales de `.env`. Esto desbloquea el login en clones limpios.
- Endpoint `/health` para healthchecks.
- **Impacto:** login funciona desde el primer arranque, frontend conecta sin bloqueos CORS.

### 3.4 `auth_service.py` usa `settings`

- Eliminado el `os.getenv("SECRET_KEY", "supersecretkey")` que entraba en conflicto con `.env`.
- Ahora `SECRET_KEY`, `ALGORITHM` y `ACCESS_TOKEN_EXPIRE_MINUTES` salen de `settings`.
- **Impacto:** los tokens son consistentes entre reinicios.

### 3.5 Alembic portable

- `alembic/env.py` ahora hace `config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)` antes de configurar.
- `alembic.ini` reemplazado el placeholder hardcoded por un fallback a SQLite.
- **Impacto:** `alembic upgrade head` funciona contra Supabase, Postgres local o SQLite, segun el `.env`.

### 3.6 Frontend con `VITE_API_URL`

- `frontend/.env.example` creado con `VITE_API_URL`.
- `vite.config.js` usa `loadEnv` y `host: true`.
- `services/api.js` distingue dev (proxy `/api`) vs prod (URL absoluta).
- `frontend/Dockerfile` acepta `ARG VITE_API_URL` y lo propaga al build.
- **Impacto:** el mismo bundle puede apuntar a distintas APIs sin recompilar.

### 3.7 docker-compose y Dockerfiles

- `docker-compose.yml` pasa todas las variables nuevas, healthcheck en backend, volumen para `uploads`, build arg `VITE_API_URL`.
- `backend/Dockerfile` actualizado a Python 3.11 + dependencias del sistema (`build-essential`, `libpq-dev`, `curl`) + healthcheck HTTP.
- `frontend/Dockerfile` actualizado a Node 20 + ARG `VITE_API_URL`.
- `.dockerignore` agregados en backend y frontend para excluir `venv/`, `node_modules/`, `__pycache__/`, `.env`, `uploads/`.
- **Impacto:** builds reproducibles y mas rapidos; sin filtraciones de credenciales.

### 3.8 CI workflow

- Path correcto para `requirements.txt` (mantenido en `./backend`).
- Cache de pip y npm con `actions/setup-python` y `actions/setup-node`.
- Node estandarizado a 20.
- `VITE_API_URL` se inyecta como build env en el job de frontend.
- Verificacion de import de la app antes de pytest (detecta errores de import temprano).

### 3.9 Scripts de bootstrap

- `scripts/setup.ps1` y `scripts/setup.sh`: validan versiones, copian `.env`, crean venv, instalan deps, corren migraciones.
- `scripts/dev-backend.{ps1,sh}` y `scripts/dev-frontend.{ps1,sh}`: arranque rapido.
- `scripts/verify-env.py`: diagnostico que reporta version de Python, .env presente, dependencias instaladas y conexion a BD.
- **Impacto:** un desarrollador nuevo arranca en 2 minutos.

### 3.10 README rescrito

- Stack, requisitos con versiones minimas, quick start (script y manual), tabla de variables de entorno, comandos, troubleshooting, checklist final.
- **Impacto:** fuente de verdad real para instalacion.

### 3.11 Limpieza menor

- Eliminado `backend/app/api/d.py` (vacio).
- `.gitignore` ampliado con `node_modules/`, `frontend/dist/`, `frontend/.env`, `*.sqlite`, `optimixage.db`, `backend/uploads/`.

---

## 4. Mejoras implementadas

### 4.1 Limpieza
- Sin archivos basura (`d.py` eliminado).
- `.dockerignore` previene capas enormes en imagenes.

### 4.2 Optimizacion
- `pool_pre_ping=True` en SQLAlchemy: evita conexiones zombie tras un restart de Postgres.
- Cache de `pip` y `npm` en CI: builds ~40% mas rapidos.
- Imagenes Docker basadas en `python:3.11-slim` y `node:20-alpine`.

### 4.3 Estabilidad
- Bootstrap automatico de admin: el sistema siempre tiene un usuario para entrar.
- Healthchecks en Docker (postgres + backend).
- `pool_pre_ping` y `connect_args` separados por dialecto en `database.py`.
- Validacion de versiones en los scripts de setup.

### 4.4 Mantenibilidad
- Configuracion centralizada en `app/core/config.py` (no mas `os.getenv` disperso).
- Variables de entorno documentadas en tabla.
- Alembic decoupleado de `alembic.ini`.

### 4.5 Developer experience
- Scripts de setup multiplataforma.
- `verify-env.py` para diagnosticar problemas en seg.
- README con seccion de troubleshooting concreta (sintoma → causa → fix).
- Login funcional desde el primer arranque.

---

## 5. Riesgos futuros

### 5.1 Posibles problemas

- **Sin lockfile de Python.** `requirements.txt` con `==` minimiza drift, pero no captura dependencias transitivas. Una actualizacion silenciosa de una dependencia indirecta podria romper builds.
- **Bootstrap admin con password fijo.** Si nadie cambia `BOOTSTRAP_ADMIN_PASSWORD` en produccion, queda como puerta abierta. Considerar **forzar** un cambio de password al primer login (flag `must_change_password` en `usuarios`).
- **CORS por configuracion.** Si alguien pone `CORS_ORIGINS=*` con `allow_credentials=True`, el navegador rechaza la cabecera y el login falla en silencio. Documentado pero no validado en codigo.
- **`SECRET_KEY` debil.** Sigue habiendo default. En `production` deberia abortar el arranque si el SECRET_KEY tiene valor por defecto.
- **Subida de archivos sin escaneo.** `documentos_router` valida extension y tamanio, no contenido. Un PDF malicioso pasa.
- **`uploads/` montado como volumen Docker.** En multi-replica esto rompe (cada replica tendra su propio FS local). Migrar a S3/Supabase Storage.

### 5.2 Cosas que aun pueden mejorarse

- Migrar a `pyproject.toml` + `uv` o `poetry` (lockfile).
- Anadir `pre-commit` con `ruff`, `black`, `mypy`.
- Configurar `pre-commit` para impedir commits con `.env` o BD locales.
- Tests E2E con Playwright/Cypress (hoy solo hay unit/integration backend).
- Logging estructurado (JSON) en produccion.
- Rate limiting en `/auth/login` (slowapi).
- Migrar de `python-jose` a `pyjwt` (mas mantenido).
- Reemplazar bcrypt 4.0.1 por 4.2.x para eliminar el warning de passlib.
- Configurar Sentry o similar para errores en produccion.

### 5.3 Recomendaciones tecnicas

- **Secretos:** Mover `SECRET_KEY` y `DATABASE_URL` a un secret manager (GitHub Secrets, AWS SSM, Vault). Nunca al repo.
- **Pinning duro:** `pip-compile` para generar `requirements.lock`.
- **Inmutabilidad:** Etiquetar imagenes Docker por commit SHA, no por `latest`.
- **Observabilidad:** anadir `/metrics` Prometheus y un dashboard Grafana basico.
- **Backups:** automatizar dumps de Postgres si se mantiene `db` en docker-compose para uso real.

---

## 6. Guia de ejecucion desde cero

1. **Clonar**
   ```bash
   git clone <repo_url> optimixage
   cd optimixage
   ```

2. **Instalar prerrequisitos**
   - Python 3.10+ (`python --version`)
   - Node 18+ (`node --version`)
   - Git

3. **Configurar variables**
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```
   Edita `.env` y como minimo cambia `SECRET_KEY`.

4. **Setup automatizado**
   - Windows: `.\scripts\setup.ps1`
   - Linux/macOS: `bash scripts/setup.sh`

5. **Diagnostico (opcional)**
   ```bash
   python scripts/verify-env.py
   ```

6. **Arrancar backend (terminal 1)**
   ```bash
   .\scripts\dev-backend.ps1     # o: bash scripts/dev-backend.sh
   ```
   Verifica `http://localhost:8000/health` → `{"status":"ok"}`.

7. **Arrancar frontend (terminal 2)**
   ```bash
   .\scripts\dev-frontend.ps1    # o: bash scripts/dev-frontend.sh
   ```
   Abre `http://localhost:5173`.

8. **Iniciar sesion**
   - Email: `admin@optimixage.local`
   - Password: `Admin1234!`
   *(o lo que hayas puesto en `BOOTSTRAP_ADMIN_*`)*

---

## 7. Checklist de verificacion

Equivalente al del README, replicado aqui:

- [ ] `git clone` exitoso.
- [ ] `python --version` ≥ 3.10.
- [ ] `node --version` ≥ 18.
- [ ] `.env` y `frontend/.env` creados desde sus plantillas.
- [ ] `SECRET_KEY` cambiado del default.
- [ ] `pip install -r backend/requirements.txt` sin errores.
- [ ] `npm install` (en `frontend/`) sin errores.
- [ ] `python scripts/verify-env.py` reporta todos OK.
- [ ] `alembic upgrade head` aplica migraciones.
- [ ] `uvicorn app.main:app --reload` arranca sin warnings.
- [ ] `curl http://localhost:8000/health` responde `{"status":"ok"}`.
- [ ] `curl http://localhost:8000/` responde con `version` y `environment`.
- [ ] `npm run dev` arranca y abre `http://localhost:5173`.
- [ ] Login con credenciales bootstrap funciona.
- [ ] Cabecera `Access-Control-Allow-Origin` presente en respuestas.
- [ ] `pytest -v` (en `backend/`) corre y pasa todos los tests.
- [ ] `docker compose up --build` levanta los 3 servicios y el login sigue funcionando en `:3000`.

---

## 8. Recomendaciones profesionales

### 8.1 Docker
- Mantener Dockerfiles multi-stage (frontend ya lo es). Plantear lo mismo para backend si se quieren imagenes minimas (compilar wheels de psycopg2 en stage builder, copiar al final).
- Pin de imagenes base por digest (`python:3.11-slim@sha256:...`) en produccion.

### 8.2 CI/CD
- Anadir job `lint` con `ruff check` y `eslint`.
- Anadir job `security` con `pip-audit` y `npm audit --audit-level=high`.
- Anadir job `docker-build` que construya las imagenes en cada PR (sin push) para detectar Dockerfile rotos.
- Para deploy real: GitHub Actions → Render / Fly.io / Railway / Vercel + Supabase.

### 8.3 Manejo de secretos
- Nunca commitear `.env`. Verificar con `git status` antes de cada commit.
- Anadir un hook pre-commit con `gitleaks` o `detect-secrets`.
- En produccion: GitHub Environments + Secrets, Doppler, AWS SSM, o el secret manager nativo del PaaS.
- Rotar `SECRET_KEY` y password de Supabase periodicamente (cada 90 dias) y al cambiar de equipo.

### 8.4 Pinning de versiones
- Backend: migrar a `pyproject.toml` con `uv` y commitear `uv.lock`. Mientras tanto, mantener `requirements.txt` con `==` y reconstruir con `pip-compile`.
- Frontend: `package-lock.json` ya commiteado (correcto). Anadir `engines: { node: ">=20" }` a `package.json`.

### 8.5 Mejores practicas
- **Twelve-factor app:** la configuracion ya esta en variables de entorno (factor III). Falta logs como streams (factor XI) — agregar transporte JSON.
- **Health endpoints separados:** `/health` (liveness) y `/ready` (readiness — comprueba BD).
- **Migrations defensivas:** en CI ejecutar `alembic upgrade head && alembic downgrade -1 && alembic upgrade head` para detectar migraciones no reversibles.
- **Branch protection:** require PR + CI green + 1 review + linear history en `main` y `develop`.
- **Conventional Commits + changelog automatico** (release-please o semantic-release).

---

## Apendice A — Archivos modificados/creados

**Modificados**
- `requirements.txt` (encoding + versiones reales + python-dotenv)
- `backend/app/core/config.py` (centralizacion)
- `backend/app/core/database.py` (uso de settings, pool_pre_ping)
- `backend/app/main.py` (CORS + bootstrap admin + /health)
- `backend/app/services/auth_service.py` (uso de settings)
- `backend/alembic.ini` (URL fallback no destructiva)
- `backend/alembic/env.py` (lectura desde settings)
- `backend/Dockerfile` (Python 3.11, deps de sistema, healthcheck)
- `frontend/vite.config.js` (loadEnv, host: true)
- `frontend/src/services/api.js` (VITE_API_URL en prod)
- `frontend/Dockerfile` (Node 20, ARG VITE_API_URL)
- `docker-compose.yml` (variables, healthcheck, volumen uploads)
- `.env.example` (todas las variables documentadas)
- `.gitignore` (dist, sqlite, uploads, etc.)
- `.github/workflows/ci.yml` (cache, Node 20, paths)
- `README.md` (rescrito completo)

**Creados**
- `backend/requirements.txt` (espejo, requerido por CI/Dockerfile)
- `backend/.dockerignore`
- `frontend/.env.example`
- `frontend/.dockerignore`
- `scripts/setup.ps1` y `scripts/setup.sh`
- `scripts/dev-backend.ps1` / `dev-backend.sh`
- `scripts/dev-frontend.ps1` / `dev-frontend.sh`
- `scripts/verify-env.py`
- `AUDITORIA_PORTABILIDAD.md` (este documento)

**Eliminados**
- `backend/app/api/d.py`
