# Informe de Práctica Profesional y Preparación para Sustentación
## Plataforma de Seguimiento de Proyectos — Optimixage S.A.S.

**Practicante:** Wbeimar (wbeimar224@gmail.com)
**Empresa:** Optimixage S.A.S.
**Rol:** Practicante — Desarrollo de Software (Full-Stack)
**Repositorio:** github.com/roldanw18/plataforma-optimixage
**Período analizado:** 12/03/2026 – 28/05/2026 (3 sprints)
**Base de la evidencia:** código fuente, historial Git, base de datos Supabase, CI/CD, documentación de sprints.

> **Nota de honestidad técnica.** Este informe distingue entre lo que está **demostrado por evidencia** (código, commits, BD, CI) y lo que está **auto-reportado** en los documentos de gestión (cobertura 85%, uptime 99.5%, ROI). Donde una cifra no es verificable, se indica. Esto te protege: un jurado que detecta una métrica inventada desconfía de todo el resto.

---

# FASE 1 — AUDITORÍA COMPLETA DEL PROYECTO

## 1. Resumen ejecutivo

**Qué es.** Optimixage es una aplicación web full-stack para que una consultora (rol Admin) gestione y muestre a sus clientes (rol Cliente) el avance de sus proyectos a lo largo de 5 etapas de negocio: *primer contacto → diagnóstico → capacitación → desarrollo → entrega*.

**Qué problema resuelve.** Antes, el seguimiento del avance entre la consultora y el cliente era manual y disperso (correo, llamadas, archivos sueltos). La plataforma centraliza en un único lugar: el estado del proyecto, los documentos, la comunicación (chat), las reuniones, el contenido multimedia y las notificaciones, con trazabilidad de cada cambio.

**Beneficios.**
- Visibilidad en tiempo real del avance para el cliente (dashboard con etapa actual y % de progreso).
- Comunicación y documentos en un solo canal, no en correos sueltos.
- Trazabilidad y auditoría de cada cambio de etapa y registro de usuario (`audit_log`).
- Acceso por roles: el cliente solo ve lo suyo; el admin gestiona todo.

**Usuarios.**
- **Administrador (consultora):** crea proyectos, asigna clientes, mueve etapas, sube documentos y contenido, agenda reuniones, responde mensajes, emite notificaciones masivas.
- **Cliente:** consulta su avance, descarga documentos, ve contenido, escribe mensajes, revisa reuniones y notificaciones.

---

## 2. Arquitectura identificada

### 2.1 Visión general (arquitectura por capas, cliente-servidor)

```
┌───────────────────────────────────────────────┐
│  NAVEGADOR — React 19 SPA (Vite → nginx)       │
│  Context de Auth · Axios · i18n (ES/EN/PT)     │
└───────────────────┬───────────────────────────┘
                    │ HTTPS · Authorization: Bearer <JWT>
                    │ (en dev: proxy Vite /api → backend)
                    ▼
┌───────────────────────────────────────────────┐
│  BACKEND — FastAPI 0.115 + Uvicorn             │
│  CORSMiddleware                                │
│  Capa API (11 routers, ~33 endpoints)          │
│  Capa Servicios (auth, proyecto, documento,    │
│                  mensaje, notificaciones)      │
│  Capa Modelos (13 modelos SQLAlchemy ORM)      │
│  Seguridad: JWT HS256 + bcrypt + RBAC          │
└───────────────────┬───────────────────────────┘
                    │ psycopg2 (rol postgres, pooler)
                    ▼
┌───────────────────────────────────────────────┐
│  BASE DE DATOS — PostgreSQL (Supabase)         │
│  13 tablas, PK UUID, audit_log con jsonb       │
│  Migraciones Alembic + nativas Supabase        │
└───────────────────────────────────────────────┘
```

### 2.2 Frontend
- **SPA React 19 + Vite 8**, enrutado con React Router 7, dos layouts (`MainLayout` para cliente, `AdminLayout` para admin).
- **Estado de sesión** en `AuthContext` + `localStorage`.
- **Cliente HTTP** `api.js` (Axios) con interceptores: añade el token a cada request y, ante un 401, limpia sesión y redirige al login.
- **i18n** con i18next + detección de idioma + backend HTTP que carga JSON por idioma/namespace.

