# MANUAL TÉCNICO INTEGRAL — Plataforma Optimixage

**Plataforma de Seguimiento de Proyectos**
**Versión:** 3.0.0
**Última actualización:** 2026-06-10
**Audiencia:** Desarrolladores que se incorporan al proyecto sin contexto previo.

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Descripción General del Sistema](#2-descripción-general-del-sistema)
3. [Arquitectura del Proyecto](#3-arquitectura-del-proyecto)
4. [Tecnologías Utilizadas](#4-tecnologías-utilizadas)
5. [Estructura del Repositorio](#5-estructura-del-repositorio)
6. [Base de Datos](#6-base-de-datos)
7. [Modelos de Dominio](#7-modelos-de-dominio)
8. [Backend](#8-backend)
9. [Frontend](#9-frontend)
10. [Seguridad](#10-seguridad)
11. [Variables de Entorno](#11-variables-de-entorno)
12. [Docker y Despliegue](#12-docker-y-despliegue)
13. [Instalación para Nuevos Desarrolladores](#13-instalación-para-nuevos-desarrolladores)
14. [Flujo Completo del Sistema](#14-flujo-completo-del-sistema)
15. [Decisiones Técnicas Identificadas](#15-decisiones-técnicas-identificadas)
16. [Problemas Encontrados](#16-problemas-encontrados)
17. [Recomendaciones de Mejora](#17-recomendaciones-de-mejora)
18. [Guía de Mantenimiento](#18-guía-de-mantenimiento)
19. [Glosario Técnico](#19-glosario-técnico)
20. [Conclusiones](#20-conclusiones)

---

## 1. Resumen Ejecutivo

### 1.1 Propósito del sistema

**Plataforma Optimixage** es una aplicación web fullstack diseñada para gestionar y dar seguimiento al avance de proyectos entre la consultora **Optimixage** y sus clientes. Constituye una práctica profesional universitaria de Ingeniería de Software (ver [README.md:317](README.md#L317)).

### 1.2 Problema que resuelve

Antes de esta plataforma, la consultora gestionaba el seguimiento de cada cliente de forma fragmentada:
- Documentos enviados por correo electrónico sin trazabilidad.
- Reuniones agendadas en hilos de chat con riesgo de duplicidad.
- Comunicación dispersa entre WhatsApp, email y llamadas.
- Ausencia de un panel único que mostrara en qué etapa del proceso comercial está cada cliente.

La plataforma centraliza **documentos**, **comunicación**, **agenda**, **seguimiento de etapas** y **notificaciones** en una sola aplicación con control de acceso por roles.

### 1.3 Objetivos del proyecto

| Objetivo | Mecanismo en el sistema |
|---|---|
| Trazabilidad del avance comercial | Modelo de etapas con historial ([backend/app/models/etapa_historial.py](backend/app/models/etapa_historial.py)) |
| Compartir documentos de forma segura | Upload validado por tipo/tamaño + control de descarga por proyecto ([backend/app/api/documentos_router.py:45](backend/app/api/documentos_router.py#L45)) |
| Comunicación bidireccional persistente | Chat por proyecto entre admin y cliente ([backend/app/models/mensaje.py](backend/app/models/mensaje.py)) |
| Notificaciones automáticas | Broadcast + notificaciones por evento ([backend/app/services/notificaciones_service.py](backend/app/services/notificaciones_service.py)) |
| Internacionalización | i18next con español, inglés y portugués ([frontend/src/config/i18n.js](frontend/src/config/i18n.js)) |
| Auditoría de cambios sensibles | Tabla `audit_log` con detalle JSON ([backend/app/models/audit_log.py](backend/app/models/audit_log.py)) |

### 1.4 Usuarios objetivo

| Rol | Quién es | Qué hace |
|---|---|---|
| **Admin** | Consultor / staff de Optimixage | Crea clientes, crea proyectos, asigna etapas, sube documentos, agenda reuniones, envía broadcasts |
| **Cliente** | Empresa contratante del servicio | Ve su proyecto, descarga documentos, escribe en el chat, ve su agenda de reuniones, recibe notificaciones |

Roles definidos en [backend/app/main.py:39](backend/app/main.py#L39) (sembrados al arranque).

---

## 2. Descripción General del Sistema

### 2.1 Explicación funcional

La aplicación es una **SPA (Single Page Application)** React que consume una **REST API** FastAPI. Mantiene sesión vía **JWT en localStorage**. Cada usuario, al autenticarse, ve un layout y unas rutas distintas según su rol:

- **Admin** entra a `/admin/*` (gestión de clientes, proyectos, contenido, broadcasts).
- **Cliente** entra a `/*` (vista de su propio proyecto, documentos, chat, agenda).

### 2.2 Flujo de negocio principal

```
Cliente nuevo
    │
    ▼
Admin lo registra (Auth: /auth/register)
    │
    ▼
Admin crea un Proyecto y lo asigna al Cliente
    │
    ▼
Etapa inicial: "primer_contacto"
    │
    ▼
Admin cambia etapas conforme avanza el proyecto:
primer_contacto → diagnostico → capacitacion → desarrollo → entrega
    │
    ▼
Cada cambio:
  - Cierra registro de EtapaHistorial anterior
  - Crea registro nuevo
  - Notifica al cliente
  - Notifica a otros admins
  - Registra en audit_log
    │
    ▼
Durante el proyecto:
  - Admin sube documentos (PDF/DOCX/etc.) → Cliente los descarga
  - Ambos chatean en /mensajes
  - Admin agenda reuniones
  - Admin sube contenido formativo (imágenes/videos)
    │
    ▼
Cliente puede:
  - Ver su Proceso (etapa actual + historial)
  - Descargar Documentos del proyecto
  - Ver Contenido (global + personalizado)
  - Conversar por Mensajes
  - Marcar notificaciones como leídas
```

Etapas: [backend/app/schemas/proceso_schema.py:6](backend/app/schemas/proceso_schema.py#L6).

### 2.3 Casos de uso principales

| Caso de uso | Actor | Endpoint relevante | Página frontend |
|---|---|---|---|
| Iniciar sesión | Todos | `POST /auth/login` | [Login.jsx](frontend/src/pages/Login.jsx) |
| Registrar nuevo cliente | Admin | `POST /auth/register` | [admin/Clientes.jsx](frontend/src/pages/admin/Clientes.jsx) |
| Crear proyecto | Admin | `POST /proyectos/` | [admin/Clientes.jsx](frontend/src/pages/admin/Clientes.jsx) |
| Cambiar etapa de un proyecto | Admin | `POST /proceso/{id}/cambiar-etapa` | [admin/Proceso.jsx](frontend/src/pages/admin/Proceso.jsx) |
| Subir documento | Admin | `POST /documentos/upload` | [admin/Documentos.jsx](frontend/src/pages/admin/Documentos.jsx) |
| Descargar documento | Cliente/Admin | `GET /documentos/download/{p}/{f}` | [cliente/Documentos.jsx](frontend/src/pages/cliente/Documentos.jsx) |
| Enviar mensaje | Cliente/Admin | `POST /mensajes/` | [admin/Mensajes.jsx](frontend/src/pages/admin/Mensajes.jsx) / [MessageChat.jsx](frontend/src/components/MessageChat.jsx) |
| Programar reunión | Admin | `POST /reuniones/` | [ReunionesClienteModal.jsx](frontend/src/components/admin/ReunionesClienteModal.jsx) |
| Subir contenido formativo | Admin | `POST /contenidos/upload` | [admin/Contenido.jsx](frontend/src/pages/admin/Contenido.jsx) |
| Broadcast de notificación | Admin | `POST /notificaciones/broadcast` | [admin/BroadcastModal.jsx](frontend/src/pages/admin/BroadcastModal.jsx) |
| Ver dashboard cliente | Cliente | `GET /proyectos/mis-proyectos` + agregaciones | [cliente/Inicio.jsx](frontend/src/pages/cliente/Inicio.jsx) |
| Cambiar idioma | Todos | (sin backend) | [LanguageSwitcher.jsx](frontend/src/components/common/LanguageSwitcher.jsx) |

### 2.4 Alcance del proyecto

**Incluido:**
- Autenticación JWT con bcrypt.
- Dos roles (Admin / Cliente) con control granular.
- 13 entidades de dominio (ver §6).
- 11 routers FastAPI con ~60 endpoints.
- ~30 páginas/componentes React.
- Internacionalización en 3 idiomas.
- Upload de archivos con validación de tipo y tamaño.
- Broadcast de notificaciones.
- Auditoría de cambios sensibles.
- Migraciones Alembic.
- Docker Compose para producción local.
- CI con GitHub Actions (tests + build + artifact).

**NO incluido:**
- Pago en línea.
- Multi-tenant (una sola instancia = una sola consultora).
- Refresh tokens (solo access token de 60 min).
- Recuperación de contraseña por email.
- Notificaciones push o por email reales.
- Roles personalizados (solo Admin/Cliente hardcoded).

---

## 3. Arquitectura del Proyecto

### 3.1 Arquitectura utilizada

**Arquitectura cliente-servidor con separación frontend/backend y patrón en capas en el backend.**

```
┌─────────────────────────────────────────────────────────────┐
│                       NAVEGADOR                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Frontend React 19 (SPA)                              │  │
│  │  - React Router 7 (routing client-side)               │  │
│  │  - Axios (HTTP client con interceptor JWT)            │  │
│  │  - Context API (auth state)                           │  │
│  │  - i18next (i18n)                                     │  │
│  │  - Tailwind 4 + estilos inline                        │  │
│  └────────────────┬──────────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────────┘
                    │ HTTP/JSON (Authorization: Bearer ...)
                    │
        ┌───────────▼────────────┐
        │  nginx (en producción) │  proxy /api → backend:8000
        └───────────┬────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                 BACKEND FastAPI                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Capa API (routers)         backend/app/api/          │  │
│  │  - Valida con dependencias (auth, role)               │  │
│  │  - Parsea con Pydantic schemas                        │  │
│  └────────────────┬──────────────────────────────────────┘  │
│                   │                                         │
│  ┌────────────────▼──────────────────────────────────────┐  │
│  │  Capa Servicios            backend/app/services/      │  │
│  │  - Lógica de negocio                                  │  │
│  │  - Coordinación entre modelos                         │  │
│  │  - Disparo de notificaciones / audit                  │  │
│  └────────────────┬──────────────────────────────────────┘  │
│                   │                                         │
│  ┌────────────────▼──────────────────────────────────────┐  │
│  │  Capa Modelos              backend/app/models/        │  │
│  │  - SQLAlchemy 2 ORM                                   │  │
│  │  - Relaciones, FKs, defaults                          │  │
│  └────────────────┬──────────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────────┘
                    │ SQL
                    │
            ┌───────▼────────┐
            │  PostgreSQL 15 │   (o SQLite en dev/test)
            │   (Supabase)   │
            └────────────────┘
```

### 3.2 Patrones de diseño identificados

| Patrón | Dónde se aplica | Ejemplo |
|---|---|---|
| **Dependency Injection** | FastAPI usa `Depends()` para inyectar DB session, usuario actual y rol requerido | [dependencies.py:14](backend/app/core/dependencies.py#L14) |
| **Repository (parcial)** | Hay esqueleto en `backend/app/repositories/` pero no se usa de forma consistente; la mayoría del código accede al ORM directamente desde routers o services | [repositories/](backend/app/repositories/) |
| **Service Layer** | Cada dominio con lógica no trivial tiene su service (notificaciones, mensajes, documentos, auth) | [services/](backend/app/services/) |
| **Schema / DTO** | Pydantic separa el modelo de BD del contrato HTTP — `Create`, `Update`, `Response` por entidad | [schemas/](backend/app/schemas/) |
| **Factory** | Sembrado idempotente de roles y admin inicial al arranque | [main.py:25](backend/app/main.py#L25) |
| **Middleware** | CORS global vía `CORSMiddleware` | [main.py:140](backend/app/main.py#L140) |
| **Provider Pattern (React)** | `AuthProvider` envuelve la app y expone `useAuth()` por contexto | [AuthContext.jsx](frontend/src/context/AuthContext.jsx) |
| **Protected Routes (React)** | `MainLayout` y `AdminLayout` redirigen según rol | [MainLayout.jsx:8](frontend/src/components/layout/MainLayout.jsx#L8), [AdminLayout.jsx:12](frontend/src/components/layout/AdminLayout.jsx#L12) |
| **Lifespan hook** | FastAPI ejecuta `_ensure_schema_actualizado` + `_seed_roles_y_admin` antes de aceptar requests | [main.py:121](backend/app/main.py#L121) |

### 3.3 Diagrama textual de arquitectura (despliegue)

```
                   ┌──────────────────────┐
                   │   Internet (cliente) │
                   └──────────┬───────────┘
                              │
                ┌─────────────▼──────────────┐
                │  Docker Compose stack      │
                │ ┌────────────────────────┐ │
                │ │ frontend (nginx:alpine)│ │  Puerto 3000 ← 80 interno
                │ │  - sirve dist estático │ │
                │ │  - proxy /api → backend│ │
                │ └──────────┬─────────────┘ │
                │            │               │
                │ ┌──────────▼─────────────┐ │
                │ │ backend (python:3.11-  │ │  Puerto 8000
                │ │ slim)                  │ │
                │ │  - uvicorn + FastAPI   │ │
                │ │  - healthcheck /health │ │
                │ │  - volumen: uploads/   │ │
                │ └──────────┬─────────────┘ │
                │            │               │
                │ ┌──────────▼─────────────┐ │
                │ │ db (postgres:15-alpine)│ │  Puerto 5432
                │ │  - volumen: postgres_  │ │
                │ │    data                │ │
                │ │  - healthcheck pg_     │ │
                │ │    isready             │ │
                │ └────────────────────────┘ │
                └────────────────────────────┘
```

### 3.4 Responsabilidades de cada capa

| Capa | Responsabilidad | Archivos clave |
|---|---|---|
| **Frontend** | UI, navegación, captura de input, gestión de sesión cliente, internacionalización | `frontend/src/` |
| **API (routers)** | Exposición HTTP, validación de entrada con Pydantic, RBAC con dependencias, serialización de respuesta | `backend/app/api/` |
| **Services** | Lógica de negocio, orquestación entre modelos, disparo de efectos colaterales (notificaciones, auditoría) | `backend/app/services/` |
| **Models** | Mapeo ORM de tablas, relaciones, defaults, constraints | `backend/app/models/` |
| **Core** | Configuración, DB engine, seguridad (hash), dependencias compartidas | `backend/app/core/` |
| **Utils** | Logger, auditoría, helpers transversales | `backend/app/utils/` |

---

## 4. Tecnologías Utilizadas

### 4.1 Tabla completa

| Tecnología | Versión | Capa | Propósito | Justificación de uso |
|---|---|---|---|---|
| **Python** | 3.10+ (rec. 3.11) | Backend runtime | Lenguaje del backend | Ecosistema maduro para web APIs, expresivo y con tipado opcional |
| **FastAPI** | 0.115.0 | Backend framework | Define endpoints HTTP, valida payloads, genera OpenAPI | Más rápido que Flask, sintaxis declarativa, validación automática con Pydantic, soporta async |
| **Uvicorn** | 0.32.0 (`[standard]`) | Backend server | ASGI server para FastAPI | Server ASGI estándar de facto para FastAPI |
| **Pydantic** | 2.9.2 | Backend validation | Define schemas para request/response | Validación declarativa, serialización JSON automática, integrado con FastAPI |
| **SQLAlchemy** | 2.0.36 | Backend ORM | Mapea clases Python a tablas SQL | ORM más usado en Python, soporta múltiples DBs (Postgres/SQLite) |
| **Alembic** | 1.13.3 | Backend migrations | Versiona el schema de la BD | Estándar para migraciones con SQLAlchemy |
| **psycopg2-binary** | 2.9.10 | Backend DB driver | Conector PostgreSQL | Driver más maduro para Python ↔ Postgres |
| **python-jose** | 3.3.0 `[cryptography]` | Backend auth | Genera y verifica JWT | Implementación pura Python de JWT con criptografía robusta |
| **passlib** | 1.7.4 `[bcrypt]` | Backend auth | Hashea contraseñas con bcrypt | API estándar para hashing seguro de contraseñas |
| **bcrypt** | 4.0.1 | Backend auth | Algoritmo de hash | Estándar industria para hashing de contraseñas |
| **python-dotenv** | 1.0.1 | Backend config | Carga `.env` en `os.environ` | Permite gestionar configuración fuera del código |
| **python-multipart** | 0.0.12 | Backend upload | Parsea `multipart/form-data` | Requerido por FastAPI para uploads de archivos |
| **email-validator** | 2.2.0 | Backend validation | Valida emails en Pydantic | Usado por `EmailStr` de Pydantic |
| **pytest + pytest-cov** | 8.3.3 / 5.0.0 | Backend testing | Tests unitarios e integración con cobertura | Estándar de testing en Python |
| **React** | 19.2.4 | Frontend framework | UI declarativa por componentes | Estándar industria, comunidad masiva |
| **Vite** | 8.0.1 | Frontend build | Bundler + dev server con HMR | Mucho más rápido que webpack, configuración mínima |
| **React Router** | 7.14.0 | Frontend routing | Routing client-side | Router más usado del ecosistema React |
| **Axios** | 1.16.0 | Frontend HTTP | Cliente HTTP con interceptores | Permite interceptar requests/responses para inyectar JWT y manejar 401 |
| **i18next + react-i18next** | 26 / 17 | Frontend i18n | Internacionalización por namespaces | Lib más completa para React, soporta backend remoto de JSON |
| **i18next-http-backend** | 4.0.0 | Frontend i18n | Carga locales por HTTP desde `/locales/` | Permite añadir idiomas sin rebuild |
| **i18next-browser-languagedetector** | 8.2.1 | Frontend i18n | Detecta idioma del navegador / localStorage | Mejor UX inicial |
| **Tailwind CSS** | 4.2.2 | Frontend styling | Utility-first CSS | Estilos rápidos sin nombrar clases; v4 con plugin oficial de Vite |
| **lucide-react** | 1.7.0 | Frontend iconos | Set de iconos SVG | Iconos tree-shakable, consistentes |
| **ESLint** | 9.39.4 | Frontend lint | Linter de JS/JSX | Mantiene calidad de código |
| **PostgreSQL** | 15 (alpine) | Database | Sistema de gestión de BD relacional | Estándar abierto, soporte de UUID nativo y JSONB |
| **SQLite** | (stdlib Python) | Database (test/dev) | DB embebida en archivo | Permite arrancar sin instalar nada; usado en tests con `:memory:` |
| **Docker** | 24+ | Infra | Contenerización | Reproduce el entorno entre máquinas |
| **Docker Compose** | v2 | Infra | Orquestación local de contenedores | Levanta DB + backend + frontend con un comando |
| **nginx (alpine)** | 1.x | Infra | Servidor web para el bundle estático | Sirve `dist/` y proxy `/api` al backend |
| **GitHub Actions** | — | CI/CD | Pipelines de CI | Tests + build + artifact + staging stub |

### 4.2 Idiomas soportados

El sistema sirve UI en 3 idiomas configurados en [frontend/src/config/i18n.js:7](frontend/src/config/i18n.js#L7):

| Código | Idioma | Carpeta de catálogos |
|---|---|---|
| `es` | Español (default + fallback) | [frontend/public/locales/es/](frontend/public/locales/es/) |
| `en` | Inglés | [frontend/public/locales/en/](frontend/public/locales/en/) |
| `pt` | Portugués | [frontend/public/locales/pt/](frontend/public/locales/pt/) |

Cada idioma tiene namespaces JSON: `common.json`, `auth.json`, `client.json`, `validation.json`, `errors.json`, `admin.json`, `translation.json`.

---

## 5. Estructura del Repositorio

### 5.1 Árbol comentado

```
optimixage/
│
├── backend/                          # === APP FastAPI ===
│   ├── app/
│   │   ├── api/                      # Routers FastAPI (capa HTTP)
│   │   │   ├── auth_router.py        # /auth/login, /auth/register
│   │   │   ├── usuarios_router.py    # /usuarios/me, perfil, avatar, password
│   │   │   ├── proyectos_router.py   # /proyectos/* + admin/todos
│   │   │   ├── documentos_router.py  # /documentos/upload, download, delete
│   │   │   ├── mensajes_router.py    # /mensajes/ chat por proyecto
│   │   │   ├── hitos_router.py       # /hitos/ CRUD por proyecto
│   │   │   ├── tareas_router.py      # /tareas/ CRUD + asignación
│   │   │   ├── reuniones_router.py   # /reuniones/ agenda
│   │   │   ├── notificaciones_router.py # /notificaciones/ + broadcast
│   │   │   ├── proceso_router.py     # /proceso/ cambio de etapa + historial
│   │   │   └── contenidos_router.py  # /contenidos/ material formativo
│   │   │
│   │   ├── core/                     # Núcleo de infraestructura
│   │   │   ├── config.py             # Settings desde .env
│   │   │   ├── database.py           # engine, SessionLocal, Base, get_db
│   │   │   ├── security.py           # hash_password, verify_password (bcrypt)
│   │   │   └── dependencies.py       # get_current_user, require_role (JWT + RBAC)
│   │   │
│   │   ├── models/                   # ORM SQLAlchemy (tablas BD)
│   │   │   ├── rol.py
│   │   │   ├── usuario.py
│   │   │   ├── proyecto.py
│   │   │   ├── proyecto_miembro.py
│   │   │   ├── hito.py
│   │   │   ├── tarea.py
│   │   │   ├── documento.py
│   │   │   ├── mensaje.py
│   │   │   ├── reunion.py
│   │   │   ├── notificacion.py
│   │   │   ├── etapa_historial.py
│   │   │   ├── audit_log.py
│   │   │   └── contenido.py
│   │   │
│   │   ├── schemas/                  # Pydantic (DTOs HTTP)
│   │   │   ├── usuario_schema.py     # UsuarioCreate, Login, Response
│   │   │   ├── proyecto_schema.py
│   │   │   ├── proceso_schema.py     # incluye ETAPAS y ETAPA_LABELS
│   │   │   ├── hito_schema.py
│   │   │   ├── tarea_schema.py
│   │   │   ├── documento_schema.py
│   │   │   ├── mensaje_schema.py
│   │   │   ├── reunion_schema.py
│   │   │   ├── notificacion_schema.py
│   │   │   └── contenido_schema.py
│   │   │
│   │   ├── services/                 # Lógica de negocio
│   │   │   ├── auth_service.py       # crear_usuario, autenticar_usuario, crear_token
│   │   │   ├── proyecto_service.py
│   │   │   ├── documento_service.py
│   │   │   ├── mensaje_service.py
│   │   │   └── notificaciones_service.py  # crear/broadcast notificaciones
│   │   │
│   │   ├── repositories/             # (Esqueleto parcial — no usado consistentemente)
│   │   │   ├── usuario_repository.py
│   │   │   ├── proyecto_repository.py
│   │   │   └── documento_repository.py
│   │   │
│   │   ├── utils/
│   │   │   ├── audit.py              # registrar_evento → audit_log
│   │   │   ├── helpers.py
│   │   │   └── logger.py             # get_logger (stdout)
│   │   │
│   │   ├── scripts/
│   │   │   └── seed_roles.py         # Seed manual de roles (alternativa al lifespan)
│   │   │
│   │   └── main.py                   # Punto de entrada FastAPI + lifespan + CORS + routers
│   │
│   ├── alembic/                      # Migraciones de BD
│   │   ├── env.py                    # Lee settings.DATABASE_URL dinámicamente
│   │   └── versions/
│   │       ├── 1bf0849f205c_initial_tables.py
│   │       ├── a2c3d4e5f6a7_sprint2_documentos_mensajes.py
│   │       ├── c2d3e4f5a6b7_sprint2_proceso_core.py
│   │       ├── b1c2d3e4f5a6_sprint3_schema_completo_supabase.py
│   │       └── d3e4f5a6b7c8_contenidos_y_reunion_estado.py  # HEAD
│   │
│   ├── tests/                        # Pytest con SQLite in-memory
│   │   ├── conftest.py               # Fixtures: client, admin_token, auth_token, proyecto_id
│   │   ├── test_auth.py
│   │   ├── test_users.py
│   │   ├── test_usuarios_perfil.py
│   │   ├── test_proyectos.py
│   │   ├── test_proyectos_admin.py
│   │   ├── test_proceso.py
│   │   ├── test_documentos.py
│   │   ├── test_documentos_sprint3.py
│   │   ├── test_mensajes.py
│   │   └── test_mensajes_sprint3.py
│   │
│   ├── uploads/                      # Archivos subidos (volumen Docker)
│   ├── alembic.ini                   # Config Alembic
│   ├── Dockerfile                    # Imagen Python 3.11-slim
│   ├── .dockerignore
│   └── requirements.txt              # Dependencias Python
│
├── frontend/                         # === APP React 19 ===
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Botones, Inputs, Modal, Logo, etc.
│   │   │   │   ├── Button.jsx / .css
│   │   │   │   ├── Card.jsx / .css
│   │   │   │   ├── Input.jsx / .css
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Logo.jsx
│   │   │   │   ├── LanguageSwitcher.jsx
│   │   │   │   └── AvatarUploader.jsx
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx    # Layout cliente: Sidebar + Outlet
│   │   │   │   ├── AdminLayout.jsx   # Layout admin: AdminSidebar + Outlet
│   │   │   │   ├── Sidebar.jsx       # Nav cliente con badge de notifs
│   │   │   │   └── AdminSidebar.jsx  # Nav admin
│   │   │   ├── admin/
│   │   │   │   └── ReunionesClienteModal.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   ├── MessageChat.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx             # /login
│   │   │   ├── cliente/              # Rutas /inicio /documentos /proceso /contenido /contacto /notificaciones /configuracion
│   │   │   │   ├── Inicio.jsx
│   │   │   │   ├── Documentos.jsx
│   │   │   │   ├── Proceso.jsx
│   │   │   │   ├── Contenido.jsx
│   │   │   │   ├── Contacto.jsx
│   │   │   │   ├── Notificaciones.jsx
│   │   │   │   └── Configuracion.jsx
│   │   │   ├── admin/                # Rutas /admin/clientes /admin/proceso /admin/documentos /admin/mensajes /admin/notificaciones /admin/contenido /admin/configuracion
│   │   │   │   ├── Clientes.jsx
│   │   │   │   ├── Proceso.jsx
│   │   │   │   ├── Documentos.jsx
│   │   │   │   ├── Mensajes.jsx
│   │   │   │   ├── Notificaciones.jsx
│   │   │   │   ├── Contenido.jsx
│   │   │   │   ├── Configuracion.jsx
│   │   │   │   └── BroadcastModal.jsx
│   │   │   ├── Dashboard.jsx / DashboardPage.jsx  # placeholders / legacy
│   │   │   ├── LoginPage.jsx                       # legacy
│   │   │   ├── ProjectDetailPage.jsx               # legacy
│   │   │   ├── AdminPage.jsx                       # legacy
│   │   │   └── Documents.jsx / .css                # legacy
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # AuthProvider + useAuth
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # axios.create + interceptors JWT + 401
│   │   │
│   │   ├── config/
│   │   │   └── i18n.js               # init i18next con 3 idiomas y HTTP backend
│   │   │
│   │   ├── utils/
│   │   │   ├── locale.js
│   │   │   └── notif.js
│   │   │
│   │   ├── App.jsx                   # Rutas + AuthProvider + ErrorBoundary
│   │   ├── main.jsx                  # createRoot + StrictMode
│   │   └── index.css                 # Variables CSS + @import "tailwindcss"
│   │
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── logo.png / logo2.png / logo3.png
│   │   ├── icons.svg
│   │   └── locales/                  # JSON i18n por idioma y namespace
│   │       ├── es/
│   │       ├── en/
│   │       └── pt/
│   │
│   ├── index.html                    # Template Vite
│   ├── vite.config.js                # Plugins react + tailwindcss + proxy /api
│   ├── eslint.config.js
│   ├── nginx.conf                    # En producción: sirve dist + proxy /api → backend:8000
│   ├── Dockerfile                    # multi-stage: node build → nginx serve
│   ├── package.json
│   └── .env.example                  # VITE_API_URL
│
├── docs/                             # Documentación universitaria (sprints, informes APA, .docx, .pptx)
│   ├── sprint1/                      # KA01 (stack), KA02 (auth), KA03 (storage), modelo_datos.md, arquitectura_sistema.md, devops_setup.md, informe_avance_sprint1.md
│   ├── SPRINT_3_REVIEW.md / SPRINT_3_RETROSPECTIVE.md / etc.
│   ├── PROJECT_ROADMAP.md
│   ├── Informe_Sprint2_APA.docx / Informe_Sprint2_APA_v2.docx
│   ├── T1PRACTICA*.xlsx              # Documento universitario con 3 referencias por actividad
│   ├── Sustentacion_Practica_Optimixage.pptx
│   ├── Original/                     # Maquetas Next.js (referencia, no se usan)
│   └── backups/                      # Capturas pantalla, logos
│
├── scripts/
│   ├── setup.ps1 / setup.sh          # Setup automático (venv + deps + alembic + npm)
│   ├── dev-backend.ps1 / .sh         # Lanza uvicorn
│   ├── dev-frontend.ps1 / .sh        # Lanza vite dev
│   └── verify-env.py                 # Diagnóstico de entorno
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # Pipeline GitHub Actions
│
├── uploads/                          # (legado raíz — el real está en backend/uploads/)
├── .env / .env.example               # Variables de entorno del backend (carga desde raíz)
├── .gitignore
├── .mcp.json                         # Config MCP (Anthropic)
├── docker-compose.yml                # Orquestación 3 servicios
├── render.yaml                       # Blueprint Render (despliegue cloud)
├── README.md                         # Fuente de verdad para instalación
├── requirements.txt                  # Espejo de backend/requirements.txt para CI
└── (.md auxiliares de auditoría / i18n / portabilidad / informes)
```

### 5.2 Función y dependencias de carpetas clave

| Carpeta | Función | Depende de | Es consumida por |
|---|---|---|---|
| `backend/app/api/` | Define endpoints HTTP | `core/`, `schemas/`, `services/`, `models/` | FastAPI app (`main.py`) |
| `backend/app/services/` | Lógica de negocio | `models/`, `utils/` | `api/`, `main.py` |
| `backend/app/models/` | ORM tables | `core/database.py` | `services/`, `api/`, `alembic/` |
| `backend/app/schemas/` | Validación I/O | (Pydantic) | `api/` |
| `backend/app/core/` | Infraestructura compartida | (libs) | Todo el backend |
| `backend/alembic/` | Migraciones | `core/database.py` (Base) | Solo CLI `alembic` |
| `frontend/src/components/` | UI reutilizable | `services/api.js`, `context/` | `pages/` |
| `frontend/src/pages/` | Vistas/páginas | `components/`, `services/`, `context/` | `App.jsx` (Routes) |
| `frontend/src/context/` | Estado global | `services/api.js` | Toda la app frontend |
| `frontend/src/services/` | Cliente HTTP centralizado | (axios) | `context/`, `pages/`, `components/` |
| `frontend/public/locales/` | Catálogos de i18n | — | `config/i18n.js` (cargado vía HTTP) |

---

## 6. Base de Datos

### 6.1 Motor utilizado

- **Producción / Docker:** PostgreSQL 15 (imagen `postgres:15-alpine`).
- **Recomendado en cloud:** PostgreSQL gestionado vía **Supabase** (Connection Pooling Transaction mode, puerto 6543).
- **Tests / desarrollo rápido:** SQLite (`sqlite:///./optimixage.db` o `sqlite:///:memory:` en tests).

El motor se elige por `DATABASE_URL` en [.env.example](.env.example). El código adapta:
- Tipos UUID: postgres nativos vs `VARCHAR(36)` en SQLite.
- `check_same_thread=False` solo para SQLite en [database.py:16](backend/app/core/database.py#L16).
- `pool_pre_ping=True` para sobrevivir reconexiones del pooler.

### 6.2 Modelo de datos completo

#### Tablas y propósito

| # | Tabla | Propósito |
|---|---|---|
| 1 | `roles` | Define roles del sistema (`Admin`, `Cliente`) |
| 2 | `usuarios` | Cuentas de usuario con perfil |
| 3 | `proyectos` | Proyectos comerciales gestionados |
| 4 | `proyecto_miembros` | Miembros adicionales de un proyecto (más allá del cliente principal) |
| 5 | `proyecto_etapa_historial` | Cambios de etapa con fechas y notas |
| 6 | `hitos` | Hitos planificados de un proyecto |
| 7 | `tareas` | Tareas asignables a usuarios, opcionalmente ligadas a un hito |
| 8 | `documentos` | Metadatos de archivos subidos por proyecto |
| 9 | `mensajes` | Chat por proyecto entre admin y cliente |
| 10 | `reuniones` | Agenda de reuniones por proyecto |
| 11 | `notificaciones` | Avisos individuales y broadcasts |
| 12 | `audit_log` | Registro de cambios sensibles con detalle JSON |
| 13 | `contenidos` | Material formativo (imagen/video), global o por cliente |

#### Diagrama Entidad-Relación (textual)

```
┌──────────────┐                            ┌──────────────────┐
│   roles      │                            │   audit_log      │
│ id (PK)      │                            │ id (PK)          │
│ nombre UNIQUE│                            │ usuario_id FK── ─┐
└──────┬───────┘                            │ accion           │
       │ 1                                  │ tabla            │
       │                                    │ registro_id      │
       │ N                                  │ detalle_anterior │
┌──────▼──────────────────┐                 │   JSON           │
│   usuarios              │                 │ detalle_nuevo    │
│ id (PK)                 │                 │   JSON           │
│ nombre                  │                 │ created_at       │
│ email UNIQUE INDEX      │                 └──────────────────┘
│ password_hash (bcrypt)  │
│ rol_id FK → roles       │ 1
│ telefono                │─────────────────┐
│ avatar_url              │                 │
│ is_active DEFAULT true  │ 1               │ creado_por
│ created_at / updated_at │                 │
└─┬───────────────────────┘                 │
  │ 1                                       │
  │                                         │
  │ N (como cliente)                        │
  │                                         │
┌─▼───────────────────────┐                 │
│   proyectos             │                 │
│ id (PK)                 │                 │
│ nombre                  │                 │
│ descripcion             │                 │
│ estado DEFAULT 'activo' │                 │
│ etapa_actual DEFAULT    │                 │
│   'primer_contacto'     │                 │
│ fecha_inicio / fecha_fin│                 │
│ cliente_id FK → usuarios│                 │
│ created_by FK → usuarios│                 │
│ created_at / updated_at │                 │
└─┬──────────────────────┬┘                 │
  │ 1                   │  1                │
  │                     │                   │
  │ N (hitos)           │ N (tareas)        │
  │                     │                   │
┌─▼──────────────┐    ┌─▼──────────────────────┐
│  hitos         │    │   tareas               │
│ id (PK)        │    │ id (PK)                │
│ nombre         │    │ titulo                 │
│ descripcion    │    │ descripcion            │
│ proyecto_id FK │    │ estado DEFAULT         │
│ fecha_limite   │    │   'pendiente'          │
│ estado DEFAULT │ 1  │ prioridad DEFAULT      │
│   'pendiente'  │────│   'media'              │
│ orden DEFAULT 0│  N │ proyecto_id FK         │
│ created_at /   │    │ hito_id FK → hitos     │
│ updated_at     │    │ asignado_a FK → usuarios
└────────────────┘    │ creado_por FK → usuarios
                      │ fecha_limite           │
                      │ created_at / updated_at│
                      └────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ proyecto_miembros    │  │   reuniones          │  │  documentos          │
│ id (PK)              │  │ id (PK)              │  │ id (PK)              │
│ proyecto_id FK       │  │ titulo               │  │ titulo               │
│ usuario_id  FK       │  │ descripcion          │  │ descripcion          │
│ rol_en_proyecto      │  │ fecha (TZ)           │  │ url                  │
│   DEFAULT 'miembro'  │  │ duracion_minutos     │  │ estado DEFAULT       │
│ joined_at            │  │ enlace               │  │   'borrador'         │
│ UNIQUE(proyecto_id,  │  │ estado DEFAULT       │  │ tipo DEFAULT 'otro'  │
│        usuario_id)   │  │   'pendiente'        │  │ proyecto_id FK       │
└──────────────────────┘  │ proyecto_id FK       │  │ autor_id FK          │
                          │ creado_por FK        │  │ fecha_creacion       │
                          │ created_at /         │  │ updated_at           │
                          │   updated_at         │  └──────────────────────┘
                          └──────────────────────┘

┌──────────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ proyecto_etapa_historial │  │   mensajes           │  │  notificaciones      │
│ id (PK)                  │  │ id (PK)              │  │ id (PK)              │
│ proyecto_id FK CASCADE   │  │ contenido            │  │ usuario_id FK CASCADE│
│ etapa                    │  │ proyecto_id FK       │  │ tipo                 │
│ fecha_inicio             │  │ remitente_id FK      │  │ titulo               │
│ fecha_fin                │  │ fecha_envio          │  │ contenido            │
│ cambiado_por FK SET NULL │  │ leido DEFAULT false  │  │ leida DEFAULT false  │
│ notas                    │  └──────────────────────┘  │ referencia_id        │
└──────────────────────────┘                            │ referencia_tipo      │
                                                        │ created_at           │
                                                        │ titulo_key (i18n)    │
                                                        │ contenido_key (i18n) │
                                                        │ params JSONB         │
                                                        └──────────────────────┘

┌──────────────────────┐
│   contenidos         │
│ id (PK)              │
│ titulo               │
│ descripcion          │
│ tipo (imagen|video)  │
│ url                  │
│ creado_por FK        │
│ cliente_id FK NULL=  │   ← NULL significa "global, visible para todos"
│   global             │
│ created_at /         │
│ updated_at           │
└──────────────────────┘
```

### 6.3 Llaves primarias

**Todas** las tablas usan `UUID` (no autoincrement) como PK:
- En PostgreSQL: `UUID(as_uuid=True)` con `default=uuid.uuid4`.
- En SQLite: `VARCHAR(36)` (manejado por SQLAlchemy).

Razón: UUIDs evitan colisiones entre entornos, son seguros para exponer en URLs y permiten generación client-side si se necesitara en el futuro.

### 6.4 Llaves foráneas (resumen)

| Tabla origen | Columna | Tabla destino | Acción |
|---|---|---|---|
| `usuarios` | `rol_id` | `roles.id` | (sin cascade) |
| `proyectos` | `cliente_id` | `usuarios.id` | (sin cascade) |
| `proyectos` | `created_by` | `usuarios.id` | (sin cascade) |
| `proyecto_miembros` | `proyecto_id` | `proyectos.id` | `ON DELETE CASCADE` |
| `proyecto_miembros` | `usuario_id` | `usuarios.id` | `ON DELETE CASCADE` |
| `proyecto_etapa_historial` | `proyecto_id` | `proyectos.id` | `ON DELETE CASCADE` |
| `proyecto_etapa_historial` | `cambiado_por` | `usuarios.id` | `ON DELETE SET NULL` |
| `hitos` | `proyecto_id` | `proyectos.id` | `ON DELETE CASCADE` |
| `tareas` | `proyecto_id` | `proyectos.id` | `ON DELETE CASCADE` |
| `tareas` | `hito_id` | `hitos.id` | `ON DELETE SET NULL` |
| `tareas` | `asignado_a` | `usuarios.id` | `ON DELETE SET NULL` |
| `documentos` | `proyecto_id` | `proyectos.id` | (sin cascade explícito) |
| `documentos` | `autor_id` | `usuarios.id` | (sin cascade) |
| `mensajes` | `proyecto_id` | `proyectos.id` | (sin cascade) |
| `mensajes` | `remitente_id` | `usuarios.id` | (sin cascade) |
| `reuniones` | `proyecto_id` | `proyectos.id` | `ON DELETE CASCADE` (en migración) |
| `reuniones` | `creado_por` | `usuarios.id` | (sin cascade) |
| `notificaciones` | `usuario_id` | `usuarios.id` | `ON DELETE CASCADE` |
| `audit_log` | `usuario_id` | `usuarios.id` | `ON DELETE SET NULL` |
| `contenidos` | `creado_por` | `usuarios.id` | (sin cascade) |
| `contenidos` | `cliente_id` | `usuarios.id` | (sin cascade) |

### 6.5 Restricciones únicas

| Tabla | Restricción |
|---|---|
| `roles` | `nombre UNIQUE` |
| `usuarios` | `email UNIQUE` + INDEX |
| `proyecto_miembros` | `UNIQUE(proyecto_id, usuario_id)` con nombre `uq_proyecto_miembro` |

### 6.6 Enumeraciones implícitas (strings con valores controlados)

| Campo | Valores válidos |
|---|---|
| `proyectos.estado` | `activo` \| `en_progreso` \| `completado` \| `pausado` \| `cancelado` |
| `proyectos.etapa_actual` | `primer_contacto` \| `diagnostico` \| `capacitacion` \| `desarrollo` \| `entrega` |
| `hitos.estado` | `pendiente` \| `en_progreso` \| `completado` |
| `tareas.estado` | `pendiente` \| `en_progreso` \| `completado` \| `cancelado` |
| `tareas.prioridad` | `baja` \| `media` \| `alta` \| `urgente` |
| `documentos.estado` | `borrador` \| `publicado` |
| `documentos.tipo` | `contrato` \| `propuesta` \| `informe` \| `diseño` \| `otro` |
| `reuniones.estado` | `pendiente` \| `confirmada` \| `cancelada` \| `completada` |
| `proyecto_miembros.rol_en_proyecto` | `admin` \| `miembro` \| `observador` |
| `contenidos.tipo` | `imagen` \| `video` |

Validados por: comentarios en modelo + `ESTADOS_REUNION` set en [reunion_schema.py:7](backend/app/schemas/reunion_schema.py#L7) y `ETAPAS` en [proceso_schema.py:6](backend/app/schemas/proceso_schema.py#L6).

### 6.7 Migraciones (Alembic)

| Revisión | Fecha | Cambios |
|---|---|---|
| `1bf0849f205c` | 2026-03-16 | **Initial** — `roles`, `usuarios`, `proyectos` (mínimos) |
| `a2c3d4e5f6a7` | Sprint 2 | Documentos y mensajes |
| `c2d3e4f5a6b7` | Sprint 2 | Proceso core (etapas, hitos, tareas básicos) |
| `b1c2d3e4f5a6` | 2026-04-08 | Sprint 3 — schema completo Supabase: añade columnas a `usuarios`/`proyectos`/`documentos`/`mensajes`, crea `proyecto_miembros`, `hitos`, `tareas`, `reuniones`, `notificaciones` |
| `d3e4f5a6b7c8` | HEAD actual | Tabla `contenidos` + columna `reuniones.estado` |

Aplicar todas: `cd backend && alembic upgrade head`.

> **Nota:** `main.py` también ejecuta `Base.metadata.create_all()` + reparaciones idempotentes en el lifespan ([main.py:67](backend/app/main.py#L67)). Esto permite arrancar sin alembic en SQLite/dev, pero en producción se recomienda Alembic como única fuente de verdad.

---

## 7. Modelos de Dominio

A continuación se detalla cada modelo SQLAlchemy con su schema Pydantic asociado.

### 7.1 Rol

**Modelo:** [backend/app/models/rol.py](backend/app/models/rol.py)

| Campo | Tipo | Nullable | Notas |
|---|---|---|---|
| `id` | UUID | NO (PK) | `default=uuid.uuid4` |
| `nombre` | String | NO | UNIQUE — `Admin` o `Cliente` |

**Relación:** `usuarios = relationship("Usuario", back_populates="rol")` (1:N).
**Sembrado:** Sembrado automáticamente al arrancar la app (ver [main.py:39](backend/app/main.py#L39)).

### 7.2 Usuario

**Modelo:** [backend/app/models/usuario.py](backend/app/models/usuario.py) · **Schema:** [usuario_schema.py](backend/app/schemas/usuario_schema.py)

| Campo | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | UUID | NO (PK) | `uuid4` |
| `nombre` | String | NO | — |
| `email` | String | NO | UNIQUE INDEX |
| `password_hash` | String | NO | bcrypt |
| `rol_id` | UUID FK | SÍ | — |
| `telefono` | String | SÍ | — |
| `avatar_url` | String | SÍ | — |
| `is_active` | Boolean | NO | `True` |
| `created_at` | DateTime TZ | NO | `now(UTC)` |
| `updated_at` | DateTime TZ | NO | `now(UTC)` (onupdate) |

**Schemas Pydantic:**
- `UsuarioCreate`: `nombre`, `email: EmailStr`, `password`, `rol: Optional`
- `UsuarioLogin`: `email`, `password`
- `UsuarioResponse`: `id`, `nombre`, `email`, `rol_id`

**Reglas de negocio:**
- Email se valida con `EmailStr` de Pydantic (requiere `email-validator`).
- Bcrypt trunca a 72 bytes ([security.py:7](backend/app/core/security.py#L7)).
- Cambio de contraseña requiere contraseña actual y mínimo 6 caracteres ([usuarios_router.py:127](backend/app/api/usuarios_router.py#L127)).

### 7.3 Proyecto

**Modelo:** [backend/app/models/proyecto.py](backend/app/models/proyecto.py) · **Schema:** [proyecto_schema.py](backend/app/schemas/proyecto_schema.py)

| Campo | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | UUID | NO (PK) | `uuid4` |
| `nombre` | String | NO | — |
| `descripcion` | String | SÍ | — |
| `estado` | String | NO | `"activo"` |
| `etapa_actual` | String | NO | `"primer_contacto"` |
| `fecha_inicio` | Date | SÍ | — |
| `fecha_fin` | Date | SÍ | — |
| `cliente_id` | UUID FK | SÍ | — |
| `created_by` | UUID FK | SÍ | — |
| `created_at` / `updated_at` | DateTime TZ | NO | `now(UTC)` |

**Relaciones:**
- `hitos` → 1:N (CASCADE)
- `tareas` → 1:N (CASCADE)
- `reuniones` → 1:N (CASCADE)

**Schemas:**
- `ProyectoCreate`: `nombre` (obligatorio), `descripcion`, `fecha_inicio`, `fecha_fin`.
- `ProyectoUpdate`: todos opcionales.
- `AsignarClienteRequest`: `cliente_id: UUID`.
- `ProyectoResponse`: representación completa.

### 7.4 Hito

**Modelo:** [backend/app/models/hito.py](backend/app/models/hito.py) · **Schema:** [hito_schema.py](backend/app/schemas/hito_schema.py)

| Campo | Tipo | Default |
|---|---|---|
| `nombre`, `descripcion` | String | — |
| `proyecto_id` (FK) | UUID | — |
| `fecha_limite` | Date | — |
| `estado` | String | `"pendiente"` |
| `orden` | Integer | `0` |

Pertenece a un proyecto. Las tareas pueden estar asociadas a un hito.

### 7.5 Tarea

**Modelo:** [backend/app/models/tarea.py](backend/app/models/tarea.py) · **Schema:** [tarea_schema.py](backend/app/schemas/tarea_schema.py)

| Campo | Tipo | Default |
|---|---|---|
| `titulo`, `descripcion` | String | — |
| `estado` | String | `"pendiente"` |
| `prioridad` | String | `"media"` |
| `proyecto_id` (FK) | UUID | — |
| `hito_id` (FK) | UUID (opcional) | — |
| `asignado_a` (FK) | UUID (opcional) | — |
| `creado_por` (FK) | UUID | — |

**Regla de negocio (tareas_router.py:83):** solo el `Admin` o el `asignado` pueden modificarla.

### 7.6 Documento

**Modelo:** [backend/app/models/documento.py](backend/app/models/documento.py) · **Schema:** [documento_schema.py](backend/app/schemas/documento_schema.py)

| Campo | Tipo |
|---|---|
| `titulo`, `descripcion`, `url` | String |
| `estado` | `borrador` \| `publicado` |
| `tipo` | `contrato` \| `propuesta` \| `informe` \| `diseño` \| `otro` |
| `proyecto_id`, `autor_id` (FKs) | UUID |

**Reglas:**
- Solo `Admin` puede subir/crear/eliminar (RBAC en router).
- Validación al subir: extensión en `{.pdf, .doc, .docx, .xls, .xlsx, .png, .jpg, .jpeg, .txt, .zip}` y tamaño ≤ 10 MB ([documentos_router.py:23](backend/app/api/documentos_router.py#L23)).
- Descarga sanea path para evitar **path traversal** ([documentos_router.py:102](backend/app/api/documentos_router.py#L102)).
- Solo dispara notificación si `estado == "publicado"` ([documento_service.py:43](backend/app/services/documento_service.py#L43)).

### 7.7 Mensaje

**Modelo:** [backend/app/models/mensaje.py](backend/app/models/mensaje.py) · **Schema:** [mensaje_schema.py](backend/app/schemas/mensaje_schema.py)

Chat por proyecto. Campos: `contenido`, `proyecto_id`, `remitente_id`, `fecha_envio`, `leido`.

**Servicio:** `enviar_mensaje` notifica a los demás miembros con preview ≤120 chars ([mensaje_service.py:57](backend/app/services/mensaje_service.py#L57)).

### 7.8 Reunión

**Modelo:** [backend/app/models/reunion.py](backend/app/models/reunion.py) · **Schema:** [reunion_schema.py](backend/app/schemas/reunion_schema.py)

| Campo | Tipo |
|---|---|
| `titulo`, `descripcion` | String |
| `fecha` (TZ) | DateTime obligatorio |
| `duracion_minutos`, `enlace` | Opcional |
| `estado` | `pendiente` \| `confirmada` \| `cancelada` \| `completada` |
| `proyecto_id`, `creado_por` (FKs) | UUID |

### 7.9 Notificación

**Modelo:** [backend/app/models/notificacion.py](backend/app/models/notificacion.py) · **Schema:** [notificacion_schema.py](backend/app/schemas/notificacion_schema.py)

| Campo | Tipo |
|---|---|
| `usuario_id` (FK CASCADE) | UUID |
| `tipo` | String (`proyecto_creado`, `cliente_creado`, `etapa_cambiada`, `mensaje_nuevo`, `documento_subido`, `tarea_asignada`, `anuncio`...) |
| `titulo`, `contenido` | String |
| `leida` | Boolean (default `False`) |
| `referencia_id`, `referencia_tipo` | Para vincular a otra entidad |
| `titulo_key`, `contenido_key` | String i18n (claves de traducción) |
| `params` | JSONB para interpolación |

**Razón de los `*_key` + `params`:** permite que el frontend traduzca el título/contenido al idioma actual del usuario, no al del momento del disparo. Si no están presentes (broadcast libre), se usa `titulo`/`contenido` tal cual.

### 7.10 EtapaHistorial

**Modelo:** [backend/app/models/etapa_historial.py](backend/app/models/etapa_historial.py)

Registra cada cambio de etapa con `fecha_inicio`, `fecha_fin` (NULL = activa), `cambiado_por`, `notas`. La tabla se llama `proyecto_etapa_historial`.

### 7.11 AuditLog

**Modelo:** [backend/app/models/audit_log.py](backend/app/models/audit_log.py)

| Campo | Tipo |
|---|---|
| `usuario_id` (FK SET NULL) | UUID — quién |
| `accion` | String — qué (`registro_usuario`, `cambiar_etapa`, etc.) |
| `tabla`, `registro_id` | String/UUID — sobre qué |
| `detalle_anterior`, `detalle_nuevo` | JSON — antes/después |
| `created_at` | DateTime TZ |

**Uso:** `registrar_evento()` en [utils/audit.py](backend/app/utils/audit.py) — NO hace commit, el llamador es responsable.

### 7.12 ProyectoMiembro

**Modelo:** [backend/app/models/proyecto_miembro.py](backend/app/models/proyecto_miembro.py)

Tabla puente N:M con campo extra `rol_en_proyecto`. Restricción `UNIQUE(proyecto_id, usuario_id)`. Pensado para colaboradores adicionales más allá del `cliente_id` principal del proyecto.

### 7.13 Contenido

**Modelo:** [backend/app/models/contenido.py](backend/app/models/contenido.py) · **Schema:** [contenido_schema.py](backend/app/schemas/contenido_schema.py)

Material formativo (imagen / video).
- `cliente_id == NULL` → **global**: visible para todos los clientes.
- `cliente_id != NULL` → visible solo para ese cliente y para todos los Admin.

Lógica de visibilidad en [contenidos_router.py:80](backend/app/api/contenidos_router.py#L80).

---

## 8. Backend

### 8.1 Módulos y responsabilidades

| Módulo | Responsabilidad | Endpoints definidos |
|---|---|---|
| `auth_router` | Login/register | 2 |
| `usuarios_router` | Perfil propio, avatar, password, listado | 7 |
| `proyectos_router` | CRUD proyectos + listados según rol + asignar cliente | 5 |
| `documentos_router` | Upload, download seguro, listado, eliminación | 5 |
| `mensajes_router` | Chat por proyecto + resumen + marcar leídos | 4 |
| `hitos_router` | CRUD hitos | 4 |
| `tareas_router` | CRUD tareas + mis tareas | 5 |
| `reuniones_router` | CRUD reuniones + por cliente / mías | 6 |
| `notificaciones_router` | Listado, contador, marcar, eliminar, broadcast | 8 |
| `proceso_router` | Obtener proceso, cambiar etapa, historial | 3 |
| `contenidos_router` | Upload, listado filtrado, file serve, CRUD | 5 |

**Total: ~54 endpoints.**

### 8.2 Tabla de documentación de APIs

#### 8.2.1 Autenticación (`/auth`)

| Método | Ruta | Auth requerida | Body | Respuesta |
|---|---|---|---|---|
| POST | `/auth/login` | No | `form-data: username, password` | `{ access_token, token_type }` |
| POST | `/auth/register` | **Admin** | `UsuarioCreate` | `{ message, id }` |

#### 8.2.2 Usuarios (`/usuarios`)

| Método | Ruta | Auth | Body / Params | Respuesta |
|---|---|---|---|---|
| GET | `/usuarios/me` | Sesión | — | Perfil del usuario |
| PATCH | `/usuarios/me` | Sesión | `PerfilUpdate` | Perfil actualizado |
| POST | `/usuarios/me/avatar` | Sesión | `multipart: archivo` | Perfil con nueva URL |
| GET | `/usuarios/avatar/{filename}` | (Pública)* | path | Archivo binario |
| PATCH | `/usuarios/me/password` | Sesión | `CambiarPasswordRequest` | `{ message }` |
| GET | `/usuarios/` | **Admin** | — | Lista usuarios |

> *El servir avatares no exige auth: cualquiera con la URL puede verlos. Diseño consciente para que `<img src>` funcione sin tokens.

#### 8.2.3 Proyectos (`/proyectos`)

| Método | Ruta | Auth | Body | Respuesta |
|---|---|---|---|---|
| POST | `/proyectos/` | **Admin** | `ProyectoCreate` | `ProyectoResponse` |
| PATCH | `/proyectos/{id}` | **Admin** | `ProyectoUpdate` | `ProyectoResponse` |
| GET | `/proyectos/admin/todos` | **Admin** | — | `list[ProyectoAdminResponse]` (incluye cliente) |
| GET | `/proyectos/mis-proyectos` | Sesión | — | Admin: todos; Cliente: los suyos |
| GET | `/proyectos/{id}` | Sesión | — | `ProyectoResponse` |
| PUT | `/proyectos/{id}/asignar-cliente` | **Admin** | `AsignarClienteRequest` | `ProyectoResponse` |

#### 8.2.4 Documentos (`/documentos`)

| Método | Ruta | Auth | Body | Respuesta |
|---|---|---|---|---|
| POST | `/documentos/` | **Admin** | `DocumentoCreate` | `DocumentoResponse` |
| POST | `/documentos/upload` | **Admin** | `multipart: archivo + form fields` | `DocumentoResponse` |
| GET | `/documentos/download/{proyecto_id}/{filename}` | Sesión | path | Archivo binario |
| DELETE | `/documentos/{id}` | **Admin** | — | `{ message }` |
| GET | `/documentos/proyecto/{proyecto_id}` | Sesión | — | `list[DocumentoResponse]` |

#### 8.2.5 Mensajes (`/mensajes`)

| Método | Ruta | Auth | Body | Respuesta |
|---|---|---|---|---|
| POST | `/mensajes/` | Sesión | `MensajeCreate` | `MensajeResponse` |
| GET | `/mensajes/proyecto/{id}` | Sesión | — | `list[MensajeResponse]` |
| GET | `/mensajes/resumen` | Sesión | — | Resumen por proyecto |
| PATCH | `/mensajes/proyecto/{id}/leer` | Sesión | — | `{ marcados_leidos }` |

#### 8.2.6 Hitos (`/hitos`)

| Método | Ruta | Auth | Body |
|---|---|---|---|
| POST | `/hitos/` | **Admin** | `HitoCreate` |
| GET | `/hitos/proyecto/{id}` | Sesión | — |
| PATCH | `/hitos/{id}` | **Admin** | `HitoUpdate` |
| DELETE | `/hitos/{id}` | **Admin** | — (204) |

#### 8.2.7 Tareas (`/tareas`)

| Método | Ruta | Auth |
|---|---|---|
| POST | `/tareas/` | **Admin** |
| GET | `/tareas/proyecto/{id}` | Sesión |
| GET | `/tareas/mis-tareas` | Sesión |
| PATCH | `/tareas/{id}` | Admin **o** asignado |
| DELETE | `/tareas/{id}` | **Admin** |

#### 8.2.8 Reuniones (`/reuniones`)

| Método | Ruta | Auth |
|---|---|---|
| POST | `/reuniones/` | **Admin** |
| GET | `/reuniones/proyecto/{id}` | Sesión |
| GET | `/reuniones/cliente/{id}` | **Admin** |
| GET | `/reuniones/mias` | Sesión |
| PATCH | `/reuniones/{id}` | **Admin** |
| DELETE | `/reuniones/{id}` | **Admin** |

#### 8.2.9 Notificaciones (`/notificaciones`)

| Método | Ruta | Auth | Notas |
|---|---|---|---|
| GET | `/notificaciones/` | Sesión | Las del usuario |
| GET | `/notificaciones/count` | Sesión | Admin: todas no leídas; Cliente: las suyas |
| GET | `/notificaciones/todas` | **Admin** | Hasta 300, supervisión |
| PATCH | `/notificaciones/leer-todas` | Sesión | Marca todas |
| PATCH | `/notificaciones/{id}/leer` | Sesión | Marca una |
| DELETE | `/notificaciones/{id}` | Sesión | Borra una (admin puede cualquiera) |
| POST | `/notificaciones/broadcast` | **Admin** | A todos o a IDs específicos |
| DELETE | `/notificaciones/grupo/{ref_id}` | **Admin** | Elimina un broadcast completo |

#### 8.2.10 Proceso (`/proceso`)

| Método | Ruta | Auth | Notas |
|---|---|---|---|
| GET | `/proceso/{proyecto_id}` | Sesión | Cliente: solo su proyecto |
| POST | `/proceso/{proyecto_id}/cambiar-etapa` | **Admin** | Crea historial + notifica + audita |
| GET | `/proceso/{proyecto_id}/historial` | Sesión | Cliente: solo su proyecto |

#### 8.2.11 Contenidos (`/contenidos`)

| Método | Ruta | Auth | Notas |
|---|---|---|---|
| POST | `/contenidos/upload` | **Admin** | Imagen ≤10MB / Video ≤200MB |
| GET | `/contenidos/` | Sesión | Admin: todo; Cliente: global + suyos |
| GET | `/contenidos/file/{filename}` | (Pública) | Sirve binario |
| PATCH | `/contenidos/{id}` | **Admin** | — |
| DELETE | `/contenidos/{id}` | **Admin** | También borra el archivo físico |

#### 8.2.12 Sistema

| Método | Ruta | Auth | Respuesta |
|---|---|---|---|
| GET | `/` | No | `{ message, version, environment }` |
| GET | `/health` | No | `{ status: "ok" }` (usado por Docker healthcheck) |

### 8.3 Validaciones backend

- **Pydantic** valida tipos y rangos al deserializar el body.
- **EmailStr** valida formato de correo en `UsuarioCreate`.
- **EmailStr** y `Field(min_length, max_length)` en `NotificacionBroadcast`.
- **Validación manual** en routers para:
  - Estado de reunión válido ([reuniones_router.py:30](backend/app/api/reuniones_router.py#L30))
  - Etapa válida ([proceso_router.py:80](backend/app/api/proceso_router.py#L80))
  - Tipo de archivo permitido (documentos, contenidos, avatares)
  - Tamaño máximo de archivo
  - Path traversal sanitario en downloads ([documentos_router.py:104](backend/app/api/documentos_router.py#L104))

### 8.4 Dependencias inyectables

| Dependencia | Función | Uso |
|---|---|---|
| `get_db` | Yield session SQLAlchemy y la cierra | Casi todos los endpoints |
| `get_current_user` | Decodifica JWT, busca usuario | Endpoints autenticados |
| `require_role("Admin")` | Verifica `usuario.rol.nombre == "Admin"` | Endpoints solo admin |

Definidas en [backend/app/core/dependencies.py](backend/app/core/dependencies.py).

---

## 9. Frontend

### 9.1 Arquitectura

- **SPA** con React 19 (con StrictMode).
- **Bundler:** Vite 8 con plugins `@vitejs/plugin-react` y `@tailwindcss/vite`.
- **Routing:** `react-router-dom` v7 con `BrowserRouter` + rutas anidadas + `Navigate` para guards.
- **Estado global:** Context API (`AuthContext`) — único contexto global, sin Redux/Zustand.
- **Estado local:** Hooks `useState`, `useEffect`, `useRef`.
- **HTTP:** Axios con instancia única `api` ([services/api.js](frontend/src/services/api.js)) que:
  - Inyecta `Authorization: Bearer <token>` desde localStorage en cada request.
  - Limpia localStorage y redirige a `/login` ante `401`.
- **i18n:** i18next con HTTP backend que carga JSON bajo demanda desde `/locales/{{lng}}/{{ns}}.json`.
- **Estilo:** Tailwind 4 (utility classes) **combinado con estilos inline** (la mayoría del código usa `style={{ ... }}` extensivamente — ver §16).

### 9.2 Componentes principales

#### Compartidos (`components/common/`)

| Componente | Función |
|---|---|
| `Button.jsx` | Botón con variantes |
| `Card.jsx` | Tarjeta con sombra y radius |
| `Input.jsx` | Input con label |
| `Modal.jsx` | Modal overlay reutilizable |
| `Logo.jsx` | Renderiza el logo |
| `LanguageSwitcher.jsx` | Selector de idioma (ES/EN/PT) |
| `AvatarUploader.jsx` | Sube avatar y expone `resolveAvatarUrl()` |

#### Layout

| Componente | Función |
|---|---|
| `MainLayout.jsx` | Layout cliente (`Sidebar + Outlet`). Redirige a `/login` si no hay user |
| `AdminLayout.jsx` | Layout admin. Redirige a `/inicio` si user no es Admin |
| `Sidebar.jsx` | Nav cliente con polling cada 30s de `/notificaciones/count` para badge |
| `AdminSidebar.jsx` | Nav admin (idéntica lógica) |

#### Otros

| Componente | Función |
|---|---|
| `ErrorBoundary.jsx` | Captura errores React de forma global |
| `ProtectedRoute.jsx` | Versión alternativa de guard (usada en algunos legados) |
| `MessageChat.jsx` | Componente reutilizable de chat |
| `DocumentList.jsx` | Lista de documentos con descarga |
| `ProjectCard.jsx` | Tarjeta de proyecto |
| `Navbar.jsx` | (legado) |

### 9.3 Páginas y rutas

Definidas en [App.jsx:36-66](frontend/src/App.jsx#L36-L66):

```
/login                              → Login.jsx

(MainLayout — cliente)
/                                   → Navigate to /inicio
/inicio                             → cliente/Inicio.jsx
/documentos                         → cliente/Documentos.jsx
/proceso                            → cliente/Proceso.jsx
/contenido                          → cliente/Contenido.jsx
/contacto                           → cliente/Contacto.jsx
/notificaciones                     → cliente/Notificaciones.jsx
/configuracion                      → cliente/Configuracion.jsx

(AdminLayout — solo admin)
/admin                              → Navigate to /admin/clientes
/admin/clientes                     → admin/Clientes.jsx
/admin/proceso                      → admin/Proceso.jsx
/admin/documentos                   → admin/Documentos.jsx
/admin/mensajes                     → admin/Mensajes.jsx
/admin/notificaciones               → admin/Notificaciones.jsx
/admin/contenido                    → admin/Contenido.jsx
/admin/equipo                       → EquipoPlaceholder (placeholder "próximamente")
/admin/configuracion                → admin/Configuracion.jsx

*                                   → Navigate to /login
```

### 9.4 Manejo de estado

- **Auth:** `AuthContext` con `user`, `login(email, password)`, `logout()` ([AuthContext.jsx](frontend/src/context/AuthContext.jsx)).
- **Persistencia:** `localStorage.token` y `localStorage.user` (JSON) — leídos en init del provider.
- **Idioma:** `localStorage.i18nextLng` (gestionado automáticamente por `LanguageDetector`).
- **Notificaciones:** polling `setInterval` cada 30s en Sidebars.
- **No hay store global** (Redux, Zustand). Cada página hace sus propias llamadas con axios y mantiene su estado con `useState`.

### 9.5 Formularios

Patrón general (no usan librería de forms):

```jsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')
const [loading, setLoading] = useState(false)

async function handleSubmit(e) {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    await login(email, password)
    navigate(...)
  } catch (err) {
    setError(t('login.invalid_credentials'))
  } finally {
    setLoading(false)
  }
}
```

Ver ejemplo completo en [Login.jsx:15-33](frontend/src/pages/Login.jsx#L15-L33).

### 9.6 Consumo de APIs

Todo pasa por la instancia [services/api.js](frontend/src/services/api.js):

```javascript
import api from '../services/api'

// Ejemplo GET
const { data } = await api.get('/proyectos/mis-proyectos')

// Ejemplo POST
const { data } = await api.post('/proyectos/', payload)

// Ejemplo upload
const fd = new FormData()
fd.append('archivo', file)
fd.append('titulo', titulo)
await api.post('/documentos/upload', fd)
```

El interceptor de request añade el header `Authorization` automáticamente, y el de response redirige a `/login` ante 401.

### 9.7 Variables i18n

Frontend usa `useTranslation()` con keys jerárquicas:
- `nav.inicio`, `nav.documentos`, etc. → en `common.json`.
- `login.title`, `login.email_label`, etc. → namespace `auth`.
- `cliente.inicio.documentosTitulo` → namespace `client` o `common`.
- `admin.clientes.titulo` → key admin (en `common.json` por la decisión de consolidar).

---

## 10. Seguridad

### 10.1 Sistema de autenticación

**Esquema:** JWT (JSON Web Token) firmado con HMAC-SHA256.

| Paso | Implementación |
|---|---|
| 1. Usuario envía `email + password` a `/auth/login` (OAuth2PasswordRequestForm) | [auth_router.py:51](backend/app/api/auth_router.py#L51) |
| 2. Backend busca usuario por email | [auth_service.py:49](backend/app/services/auth_service.py#L49) |
| 3. Verifica contraseña con bcrypt | [security.py:9](backend/app/core/security.py#L9) |
| 4. Genera token con payload `{ sub, email, exp }` | [auth_service.py:60](backend/app/services/auth_service.py#L60) |
| 5. Devuelve `{ access_token, token_type: "bearer" }` | [auth_router.py:60](backend/app/api/auth_router.py#L60) |
| 6. Frontend guarda en `localStorage.token` | [AuthContext.jsx:21](frontend/src/context/AuthContext.jsx#L21) |
| 7. Cada request lleva `Authorization: Bearer <token>` | [api.js:16](frontend/src/services/api.js#L16) |
| 8. Backend valida token con `get_current_user` | [dependencies.py:14](backend/app/core/dependencies.py#L14) |

**Parámetros:**
- Algoritmo: `HS256` (config `JWT_ALGORITHM`).
- Vida del token: `ACCESS_TOKEN_EXPIRE_MINUTES = 60` por defecto.
- Clave: `SECRET_KEY` del `.env` (rotación manual).

### 10.2 Autorización (RBAC)

**Dos roles cableados:** `Admin` y `Cliente`.

| Mecanismo | Uso |
|---|---|
| `require_role("Admin")` | Levanta 403 si rol ≠ Admin |
| `get_current_user` | Solo exige sesión válida |
| Lógica explícita en endpoints | P. ej. cliente solo ve su proyecto en [proceso_router.py:62](backend/app/api/proceso_router.py#L62), tarea editable por admin **o** asignado en [tareas_router.py:83](backend/app/api/tareas_router.py#L83) |

Frontend hace **doble guard**:
- `AdminLayout` redirige a `/inicio` si rol ≠ Admin ([AdminLayout.jsx:12](frontend/src/components/layout/AdminLayout.jsx#L12)).
- Pero el control real está en el backend (frontend solo mejora UX).

### 10.3 Manejo de sesiones

- **Sin estado de servidor:** los tokens son self-contained.
- **Logout:** `AuthContext.logout()` limpia `localStorage` y resetea `user` ([AuthContext.jsx:28](frontend/src/context/AuthContext.jsx#L28)).
- **Expiración:** El token expira tras 60 min. El backend lanza 401 → axios interceptor redirige a `/login`.
- **Sin refresh tokens.**

### 10.4 Gestión de tokens

- **Almacenamiento:** `localStorage` (riesgo XSS — ver §16).
- **Transmisión:** header `Authorization`.
- **No se renueva automáticamente.**

### 10.5 Hash de contraseñas

[security.py](backend/app/core/security.py):
- bcrypt con esquema `passlib`.
- Trunca a 72 bytes (límite del algoritmo).
- Verificación constante en tiempo.

### 10.6 Protecciones específicas

| Riesgo | Mitigación implementada |
|---|---|
| **Path traversal en downloads** | `Path.resolve()` + `str.startswith(allowed_root)` en documentos, contenidos y avatares |
| **Tipo de archivo malicioso** | Lista blanca de extensiones para cada tipo de upload |
| **Tamaño excesivo** | Límites explícitos (10 MB documentos, 5 MB avatares, 10/200 MB contenidos) |
| **CORS abierto** | `CORSMiddleware` con `allow_origins` desde env (lista CSV) ([main.py:140](backend/app/main.py#L140)) |
| **Inyección SQL** | SQLAlchemy ORM parametriza siempre |
| **Auditoría** | `audit_log` registra creación de usuarios, cambios de etapa, etc. |
| **Soft check rol** | Doble validación frontend + backend |

### 10.7 Riesgos identificados

| Severidad | Riesgo |
|---|---|
| **Alta** | `localStorage` para JWT es susceptible a XSS. Cualquier script malicioso inyectado puede robar la sesión. **Recomendación:** httpOnly cookie + CSRF token. |
| **Alta** | Sin rate limiting en `/auth/login` — vulnerable a brute force. **Recomendación:** slowapi o fail2ban. |
| **Media** | `SECRET_KEY` por defecto en `.env.example` (`change-me-please-...`). Si no se rota en producción, tokens son falsificables. |
| **Media** | Sirviendo avatares y contenidos sin auth: cualquiera con la URL puede descargarlos. Aceptable si las URLs son secret-by-obscurity (UUID en path), pero no es defensa real. |
| **Media** | Sin política de complejidad de contraseña (solo `len ≥ 6` al cambiar). |
| **Media** | Bootstrap admin con credenciales `admin@optimixage.local / Admin1234!` si no se cambia en `.env` — riesgo crítico en producción. |
| **Baja** | Sin logout server-side (solo limpia localStorage). Token sigue siendo válido hasta expirar. |
| **Baja** | CORS con `allow_origins=*` si `.env` queda sin definir. |

---

## 11. Variables de Entorno

### 11.1 Backend (`.env` en raíz)

| Variable | Obligatoria | Default | Descripción | Ejemplo |
|---|---|---|---|---|
| `DATABASE_URL` | Sí (recom.) | `sqlite:///./optimixage.db` | URL SQLAlchemy. Soporta SQLite / Postgres / Supabase | `postgresql://user:pass@host:6543/db` |
| `SECRET_KEY` | **Sí** | `change-me-...` | Clave de firma JWT. **Debe rotarse.** | `xK7p9_Q-vMnB...` (token_urlsafe 48+) |
| `JWT_ALGORITHM` | No | `HS256` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Vida útil del token (minutos) | `60` |
| `CORS_ORIGINS` | No | localhost dev | CSV de orígenes permitidos | `https://app.com,https://www.app.com` |
| `BOOTSTRAP_ADMIN_EMAIL` | No | `admin@optimixage.local` | Email del admin sembrado | `admin@empresa.com` |
| `BOOTSTRAP_ADMIN_PASSWORD` | No | `Admin1234!` | **Cambiar en prod** | `S3gur4!Adm1n` |
| `BOOTSTRAP_ADMIN_NOMBRE` | No | `Administrador` | Nombre visible | `Administrador` |
| `UPLOADS_DIR` | No | `uploads` | Carpeta de archivos | `/var/data/uploads` |
| `ENVIRONMENT` | No | `development` | `development` \| `staging` \| `production` | `production` |
| `SUPABASE_URL` | No | — | URL del proyecto Supabase (uso futuro frontend) | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | No | — | Anon key (uso futuro) | `eyJhbGciOi...` |
| `POSTGRES_PASSWORD` | No (Compose) | `postgres` | Password del Postgres del compose | `superpassword` |
| `POSTGRES_DB` | No (Compose) | `optimixagedb` | Nombre DB | `optimixagedb` |
| `POSTGRES_USER` | No (Compose) | `postgres` | Usuario | `postgres` |

### 11.2 Frontend (`frontend/.env`)

| Variable | Obligatoria | Default | Descripción | Ejemplo |
|---|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:8000` | URL del backend en build | `https://api.empresa.com` |
| `PORT` | No | `5173` | Puerto del dev server | `5173` |

### 11.3 Render (`render.yaml`) — adicionales para Static Site

| Variable | Default | Descripción |
|---|---|---|
| `NODE_VERSION` | `20` | Fija Node 20 LTS para build |
| `NPM_CONFIG_PRODUCTION` | `false` | Asegura instalación de devDependencies |

---

## 12. Docker y Despliegue

### 12.1 Dockerfiles

#### Backend ([backend/Dockerfile](backend/Dockerfile))

```dockerfile
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 ...
WORKDIR /app
RUN apt-get install build-essential libpq-dev curl
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
RUN mkdir -p /app/uploads
EXPOSE 8000
HEALTHCHECK CMD curl http://localhost:8000/health
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- Imagen base: `python:3.11-slim` (~150 MB).
- Dependencias OS: `build-essential`, `libpq-dev` (psycopg2), `curl` (healthcheck).
- Crea carpeta `uploads/` (montada como volumen).
- Healthcheck cada 30s contra `/health`.

#### Frontend ([frontend/Dockerfile](frontend/Dockerfile))

**Multi-stage build:**

```dockerfile
# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- Stage 1 (node:20-alpine): instala deps, compila con Vite.
- Stage 2 (nginx:alpine): solo `dist/` final (~20 MB).
- Build arg `VITE_API_URL=/api` (default) se pasa desde compose.

### 12.2 Docker Compose ([docker-compose.yml](docker-compose.yml))

**Tres servicios:**

```
db          postgres:15-alpine        5432 → 5432
backend     build ./backend           8000 → 8000
frontend    build ./frontend          3000 → 80
```

**Volúmenes nombrados:**
- `postgres_data` → `/var/lib/postgresql/data`
- `backend_uploads` → `/app/uploads`

**Dependencias:**
- `backend` depende de `db` healthy.
- `frontend` depende de `backend` healthy.

**Network:** Docker compose crea una red por defecto. Los servicios se resuelven por nombre (`db`, `backend`, `frontend`).

### 12.3 nginx.conf ([frontend/nginx.conf](frontend/nginx.conf))

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;   # SPA fallback
    }
    location /api/ {
        proxy_pass http://backend:8000/;    # Reverse proxy a backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 12.4 Despliegue paso a paso (Docker local)

```bash
# 1. Variables de entorno
cp .env.example .env
# Editar SECRET_KEY (genera con: python -c "import secrets; print(secrets.token_urlsafe(48))")

# 2. Levantar todo
docker compose up --build -d

# 3. Verificar
docker compose ps
curl http://localhost:8000/health
curl http://localhost:3000

# 4. Aplicar migraciones (si usas Postgres)
docker compose exec backend alembic upgrade head

# 5. Logs
docker compose logs -f backend
```

### 12.5 Despliegue Render ([render.yaml](render.yaml))

Define **2 servicios**:

- `seguimiento-proyectos-api` — Web Service Docker (free tier).
- `seguimiento-proyectos` — Static Site (gratis, nunca duerme).

Pasos resumidos:
1. Push del `render.yaml` al repo.
2. Render dashboard → New → Blueprint → seleccionar repo.
3. Render pide los secretos: `DATABASE_URL`, `SECRET_KEY`, `BOOTSTRAP_ADMIN_PASSWORD`.
4. Apply. Auto-deploy en futuros pushes.

### 12.6 CI/CD ([.github/workflows/ci.yml](.github/workflows/ci.yml))

Pipeline en GitHub Actions con 3 jobs:

| Job | Acciones |
|---|---|
| `test-backend` | Python 3.11 → `pip install -r requirements.txt` → `pytest --cov-fail-under=60` |
| `build-frontend` | Node 20 → `npm ci` → `npm run build` → verifica `dist/index.html` → sube artifact `frontend-dist` |
| `deploy-staging` | Solo en push a `main` o `develop`. Stub que descarga el artifact y muestra resumen. **No deploya realmente** (placeholder para conectar a real). |

Triggers: push a `main`/`develop`/`feature/sprint2`/`feature/sprint3`, y cualquier PR.

---

## 13. Instalación para Nuevos Desarrolladores

### 13.1 Requisitos previos

| Software | Versión mínima | Recomendada |
|---|---|---|
| Python | 3.10 | 3.11 |
| Node.js | 18 | 20 LTS |
| npm | 9 | 10 |
| Git | 2.30 | última |
| Docker (opcional) | 24 | 26+ |

### 13.2 Pasos desde cero (sin Docker, modo desarrollo)

```bash
# 1. Clonar
git clone https://github.com/roldanw18/plataforma-optimixage.git optimixage
cd optimixage

# 2. Variables de entorno
cp .env.example .env
cp frontend/.env.example frontend/.env
# Editar .env: como mínimo cambiar SECRET_KEY

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

# 6. (Opcional) Diagnóstico
python scripts/verify-env.py
```

### 13.3 Ejecución local (dos terminales)

```bash
# Terminal 1 (con venv activado)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2
cd frontend
npm run dev
```

### 13.4 Setup automático (scripts incluidos)

**Windows:**
```powershell
.\scripts\setup.ps1
.\scripts\dev-backend.ps1   # en otra ventana: .\scripts\dev-frontend.ps1
```

**Linux/macOS:**
```bash
bash scripts/setup.sh
bash scripts/dev-backend.sh   # en otra terminal: bash scripts/dev-frontend.sh
```

### 13.5 Setup con Docker (recomendado para producción local)

```bash
cp .env.example .env
docker compose up --build
```

Espera ~5-8 min la primera vez. URLs:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (Swagger UI en `/docs`)
- DB: localhost:5432

### 13.6 Verificación

| Check | Comando / acción |
|---|---|
| Backend OK | `curl http://localhost:8000/health` → `{"status":"ok"}` |
| Frontend OK | Abrir `http://localhost:5173` (dev) o `:3000` (Docker) |
| Login funciona | `admin@optimixage.local` / `Admin1234!` |
| Tests pasan | `cd backend && pytest -v` |
| Build frontend | `cd frontend && npm run build` (genera `dist/`) |

---

## 14. Flujo Completo del Sistema

### 14.1 Flujo: Onboarding de un nuevo cliente

```
1. Admin abre /admin/clientes
   └─ Frontend: api.get('/usuarios/')           → lista clientes
   
2. Admin click "Nuevo cliente" → llena modal
   └─ Frontend: api.post('/auth/register', { nombre, email, password })
      └─ Backend (auth_router:15)
         ├─ require_role("Admin")               ← valida JWT del admin
         ├─ Verifica email no existente         ← 409 si ya existe
         ├─ crear_usuario(...)
         │  ├─ Crea Usuario con rol Cliente
         │  ├─ registrar_evento(audit_log, "registro_usuario")
         │  └─ commit
         └─ crear_para_admins(...)              ← notifica a otros admins
            └─ Persiste Notificacion con
               titulo_key="notif.cliente_creado.titulo"
               params={ nombre, email, admin }

3. Frontend cierra modal, recarga lista de clientes

4. Admin click "Crear proyecto" en la tarjeta del nuevo cliente
   └─ api.post('/proyectos/', { nombre, descripcion, ... })
      └─ Backend (proyectos_router:42)
         ├─ require_role("Admin")
         ├─ Crea Proyecto (etapa inicial "primer_contacto")
         ├─ crear_para_admins (notif.proyecto_creado.titulo)
         └─ Si cliente_id presente: crear_notificacion al cliente
   └─ api.put(`/proyectos/${id}/asignar-cliente`, { cliente_id })

5. El cliente recibe email (NO, no hay email — solo notificación in-app)
   - Próxima vez que entre, verá la notificación con badge
```

### 14.2 Flujo: Cambio de etapa de un proyecto

```
1. Admin abre /admin/proceso, selecciona proyecto, click "Cambiar etapa"
   └─ Frontend: api.post(`/proceso/${proyecto_id}/cambiar-etapa`, { etapa, notas })
      └─ Backend (proceso_router:73)
         ├─ require_role("Admin")
         ├─ Valida etapa ∈ ETAPAS                          ← 422 si no
         ├─ Carga proyecto                                  ← 404 si no
         ├─ Cierra EtapaHistorial activo (fecha_fin=now)
         ├─ Actualiza proyecto.etapa_actual
         ├─ Crea nuevo EtapaHistorial
         ├─ registrar_evento("cambiar_etapa", detalle ant/nuevo)
         ├─ Crea Notificacion para el cliente del proyecto
         │  con titulo_key="notif.proyecto_actualizado.titulo"
         ├─ commit
         └─ crear_para_admins("etapa_cambiada", ...)
   └─ Frontend recibe ProcesoResponse con progreso recalculado y refresca la vista

2. Cliente abre /inicio:
   - Sidebar polling /notificaciones/count cada 30s → muestra badge
   - Inicio.jsx hace GET /proceso/{id} + /historial → muestra timeline + progreso
   - Cliente click /notificaciones → marca como leídas
```

### 14.3 Flujo: Subida y descarga de un documento

```
SUBIDA (Admin)
1. Admin va a /admin/documentos
2. Selecciona proyecto y archivo
   └─ FormData con archivo + titulo + descripcion + tipo + estado
   └─ api.post('/documentos/upload', formData)
      └─ Backend (documentos_router:46)
         ├─ require_role("Admin")
         ├─ Valida extensión ∈ ALLOWED_EXTENSIONS         ← 400 si no
         ├─ Valida tamaño ≤ MAX_FILE_SIZE                  ← 400 si excede
         ├─ Crea carpeta uploads/{proyecto_id}/
         ├─ Genera safe_name = uuid4 + ext
         ├─ Escribe archivo al disco
         └─ crear_documento(...)
            ├─ Persiste Documento (url=/documentos/download/...)
            └─ Si estado=="publicado": notifica a cliente + miembros

DESCARGA (Cliente o Admin)
1. Cliente abre /documentos
2. api.get(`/documentos/proyecto/${id}`) → lista
3. Click "Descargar"
   └─ navegador GET /api/documentos/download/{proyecto_id}/{filename}
      ├─ Verifica documento existe en DB                  ← 404 si no
      ├─ Resuelve path real con Path.resolve()
      ├─ Verifica path dentro de uploads/                 ← 400 si traversal
      ├─ Verifica archivo existe                          ← 404 si no
      └─ FileResponse con nombre original como descarga
```

### 14.4 Flujo: Chat entre Admin y Cliente

```
1. Cliente o admin abren /admin/mensajes o /contacto
2. Frontend: api.get(`/mensajes/proyecto/${pid}`) → lista mensajes ordenados por fecha
3. Periódicamente o ante envío:
   api.post('/mensajes/', { contenido, proyecto_id })
      └─ Backend (mensajes_router:19)
         └─ enviar_mensaje(...)
            ├─ Crea Mensaje (leido=False)
            ├─ commit
            └─ Notifica a destinatarios (cliente + miembros, excluyendo remitente)
4. Marcar leídos al abrir chat:
   api.patch(`/mensajes/proyecto/${pid}/leer`) → marca como leídos los recibidos
```

### 14.5 Flujo: Broadcast del Admin

```
1. Admin abre /admin/notificaciones → click "Anuncio"
2. Modal BroadcastModal — admin escribe titulo + contenido
3. Opciones: enviar a todos los activos | a IDs específicos
   └─ api.post('/notificaciones/broadcast', { titulo, contenido, tipo, usuario_ids })
      └─ Backend (notificaciones_router:134)
         ├─ broadcast_ref = uuid4()                       ← agrupa
         ├─ Si usuario_ids vacíos: crear_para_todos(...)
         │  (excluye al admin remitente)
         ├─ Si no: crear_para_muchos(usuario_ids, ...)
         └─ Devuelve { enviadas, destino }
4. Cada usuario verá la notificación en su lista; sidebar badge se actualiza al siguiente polling
```

---

## 15. Decisiones Técnicas Identificadas

### 15.1 Por qué FastAPI (no Flask/Django)

**Documentado en:** [docs/sprint1/KA01_evaluacion_stack_tecnologico.md](docs/sprint1/KA01_evaluacion_stack_tecnologico.md).

- **Ventajas:** validación automática con Pydantic, OpenAPI auto-generado (`/docs`, `/redoc`), async-ready, mejor rendimiento que Flask, menos boilerplate que Django REST.
- **Desventajas:** ecosistema más pequeño que Django (sin admin built-in), tipos a veces verbosos.
- **Alternativas consideradas:** Django REST Framework (más completo pero pesado para una práctica), Flask (más simple pero más manual).

### 15.2 Por qué SQLAlchemy 2 + Alembic

- **Ventajas:** ORM más maduro de Python, soporta async, migraciones declarativas con autogenerate.
- **Desventajas:** API más verbosa que peewee o TortoiseORM.
- **Alternativas:** SQLModel (más simple pero menos flexible para queries complejas).

### 15.3 Por qué React 19 + Vite (no Next.js)

**Documentado en:** [docs/sprint1/arquitectura_sistema.md](docs/sprint1/arquitectura_sistema.md).

- **Ventajas:** SPA pura, build muy rápido con Vite, sin server-side rendering innecesario, despliegue como static site.
- **Desventajas:** SEO limitado (no relevante porque es interno), peor TTI inicial que Next.
- **Alternativas:** Next.js (las maquetas originales estaban en Next — ver [docs/Original/](docs/Original/) — pero se descartó por overhead).

### 15.4 Por qué JWT en localStorage

- **Ventajas:** simple, sin cookies de servidor, funciona cross-domain sin CORS preflight de credentials.
- **Desventajas:** **vulnerable a XSS**. Recomendado migrar a httpOnly cookie en producción.

### 15.5 Por qué Supabase como BD en producción

- **Ventajas:** Postgres gestionado gratis hasta 500 MB, backups automáticos, dashboard web, conexión pooler.
- **Desventajas:** vendor lock-in (mitigado porque usamos SQLAlchemy estándar y se puede mover a cualquier Postgres).

### 15.6 Por qué Docker Compose

- **Ventajas:** reproducibilidad entre dev/prod, single command bootstrap, fácil para evaluadores universitarios.
- **Desventajas:** overhead de aprendizaje para principiantes (mitigado con scripts auto + docs).

### 15.7 Por qué i18next + HTTP backend

- **Ventajas:** carga locales bajo demanda (no infla el bundle), añadir idiomas sin rebuild.
- **Desventajas:** más complejo que objetos en memoria.

### 15.8 Por qué dos roles fijos (Admin/Cliente)

- **Ventajas:** simplicidad, suficiente para la práctica.
- **Desventajas:** poco extensible — añadir un rol "Gerente" o "Observador" requiere cambiar código en RBAC, no solo seed.
- **Alternativa:** RBAC dinámico con permisos en BD (más flexible, más complejo).

---

## 16. Problemas Encontrados

### 16.1 Código duplicado / inconsistente

| Ubicación | Problema |
|---|---|
| [frontend/src/pages/](frontend/src/pages/) | Convive doble convención de páginas: `Login.jsx` + `LoginPage.jsx`, `Dashboard.jsx` + `DashboardPage.jsx`, `Documents.jsx` + `cliente/Documentos.jsx`. Las `*Page.jsx` y `Documents.jsx` parecen legacy y NO se importan desde `App.jsx`. **Deuda técnica:** borrar legados |
| [backend/app/services/proyecto_service.py](backend/app/services/proyecto_service.py) | Sólo tiene 2 funciones triviales y NO se usa desde los routers. Toda la lógica de proyectos está inline en `proyectos_router.py`. Inconsistente con `mensaje_service.py` / `documento_service.py` |
| [backend/app/repositories/](backend/app/repositories/) | Carpeta con esqueleto de 3 repositorios que están vacíos o casi vacíos. La capa repository no se usa de forma sistemática |
| Estilos inline en JSX | Casi todas las páginas mezclan Tailwind con `style={{...}}` inline. Hay colores hardcoded (`#0099cc`, `#0a0a4e`) repetidos decenas de veces |
| `_destinatarios_proyecto` | Función duplicada en [documento_service.py:10](backend/app/services/documento_service.py#L10) y [mensaje_service.py:26](backend/app/services/mensaje_service.py#L26). Debería estar en un utils compartido |

### 16.2 Posibles bugs

| Bug | Archivo |
|---|---|
| `ProtectedRoute` chequea `user.rol !== 'Admin'` (string) pero el backend devuelve `user.rol = { nombre: 'Admin' }` (objeto). Solo funciona si el comparador es accidental. | [ProtectedRoute.jsx:8](frontend/src/components/ProtectedRoute.jsx#L8) |
| `MainLayout` redirige a `/login` sin else; `AdminLayout` chequea `user.rol.nombre` con guards anidados — convención inconsistente | [MainLayout.jsx:8](frontend/src/components/layout/MainLayout.jsx#L8) vs [AdminLayout.jsx:12](frontend/src/components/layout/AdminLayout.jsx#L12) |
| `lifespan` ejecuta `create_all` y reparaciones de schema, pudiendo ocultar errores de migración. En producción debería usarse SOLO alembic | [main.py:67](backend/app/main.py#L67) |
| `registrar_evento` no hace commit — depende del caller. Si el caller olvida el commit, el audit log NO se persiste | [utils/audit.py:24](backend/app/utils/audit.py#L24) |
| `mis-proyectos` para admin devuelve TODOS, no solo los creados por él. Puede o no ser intencional | [proyectos_router.py:147](backend/app/api/proyectos_router.py#L147) |
| Cliente puede ver detalle de cualquier proyecto si conoce el UUID (`GET /proyectos/{id}` no chequea ownership) | [proyectos_router.py:152](backend/app/api/proyectos_router.py#L152) |

### 16.3 Deuda técnica

| Tema | Detalle |
|---|---|
| **Sin tests del frontend** | No hay configuración de Vitest, Jest o Playwright. Ninguna validación automática del UI |
| **Sin tests de los routers de notificaciones/contenidos** | Cobertura cae en módulos nuevos del Sprint 3 |
| **`tests/` no incluye reuniones, hitos, tareas, proceso a fondo** | Coverage objetivo del CI es 60% — bajo |
| **Páginas legacy sin borrar** | `Documents.jsx`, `Dashboard*.jsx`, `LoginPage.jsx`, `AdminPage.jsx`, `ProjectDetailPage.jsx` |
| **No hay schemas Pydantic para algunos endpoints** | `/usuarios/me` devuelve dict construido a mano en vez de un Pydantic schema |
| **CORS_ORIGINS hardcoded en `.env.example`** | Es CSV, fácil de equivocarse al añadir un origen con espacios |
| **Bootstrap admin en producción** | Si `BOOTSTRAP_ADMIN_PASSWORD` no se cambia, hay un admin con password débil al primer arranque |
| **Logger sin niveles configurables** | Siempre INFO; sin formato JSON para agregadores |
| **Sin observabilidad** | Sin Sentry, sin métricas Prometheus, sin OpenTelemetry |
| **`scripts/seed_roles.py` redundante** | El lifespan ya siembra roles; este script es alternativo y nadie sabe cuál usar |
| **Frontend mezcla Tailwind 4 con estilos inline** | Difícil mantener consistencia de diseño |

### 16.4 Problemas de escalabilidad

| Problema | Impacto |
|---|---|
| Polling cada 30s del badge de notifs | Con N usuarios y N admins, se generan ~`2*N/30` req/s al backend. Para 100 users → 6.6 req/s constantes. Recomendado WebSockets o SSE para escalar |
| `crear_para_todos` itera y commit por loop sin batch | Para broadcasts a >10k usuarios, costoso. Bulk insert recomendado |
| Cada request `get_current_user` hace SELECT al usuario en cada llamada | OK para cargas pequeñas; con tráfico mayor, cache (Redis) es recomendable |
| Uploads van al disco local del contenedor | No escala horizontalmente. En producción usar S3/Supabase Storage |
| Sin paginación en listados (notifs/todas tiene `.limit(300)` pero el resto no) | `GET /proyectos/admin/todos`, `/mensajes/proyecto/{id}`, etc. devuelven todo |
| SQLite usado por defecto si no se configura `DATABASE_URL` | Solo dev/test |

### 16.5 Problemas de seguridad

Ya detallados en §10.7. Resumen:
- JWT en localStorage (XSS).
- Sin rate limiting.
- SECRET_KEY débil por defecto.
- Bootstrap admin con password débil.
- Archivos servidos sin auth.
- Sin política de contraseñas robusta.

---

## 17. Recomendaciones de Mejora

### 17.1 Alta prioridad (bloqueantes para producción)

1. **Rotar `SECRET_KEY` y `BOOTSTRAP_ADMIN_PASSWORD`** antes de cualquier despliegue real.
2. **Migrar JWT de localStorage a httpOnly cookie + CSRF token** para mitigar XSS.
3. **Añadir rate limiting al `/auth/login`** (p. ej. `slowapi` con 5 intentos/min por IP).
4. **Forzar `alembic upgrade head`** en lifespan de producción, eliminar `create_all` salvo en dev.
5. **Implementar refresh tokens** y endpoints `/auth/logout` server-side (lista de revocación).
6. **Eliminar el auto-fallback a `sqlite:///./optimixage.db`** en `config.py` cuando `ENVIRONMENT == "production"`.
7. **Paginar todos los listados** (proyectos, mensajes, documentos, notificaciones).
8. **Borrar páginas legacy del frontend** que generan confusión.

### 17.2 Media prioridad

9. **Adoptar repository pattern de verdad** o eliminarlo — la inconsistencia actual es peor que cualquier extremo.
10. **Unificar la convención de rol del frontend**: siempre `user.rol.nombre` (no `user.rol`).
11. **Migrar polling de notificaciones a SSE o WebSockets**.
12. **Extraer estilos inline a CSS modules o Tailwind config con tokens del brand** (colores, radios, sombras).
13. **Añadir tests frontend** (Vitest + React Testing Library para componentes, Playwright para E2E).
14. **Subir cobertura objetivo al 80%**.
15. **Mover uploads a S3 / Supabase Storage** si se prevé escalado o multi-instancia.
16. **Sentry o LogRocket** para observabilidad en producción.
17. **Política de contraseña fuerte** (min 12, mayúsculas + número + símbolo, no estar en breach lists).
18. **Eliminar duplicación de `_destinatarios_proyecto`** moviéndola a `app/utils/`.

### 17.3 Baja prioridad (nice-to-have)

19. **Modo dark** en el frontend (variables CSS ya están definidas).
20. **Generar PDF de informes desde el panel admin**.
21. **Filtros y búsqueda** en listados grandes (proyectos, documentos).
22. **Soporte de markdown en mensajes y notas de etapa**.
23. **Subir archivos arrastrando** (drag-and-drop).
24. **Agregar más idiomas** (it, fr).
25. **Refactorizar `main.py` lifespan** a módulos separados (`bootstrap.py`).
26. **Helmet** (security headers) — falta `X-Frame-Options`, `Strict-Transport-Security`, etc.
27. **Reemplazar `print`-style logs por structlog**.
28. **Healthcheck más completo** (validar DB connectivity).

---

## 18. Guía de Mantenimiento

### 18.1 Agregar una nueva funcionalidad (de extremo a extremo)

Ejemplo: añadir una funcionalidad de **comentarios sobre documentos**.

#### Paso 1 — Modelo

Crear `backend/app/models/comentario_documento.py`:

```python
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class ComentarioDocumento(Base):
    __tablename__ = "comentarios_documentos"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    documento_id = Column(UUID(as_uuid=True), ForeignKey("documentos.id", ondelete="CASCADE"), nullable=False)
    autor_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    contenido = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
```

Registrar el import en `backend/app/core/database.py` (final del archivo).

#### Paso 2 — Migración

```bash
cd backend
alembic revision --autogenerate -m "agregar comentarios documentos"
alembic upgrade head
```

#### Paso 3 — Schema Pydantic

`backend/app/schemas/comentario_documento_schema.py`:

```python
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ComentarioDocCreate(BaseModel):
    documento_id: UUID
    contenido: str

class ComentarioDocResponse(BaseModel):
    id: UUID
    documento_id: UUID
    autor_id: UUID
    contenido: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
```

#### Paso 4 — Router

`backend/app/api/comentarios_router.py` con CRUD usando `Depends(get_current_user)`.

#### Paso 5 — Registrar router

En [main.py:159](backend/app/main.py#L159):

```python
from app.api.comentarios_router import router as comentarios_router
app.include_router(comentarios_router)
```

#### Paso 6 — Tests

`backend/tests/test_comentarios.py` usando fixtures `client`, `auth_token`.

#### Paso 7 — Frontend

- Añadir componente `frontend/src/components/ComentariosDocumento.jsx`.
- Llamadas con `api.get('/comentarios/...')`.
- Añadir traducciones en `frontend/public/locales/{es,en,pt}/common.json`.

#### Paso 8 — Verificar

```bash
cd backend && pytest -v
cd ../frontend && npm run lint && npm run build
```

### 18.2 Crear un nuevo módulo (servicio + router)

Sigue el patrón existente: `models/X.py` → `schemas/X_schema.py` → `services/X_service.py` (si tiene lógica no trivial) → `api/X_router.py` → registrar en `main.py`.

### 18.3 Crear un nuevo endpoint

1. Decide router donde va. Si no existe, créalo.
2. Define funcionalidad como función decorada con `@router.METHOD`.
3. Declara dependencias: `db: Session = Depends(get_db)`, `current_user = Depends(get_current_user|require_role(...))`.
4. Valida con Pydantic en parámetros y `response_model`.
5. Si tiene efectos colaterales (notif, audit), úsa servicio existente.
6. Añade test cubriendo happy path + edge case + 403/404.

### 18.4 Modificar la base de datos

```bash
# 1. Edita el modelo en backend/app/models/
# 2. Genera migración
cd backend
alembic revision --autogenerate -m "describe el cambio"
# 3. Revisa el archivo generado en backend/alembic/versions/
# 4. Aplica
alembic upgrade head
```

**Para cambios destructivos** (drop column, drop table):
- Genera la migración, **edita manualmente** el `upgrade()` y `downgrade()`.
- Despliega en pasos: añadir columna nueva → migrar datos → dejar de usar la vieja → drop en migración posterior.
- Nunca hagas drop de tablas en producción sin backup previo.

### 18.5 Desplegar nuevas versiones

**Docker Compose (local/staging):**

```bash
git pull
docker compose down
docker compose up --build -d
docker compose exec backend alembic upgrade head
```

**Render:**

```bash
git push     # auto-deploy
```

Si la migración requiere downtime, considerá ejecutarla manualmente desde la consola del servicio antes del deploy del código nuevo.

---

## 19. Glosario Técnico

| Término | Definición |
|---|---|
| **API** | Application Programming Interface. El backend FastAPI expone una REST API. |
| **Bcrypt** | Algoritmo de hashing de contraseñas adaptativo (cost factor). Estándar de la industria. |
| **CORS** | Cross-Origin Resource Sharing. Política del navegador para permitir / bloquear requests entre dominios. |
| **CRUD** | Create, Read, Update, Delete — operaciones básicas sobre una entidad. |
| **CSRF** | Cross-Site Request Forgery. Ataque donde otra web envía requests con la sesión de la víctima. |
| **DTO** | Data Transfer Object — en este proyecto, los schemas de Pydantic. |
| **FK** | Foreign Key. Llave foránea que enlaza tablas. |
| **JWT** | JSON Web Token. Token firmado autocontenido que codifica `sub` (subject), `exp`, etc. |
| **i18n** | Internationalization — habilitar UI multi-idioma. |
| **OAuth2PasswordRequestForm** | Esquema que FastAPI ofrece para login estándar tipo `username + password` (mismo formato que usa OAuth2 Password Flow). |
| **ORM** | Object-Relational Mapper. Aquí: SQLAlchemy mapea clases a tablas. |
| **PK** | Primary Key. Llave primaria. |
| **Pydantic** | Librería de validación de datos basada en type hints. |
| **RBAC** | Role-Based Access Control — control de acceso por roles. Aquí: `require_role("Admin")`. |
| **SPA** | Single Page Application. Toda la app vive en una sola HTML; React Router maneja navegación client-side. |
| **SQLAlchemy** | ORM más popular de Python. |
| **Static Site** | Sitio web servido como archivos planos (HTML/CSS/JS) sin lógica de servidor. Aquí: el frontend en Render. |
| **Supabase** | Plataforma BaaS basada en PostgreSQL. Usado en este proyecto solo como Postgres gestionado. |
| **UUID** | Universally Unique IDentifier. 128 bits, prácticamente sin colisiones. |
| **Vite** | Bundler moderno de JS basado en ES modules, mucho más rápido que webpack. |
| **XSS** | Cross-Site Scripting. Atacante inyecta JS en la página de la víctima. |
| **Etapa** | Estado del proyecto en el embudo comercial: `primer_contacto`, `diagnostico`, `capacitacion`, `desarrollo`, `entrega`. |
| **Broadcast** | Notificación enviada simultáneamente a varios o todos los usuarios. |
| **Lifespan** | Mecanismo de FastAPI para ejecutar código al arranque y apagado de la app. |
| **Healthcheck** | Endpoint trivial (`/health`) que orquestadores consultan para saber si el contenedor está vivo. |
| **Alembic** | Herramienta de migraciones para SQLAlchemy. |

---

## 20. Conclusiones

### 20.1 Estado actual del proyecto

El proyecto se encuentra en **versión 3.0.0** con los Sprints 1, 2 y 3 completados (ver [docs/SPRINT_3_REVIEW.md](docs/SPRINT_3_REVIEW.md) y [docs/PROJECT_ROADMAP.md](docs/PROJECT_ROADMAP.md)). Funcionalmente cubre el flujo completo de seguimiento comercial: gestión de clientes, proyectos, etapas, documentos, mensajería, reuniones, contenido y notificaciones, todo con autenticación JWT y dos roles (Admin / Cliente).

**Funciona localmente vía Docker Compose** con un solo comando (`docker compose up`). Está desplegado parcialmente en Render (frontend Static Site + backend Web Service Docker, con Supabase como BD).

### 20.2 Nivel de mantenibilidad

**Calificación: Media (6/10).**

| Aspecto | Estado |
|---|---|
| Documentación inline | Buena (docstrings descriptivos en módulos clave) |
| README + manual | Bueno (este documento + README.md detallado) |
| Tests backend | Aceptable (cobertura 60% mínimo en CI, pero faltan módulos nuevos) |
| Tests frontend | **Ausente** |
| Separación de capas | Buena en backend (api/services/models), inconsistente con `repositories/` |
| Estilo de código | Inconsistente en frontend (Tailwind + inline) |
| Páginas legacy sin borrar | Genera confusión |
| Migraciones versionadas | Bien (Alembic), pero conviven con `create_all` en lifespan |

Un desarrollador nuevo puede onboarding en **~2-3 horas** siguiendo este manual y el README.

### 20.3 Nivel de escalabilidad

**Calificación: Baja-Media (4/10) — apto para práctica universitaria y demos, NO para producción de alto tráfico.**

Razones:
- Sin paginación generalizada.
- Polling para notificaciones (no WebSockets).
- Uploads al disco del contenedor (no a object storage).
- Sin caché (Redis ausente).
- Sin rate limiting.
- Sin observabilidad (logs estructurados, métricas, tracing).
- Render free tier duerme el backend tras 15 min.

**Para escalar a producción real** se requiere implementar las recomendaciones de Alta y Media prioridad de §17.

### 20.4 Recomendaciones futuras

| Plazo | Acción |
|---|---|
| **Corto (esta semana)** | Rotar SECRET_KEY, cambiar BOOTSTRAP_ADMIN_PASSWORD, borrar legacy pages, eliminar duplicaciones de `_destinatarios_proyecto` |
| **Medio (próximas 4 semanas)** | Migrar JWT a httpOnly cookie + CSRF, añadir rate limiting, paginar listados, tests frontend mínimos |
| **Largo (próximos 3 meses)** | WebSockets para mensajes/notificaciones, object storage para uploads, multi-tenant, refresh tokens, Sentry, dashboard de métricas |

### 20.5 Conclusión final

La **Plataforma Optimixage** es un proyecto fullstack **bien estructurado para una práctica profesional universitaria**, con elecciones tecnológicas modernas (FastAPI + React 19 + Vite + Tailwind 4) y un alcance funcional ambicioso (auth, RBAC, multi-idioma, audit, notificaciones in-app, broadcasts). Ya soporta despliegue local con Docker Compose y despliegue en cloud (Render + Supabase).

Para su uso en producción real con clientes finales se requieren las mejoras de seguridad y escalabilidad indicadas en §17 — pero para fines de evaluación académica y demostración funcional, el sistema está **operativo y completo**.

---

**FIN DEL MANUAL TÉCNICO INTEGRAL**

*Generado a partir del análisis exhaustivo del repositorio en su estado actual al 2026-06-10. Toda afirmación está respaldada por referencias a archivos y números de línea específicos. Para discrepancias entre este documento y el código, prevalece el código.*