### 2.3 Backend
- **FastAPI** con patrón por capas (Router → Service → Model) e inyección de dependencias nativa (`Depends`) para sesión de BD, usuario actual y verificación de rol.
- **Bootstrap idempotente** en el arranque (`lifespan` en [main.py](backend/app/main.py)): crea roles base (Admin/Cliente), un admin inicial si la BD está vacía, y repara el esquema (`_ensure_schema_actualizado`) creando tablas/columnas faltantes sin requerir Alembic en entornos de desarrollo.

### 2.4 Base de datos
- **PostgreSQL en Supabase** en producción; **SQLite** para desarrollo y tests (en memoria).
- 13 tablas, todas con **PK UUID**. Tabla `audit_log` con columnas `jsonb` de estado anterior/nuevo. Cascadas bien pensadas (borrar proyecto cascadea sus hijos; FKs a usuarios usan `SET NULL` para no perder histórico).

### 2.5 Autenticación y seguridad
- **JWT HS256** (`python-jose`), expiración 60 min, firma con `SECRET_KEY`.
- **Hashing bcrypt** vía passlib ([security.py](backend/app/core/security.py)).
- **RBAC** con dependencia `require_role("Admin")`.
- **CORS** configurable por lista de orígenes.
- **Validación de subidas**: tamaño máx por tipo, extensiones permitidas, y `resolve()` + verificación de prefijo contra el directorio de uploads para prevenir *path traversal*.

### 2.6 Infraestructura
- **Docker Compose** con 3 servicios: `db` (Postgres 15-alpine), `backend` (FastAPI), `frontend` (build estático en nginx), con healthchecks y volúmenes persistentes.
- **CI/CD** en GitHub Actions: job de tests backend (con cobertura mínima 60%), job de build frontend (con artefacto), y job de deploy-staging (stub informativo).

### 2.7 Flujo de información (ejemplo: cambio de etapa)
```
Admin → POST /proceso/{id}/cambiar-etapa
  → valida rol Admin
  → actualiza proyectos.etapa_actual
  → cierra el registro abierto en proyecto_etapa_historial (fecha_fin = now)
  → crea nuevo registro de historial
  → escribe en audit_log (jsonb anterior/nuevo)
  → emite notificaciones i18n al cliente y a los admins
Cliente → GET /proceso/{id} → recibe el "wizard": etapas con estado + % progreso + historial
```

---

## 3. Tecnologías utilizadas

| Tecnología | Qué es | Para qué se usó | Por qué era necesaria | Aprendizaje |
|---|---|---|---|---|
| **FastAPI** | Framework web Python asíncrono | Toda la API REST (11 routers) | API moderna, tipada, con docs automáticas (OpenAPI) | Diseño de endpoints, inyección de dependencias, validación |
| **SQLAlchemy 2 + Alembic** | ORM + migraciones | 13 modelos y versionado del esquema | Persistencia portable (SQLite↔Postgres) sin SQL a mano | Modelado relacional, relaciones, migraciones versionadas |
| **Pydantic 2** | Validación/serialización | Schemas de entrada/salida separados del ORM | Contratos de API claros y validados | Separar DTO de modelo de dominio |
| **python-jose (JWT)** | Tokens firmados | Autenticación stateless | Sesiones sin estado en servidor | Funcionamiento real de JWT (claims, exp, firma) |
| **passlib + bcrypt** | Hashing de contraseñas | Almacenar credenciales | Nunca guardar contraseñas en claro | Hashing, salt, límite de 72 bytes de bcrypt |
| **React 19 + Vite** | UI + bundler | SPA del cliente y del admin | Interfaz reactiva moderna | Componentes, hooks, estado global con Context |
| **React Router 7** | Enrutado SPA | Layouts y rutas protegidas | Navegación sin recargar | Rutas anidadas, layouts |
| **Axios** | Cliente HTTP | Comunicación con la API | Interceptores centralizados (token, 401) | Patrón de cliente HTTP con interceptores |
| **i18next** | Internacionalización | 3 idiomas (ES/EN/PT), 7 namespaces | Soporte multiidioma extremo a extremo | Diseño i18n desacoplado backend↔frontend |
| **Tailwind CSS v4** | Estilos utilitarios | Estilado de la UI | Maquetar rápido | Sistema utilitario de CSS |
| **PostgreSQL / Supabase** | BD relacional gestionada | Persistencia en producción | BD robusta y gestionada en la nube | Postgres gestionado, pooler, RLS |
| **Docker + Compose** | Contenedores | Empaquetado y orquestación local | Reproducibilidad ("funciona en mi máquina" resuelto) | Multi-stage builds, healthchecks, volúmenes |
| **GitHub Actions** | CI/CD | Tests + build automáticos en cada push | Integración continua | Pipelines, jobs, gates de cobertura |
| **pytest + pytest-cov** | Testing | 11 archivos de test backend | Verificación automática y gate de calidad | Fixtures, BD en memoria, cobertura |
| **Git + Git Flow** | Control de versiones | Ramas `main`/`develop`/`feature/sprint*` | Trabajo organizado por sprint | Ramificación, merges, historial |

---

## 4. Funcionalidades implementadas

| # | Módulo | Qué hace | Problema que resuelve | Complejidad |
|---|---|---|---|---|
| 1 | **Autenticación JWT** | Login/registro, emisión y validación de token | Acceso seguro sin estado | Media |
| 2 | **RBAC (roles)** | Admin vs Cliente, protección de rutas | Cada quien ve solo lo que debe | Media |
| 3 | **Gestión de usuarios** | Registrar clientes, perfil, avatar, cambio de contraseña | Administrar cuentas | Media |
| 4 | **Gestión de proyectos** | Crear, asignar cliente, listar por rol | Núcleo del seguimiento | Media |
| 5 | **Módulo Proceso (5 etapas)** ★ | Cambio de etapa, historial, % progreso, auditoría | **Corazón del negocio**: visibilidad del avance | **Alta** |
| 6 | **Hitos y tareas** | CRUD de hitos y tareas con asignación/prioridad | Desglose del trabajo | Media |
| 7 | **Gestión documental** | Upload (10 MB), descarga, borrador/publicado, tipos | Documentos centralizados y seguros | Alta |
| 8 | **Mensajería** | Chat por proyecto, marcar leídos, resumen | Comunicación trazable | Media |
| 9 | **Reuniones** | Agendar, estado, listados por cliente/propio | Coordinar encuentros | Media |
| 10 | **Notificaciones i18n** ★ | Por usuario, masivas (broadcast), con keys+params traducibles | Avisos en el idioma del usuario sin acoplar texto al backend | **Alta** |
| 11 | **Contenido multimedia** | Imágenes/videos globales o por cliente (hasta 200 MB video) | Material de apoyo para el cliente | Alta |
| 12 | **Dashboard dinámico** | Etapa actual, % avance, última actualización, datos reales | Vista de un vistazo | Media |
| 13 | **Auditoría** | `audit_log` con jsonb anterior/nuevo | Trazabilidad y cumplimiento | Media |
| 14 | **Internacionalización (ES/EN/PT)** ★ | Toda la UI + notificaciones en 3 idiomas | Alcance multinacional | **Alta** (iniciativa extra) |

★ = funcionalidades de mayor valor diferencial.

---

## 5. Problemas encontrados y resueltos (con evidencia)

Estos problemas están **documentados en el repositorio** (README, reportes, commits) — son material excelente para la defensa porque demuestran resolución real de problemas.

### 5.1 `requirements.txt` en UTF-16 rompía la instalación
- **Qué ocurría:** `pip install -r requirements.txt` fallaba con `'utf-8' codec can't decode byte 0xff` en clones limpios.
- **Detección:** al verificar portabilidad desde una máquina nueva.
- **Solución:** re-guardar el archivo en UTF-8 (commit `7004599 fix: corregir conflicto de versiones starlette`). Documentado en la tabla de troubleshooting del README.
- **Aprendizaje:** la portabilidad real se prueba clonando limpio, no en tu máquina.

### 5.2 Login fallaba en silencio por falta de CORS
- **Qué ocurría:** el frontend (otro origen) recibía respuestas bloqueadas por el navegador; el login "fallaba sin error claro".
- **Detección:** error de CORS en consola del navegador.
- **Solución:** `CORSMiddleware` con lista de orígenes configurable ([main.py:140](backend/app/main.py)).
- **Aprendizaje:** el modelo de seguridad del navegador (same-origin) y cómo CORS lo gobierna.

### 5.3 Confusión de doble `.env` (SQLite vs Supabase)
- **Qué ocurría:** el backend usaba SQLite local cuando se creía que usaba Supabase, por haber dos `.env` (raíz y `backend/`); `config.py` toma el primero que encuentra subiendo desde el archivo. Resultado: 401 falsos por admin equivocado (`admin@optimixage.local` vs `.com`).
- **Detección:** depuración de un login que "funcionaba pero no mostraba datos".
- **Solución:** unificar y documentar qué `.env` gana; recordar que cambiar `.env` exige reiniciar uvicorn (`--reload` no recarga env vars).
- **Aprendizaje:** la configuración por entorno es una fuente clásica de bugs sutiles.

### 5.4 Migración del esquema a Supabase y tipo de `cliente_id`
- **Qué ocurría:** en instalaciones previas `contenidos.cliente_id` quedaba como `VARCHAR` en lugar de `UUID`.
- **Solución:** migración `fix_contenidos_cliente_id_to_uuid` + reparación idempotente en arranque ([main.py:99-118](backend/app/main.py)) que convierte el tipo si detecta Postgres.
- **Aprendizaje:** diferencias de tipos entre SQLite y Postgres y cómo migrar sin perder datos.

### 5.5 Vulnerabilidades en dependencias del frontend
- **Qué ocurría:** dependencias con CVEs.
- **Solución:** commit `93cbe6e fix(security): actualizar dependencias frontend con vulnerabilidades`.
- **Aprendizaje:** gestión de seguridad de dependencias (supply chain).

### 5.6 Internacionalización extremo a extremo
- **Qué ocurría:** texto quemado en español por toda la UI y en notificaciones; imposible traducir.
- **Solución:** refactor i18n completo (commits `c697a72`, `6b9962c`, `dd06bc1`). El backend dejó de enviar texto fijo: ahora envía `titulo_key`, `contenido_key` y `params` (jsonb) y el frontend traduce. Migración `notificaciones_i18n_columns`.
- **Aprendizaje:** diseño desacoplado de i18n; no acoplar idioma a la lógica de negocio.

### 5.7 Conflicto de versiones (starlette) y `.pyc` en el repo
- **Solución:** commits `7004599` y `d9c5c92 fix: remove pyc conflict`; depuración del pipeline (`Pipeline Corregido`, `Pipeline vf`).
- **Aprendizaje:** higiene del repositorio (`.gitignore`) y resolución de conflictos de dependencias.

> **Hallazgos abiertos (honestidad ante el jurado).** La auditoría detectó deuda de seguridad aún pendiente: RLS deshabilitado en Supabase, credenciales en `.env`, descarga de documentos sin verificar pertenencia al proyecto, y bcrypt truncando a 72 bytes en silencio. **Reconócelos como el backlog del Sprint 4 ("Robustez & Confianza")** — un jurado valora más a quien conoce sus pendientes que a quien finge que no existen.

---

## 6. Mi aporte específico (basado en evidencia Git)

**Evidencia de autoría (objetiva e irrefutable):**
- **72 de 76 commits** son tuyos (`Wbeimar`). El usuario `roldanw18` (titular del repo / lado empresa) hizo solo **4**, incluido el `Initial commit`.
- Eres el **responsable y facilitador** firmado en todos los reportes de gestión (Management Summary, Review, Retrospectiva).
- En la práctica, **fuiste el desarrollador del producto**: el reparto de trabajo no es "uno de varios", es "el ejecutor principal con soporte/supervisión de la empresa".

### Lo que construí / desarrollé
- **Backend completo**: 11 routers, 13 modelos, 5 servicios, ~33 endpoints, sistema de auth JWT+RBAC, módulo de proceso con historial y auditoría, notificaciones i18n centralizadas, gestión documental y de contenido con validación de subidas.
- **Frontend completo**: SPA React con layouts admin/cliente, 15 páginas funcionales, AuthContext, cliente Axios con interceptores, i18n en 3 idiomas.
- **Base de datos**: modelo ER de 13 tablas, migraciones Alembic + migraciones nativas en Supabase, decisiones de cascada/SET NULL.

### Lo que diseñé
- La **arquitectura por capas** del backend y el contrato de API.
- El **diseño i18n desacoplado** (keys + params en el backend, traducción en el frontend) — decisión arquitectónica no trivial.
- El **flujo de cambio de etapa con auditoría e historial**.

### Lo que documenté
- README "fuente de verdad" con quick-start, troubleshooting y checklist.
- Reportes de Sprint 3 (Review, Retrospectiva, Management Summary, Stakeholder), roadmap, planning de Sprint 4, reportes de i18n y portabilidad, y entregables académicos (T1PRACTICA).

### Lo que mejoré / optimicé / corregí
- Portabilidad (clone-limpio funcional), CORS, conflicto starlette, encoding UTF-8, dependencias con CVEs, migración de tipos en Postgres.

### Lo que propuse (iniciativa proactiva)
- **i18n multiidioma no estaba comprometido** y lo implementaste de extremo a extremo — reconocido explícitamente como "iniciativa proactiva" en la retrospectiva.
- El **Sprint 4 "Robustez & Confianza"** como respuesta a la deuda técnica detectada.

### Trabajo heredado / de otros
- `roldanw18` aportó el `Initial commit` y unos ajustes menores (lado empresa/scaffolding inicial). Diseños UX de referencia (`docs/Maquetas.pdf`, carpeta `docs/Original/`) sirvieron de base visual; tú implementaste el código funcional.

---

## 7. Competencias desarrolladas

### Técnicas
- **Backend:** FastAPI, diseño de API REST, inyección de dependencias, servicios desacoplados.
- **Frontend:** React 19, hooks, Context, enrutado, Axios con interceptores.
- **APIs REST:** ~33 endpoints, contratos Pydantic, OpenAPI.
- **Bases de datos:** modelado ER, SQLAlchemy, Alembic, SQLite↔Postgres, Supabase, cascadas, UUID.
- **Docker:** Compose multi-servicio, multi-stage build, healthchecks, volúmenes.
- **Git / Git Flow:** ramas por sprint, merges, resolución de conflictos.
- **Testing:** pytest, fixtures, BD en memoria, gate de cobertura en CI.
- **CI/CD:** GitHub Actions con jobs de test/build/deploy.
- **Arquitectura:** patrón por capas, separación de responsabilidades.
- **Seguridad:** JWT, bcrypt, RBAC, validación de subidas, prevención de path traversal, gestión de CVEs.
- **Internacionalización:** i18n desacoplado de extremo a extremo en 3 idiomas.

### Profesionales
- **Comunicación:** reportes claros para tres audiencias (técnica, gestión, stakeholders).
- **Trabajo en equipo / cliente:** alineación con la empresa, demos.
- **Planeación / SCRUM:** 3 sprints, backlog, planning, review, retrospectiva.
- **Resolución de problemas:** los 7 problemas de la sección 5.
- **Aprendizaje autónomo:** stack moderno (FastAPI, React 19, Tailwind v4, Supabase) aprendido y aplicado.
- **Gestión del tiempo:** entregas por sprint en plazo.
- **Documentación:** volumen y calidad de docs muy por encima del promedio académico.

---

## 8. Los 10 logros más importantes

1. **Construiste una aplicación full-stack funcional y completa** (backend + frontend + BD + Docker + CI) prácticamente en solitario (72/76 commits).
2. **Diseñaste e implementaste el módulo core de negocio** (proceso de 5 etapas con historial y auditoría) — la razón de ser del producto.
3. **Implementaste autenticación y autorización profesionales** (JWT + RBAC + bcrypt).
4. **Llevaste el producto a la nube** migrando a PostgreSQL gestionado (Supabase) desde SQLite local.
5. **Internacionalizaste todo el sistema (ES/EN/PT)** por iniciativa propia, con un diseño desacoplado backend↔frontend.
6. **Montaste un pipeline CI/CD** con tests, gate de cobertura y build automático.
7. **Containerizaste la solución** con Docker Compose (3 servicios, healthchecks, multi-stage).
8. **Resolviste problemas reales de portabilidad y configuración** (UTF-16, doble `.env`, CORS, starlette, CVEs).
9. **Aplicaste SCRUM de principio a fin** (3 sprints con planning, review y retrospectiva documentados).
10. **Produjiste documentación de nivel profesional** que hace el proyecto reproducible y mantenible por terceros.

---

# FASE 2 — PREPARACIÓN PARA LA SUSTENTACIÓN

## 1. Preguntas de jurado (con respuestas sugeridas)

### Arquitectura
**P1. ¿Por qué una arquitectura por capas y no todo en un solo archivo?**
R: Separé API (routers), lógica (services) y datos (models) para que cada capa tenga una responsabilidad. Esto facilita testear, cambiar la BD sin tocar la API y mantener el código. Es el patrón estándar de FastAPI.

**P2. ¿Por qué SPA + API REST y no una app monolítica con plantillas?**
R: Separar frontend y backend permite evolucionar cada uno por separado, reutilizar la API (p.ej. futura app móvil) y dar una experiencia reactiva sin recargas. El costo es manejar CORS y autenticación stateless, que resolví con JWT.

**P3. ¿Qué harías distinto si lo rediseñaras hoy?**
R: Aplicaría `ProtectedRoute` de forma consistente, eliminaría el código muerto (repositorios y páginas legacy), unificaría el estilado en Tailwind y movería la auto-migración del arranque a Alembic puro en producción.

**P4. ¿Cómo fluye una petición desde el navegador hasta la BD?**
R: El navegador hace la request con `Authorization: Bearer <JWT>`; FastAPI valida CORS, una dependencia decodifica el token y carga el usuario, otra verifica el rol, el router llama al service, el service usa el ORM y SQLAlchemy traduce a SQL contra Postgres.

**P5. ¿Es escalable esta arquitectura?**
R: El backend es stateless (JWT), así que escala horizontalmente detrás de un balanceador. Los límites actuales son: faltan índices en FKs y paginación en listados — están en el backlog del Sprint 4.

### Backend
**P6. ¿Qué es FastAPI y por qué lo elegiste?**
R: Un framework web Python asíncrono con validación por tipos y documentación OpenAPI automática. Lo elegí por productividad, tipado fuerte con Pydantic y rendimiento.

**P7. ¿Qué es la inyección de dependencias en FastAPI?**
R: El mecanismo `Depends` que provee a cada endpoint lo que necesita (sesión de BD, usuario actual, verificación de rol) sin que el endpoint los construya. Centraliza y reutiliza esa lógica.

**P8. ¿Cómo separas validación de persistencia?**
R: Con schemas Pydantic para entrada/salida (contrato de API) y modelos SQLAlchemy para la BD. Así la forma de los datos en la API no queda atada a la tabla.

**P9. ¿Qué hace el bootstrap del arranque?**
R: Crea roles base, un admin inicial si la BD está vacía y repara el esquema. Permite que alguien clone el repo y entre sin tocar la BD a mano. En producción lo correcto es Alembic; lo reconozco como mejora.

**P10. ¿Por qué los servicios de notificación nunca lanzan excepción?**
R: Porque una notificación es secundaria a la operación principal. Si falla guardarla, registro un warning pero no rompo la transacción de negocio (p.ej. crear el proyecto). Es una decisión de resiliencia.

### Frontend
**P11. ¿Cómo gestionas el estado de sesión?**
R: Con un `AuthContext` global que persiste el token y el perfil en `localStorage`; al iniciar sesión hago el login y luego cargo `/usuarios/me`.

**P12. ¿Qué hacen los interceptores de Axios?**
R: El de request añade el token a cada llamada; el de response detecta un 401, limpia la sesión y redirige al login. Centraliza autenticación y manejo de expiración.

**P13. ¿Cómo proteges las rutas de admin?**
R: Hoy mediante los layouts (`AdminLayout`/`MainLayout`). Existe un `ProtectedRoute` que debe aplicarse de forma consistente en `App.jsx` — es una mejora identificada en la auditoría.

**P14. ¿Por qué React 19 y Vite?**
R: React por su modelo de componentes y ecosistema; Vite por su velocidad de desarrollo (HMR) y builds optimizados.

### Base de datos
**P15. ¿Por qué UUID como llave primaria en lugar de enteros?**
R: Los UUID no son predecibles ni secuenciales, lo que evita enumerar recursos por ID y facilita generar IDs en distintos lugares sin colisión.

**P16. ¿Cómo manejas el borrado y la integridad referencial?**
R: Las dependencias de un proyecto se borran en cascada; las referencias a usuarios usan `SET NULL` para no perder el histórico de auditoría aunque se elimine un usuario.

**P17. ¿Qué es Alembic y cómo lo usaste?**
R: La herramienta de migraciones de SQLAlchemy. Versiona los cambios de esquema para aplicarlos de forma reproducible (`alembic upgrade head`).

**P18. ¿Cómo soportas SQLite y PostgreSQL a la vez?**
R: Usando SQLAlchemy como capa de abstracción y configurando la `DATABASE_URL` por entorno: SQLite en desarrollo/tests, Postgres (Supabase) en producción.

**P19. ¿Qué es el `audit_log` y por qué jsonb?**
R: Una tabla que registra eventos (registro de usuario, cambio de etapa) con el estado anterior y nuevo en columnas `jsonb`, que permiten guardar estructuras flexibles sin crear columnas por cada campo.

### Docker
**P20. ¿Qué problema resuelve Docker en tu proyecto?**
R: Reproducibilidad: empaqueta backend, frontend y BD con sus dependencias, de modo que `docker compose up` levanta todo igual en cualquier máquina.

**P21. ¿Qué es un build multi-stage y dónde lo usaste?**
R: En el frontend: una etapa con Node compila el bundle y otra con nginx solo sirve los estáticos. La imagen final es pequeña porque no incluye Node ni dependencias de build.

**P22. ¿Para qué los healthchecks y `depends_on`?**
R: Para que el backend no arranque antes de que Postgres esté listo y el frontend no antes que el backend; evita fallos de arranque por orden.

### Seguridad
**P23. ¿Cómo almacenas las contraseñas?**
R: Nunca en claro: hash con bcrypt vía passlib. Solo guardo el hash; en login verifico contra él.

**P24. ¿Qué es un JWT y por qué es stateless?**
R: Un token firmado con claims (usuario, expiración). El servidor no guarda sesión: valida la firma en cada request. Permite escalar sin sesión compartida.

**P25. ¿Cuáles son las vulnerabilidades conocidas de tu sistema hoy?**
R (clave, sé honesto): RLS deshabilitado en Supabase, la descarga de documentos no verifica pertenencia al proyecto, bcrypt trunca a 72 bytes en silencio, y faltó rotar credenciales del `.env`. Están priorizadas en el Sprint 4 de robustez. (Mostrar que las conoces es una fortaleza, no una debilidad.)

**P26. ¿Cómo evitas que alguien descargue archivos por la ruta?**
R: Hago `resolve()` de la ruta y verifico que esté dentro del directorio de uploads para prevenir *path traversal*. La verificación de pertenencia al proyecto es la mejora pendiente que mencioné.

**P27. ¿Qué es RBAC y cómo lo implementaste?**
R: Control de acceso por roles. Una dependencia `require_role("Admin")` verifica el rol del usuario del token antes de ejecutar el endpoint.

**P28. ¿Qué es CORS y por qué te dio problemas?**
R: Es la política que controla qué orígenes pueden llamar a la API desde el navegador. Sin el middleware configurado, el navegador bloqueaba las respuestas y el login fallaba en silencio.

### Escalabilidad
**P29. ¿Qué pasa con 10.000 usuarios?**
R: El backend escala horizontal por ser stateless. Los cuellos de botella serían los listados sin paginar y las FKs sin índice; ambos están identificados para optimizar.

**P30. ¿Cómo harías el chat en tiempo real?**
R: Hoy es por consulta periódica (polling). Lo migraría a WebSockets para empujar mensajes en vivo y reducir carga.

**P31. ¿Dónde guardarías los archivos a escala?**
R: Hoy en disco local/volumen. A escala, en almacenamiento de objetos (S3 / Supabase Storage) con URLs firmadas.

### Testing
**P32. ¿Qué pruebas tienes y con qué cubres?**
R: 11 archivos de pytest sobre auth, usuarios, proyectos, proceso, documentos y mensajes, usando SQLite en memoria. El CI exige cobertura mínima del 60%.

**P33. La documentación dice 85% de cobertura, ¿es exacto?**
R (honesto): El **gate verificable del CI es 60%**. El 85% aparece como objetivo en los reportes de gestión, pero el dato auditable y exigido es el 60%. Prefiero darte la cifra que puedo respaldar.

**P34. ¿Qué módulos no tienen tests?**
R: Tareas, hitos, reuniones, notificaciones y contenidos — los routers más nuevos. Ampliar la cobertura ahí es parte del Sprint 4.

**P35. ¿Por qué SQLite en memoria para tests?**
R: Es rápido, no requiere infraestructura y se descarta al terminar, así los tests son aislados y deterministas.

### Metodologías ágiles
**P36. ¿Cómo aplicaste SCRUM?**
R: Tres sprints con backlog, planning, review y retrospectiva documentados. Cada sprint cerró un incremento funcional (fundamentos → MVP core → interacción y profesionalización).

**P37. ¿Qué cambió entre sprints?**
R: Sprint 1 fundamentos (auth, modelo, CI); Sprint 2 el core (proceso de etapas, dashboard, auditoría); Sprint 3 interacción (documentos, chat, perfil, responsive) más i18n como extra.

**P38. ¿Qué aprendiste en las retrospectivas?**
R: Que requisitos claros aceleran todo, que documentar mientras se desarrolla es más eficiente que hacerlo después, y que la inversión en testing automatizado tiene buen retorno.

### Decisiones técnicas
**P39. ¿Por qué Supabase y no un Postgres propio?**
R: Es Postgres gestionado: me da BD productiva, backups y pooler sin administrar servidores, ideal para el alcance de la práctica.

**P40. ¿Por qué pusiste las keys de i18n en el backend en vez del texto?**
R: Para desacoplar idioma de lógica: el backend emite `titulo_key` + `params` y el frontend traduce. Así agregar un idioma no requiere tocar el backend ni la BD.

**P41. ¿Por qué JWT en `localStorage` y no en cookie httpOnly?**
R: Por simplicidad de integración con el SPA. Soy consciente de que la cookie httpOnly es más segura frente a XSS; es una mejora considerada para producción.

**P42. Si tuvieras una semana más, ¿qué harías?**
R: El Sprint 4 "Robustez": rotar credenciales y cerrar RLS, verificar pertenencia en descargas, índices en FKs, paginación, subir cobertura y limpiar código muerto.

---

## 2. Cómo vender tu trabajo

### Destacar tu impacto
- Abre con el dato objetivo: **"Desarrollé el 95% del producto — 72 de 76 commits son míos"**. Es incontestable.
- Traduce features a valor: "centralicé seguimiento, documentos y comunicación que antes vivían en correos sueltos".

### Mostrar liderazgo técnico
- Cuenta **decisiones de diseño**, no solo features: el i18n desacoplado, el cambio de etapa con auditoría, el bootstrap idempotente. Liderazgo técnico = tomar y justificar decisiones.

### Demostrar aprendizaje
- Usa la curva: empezaste con SQLite local y terminaste con Postgres gestionado en la nube, CI/CD y Docker. "No sabía X, lo aprendí, lo apliqué, y aquí está el resultado".

### Resaltar decisiones importantes
- Enfatiza el **i18n por iniciativa propia** (no estaba comprometido) y la **propuesta del Sprint 4 de robustez** como respuesta a tu propia auditoría.

### Mostrar valor para la empresa
- "Optimixage pasó de no tener plataforma a tener un producto reproducible (`docker compose up`), versionado, con CI y desplegable en la nube".

### Temas que DEBES enfatizar
- Módulo de proceso (core), i18n, autenticación/seguridad, Docker/CI, y tu **conciencia de la deuda técnica** (madurez de ingeniero).

### Temas que DEBES evitar o manejar con cuidado
- **No defiendas como hechos las métricas no verificables** (85% cobertura, 99.5% uptime, ROI +40%, satisfacción 5/5). Si preguntan, reconduce: "ese era el objetivo de gestión; el dato auditable es el gate de CI al 60%".
- **No ocultes los hallazgos de seguridad.** Preséntalos como backlog priorizado. Si finges que no existen y el jurado los encuentra, pierdes credibilidad.
- No describas el sistema feature por feature de forma plana: cada feature debe enlazar con *qué decidiste, qué resolviste y qué aprendiste*.

---

*Documento generado como apoyo a la sustentación. Las afirmaciones técnicas están basadas en el código, el historial Git, la base de datos y la documentación del repositorio a la fecha de análisis.*
