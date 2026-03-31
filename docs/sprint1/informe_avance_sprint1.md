# Informe de Avance — Plataforma de Seguimiento de Proyectos
**Fecha:** 31 de marzo de 2026 | **Última actualización:** 31 de marzo de 2026 | **Sprint:** 1 | **Estado:** Completado

---

## 1. Resumen Ejecutivo

El Sprint 1 ha concluido exitosamente. Se ha construido y validado el núcleo del backend de la plataforma, incluyendo autenticación segura, control de acceso por roles y gestión básica de proyectos. El pipeline de integración continua está operativo y todos los tests automatizados pasan correctamente. Adicionalmente, se aplicaron correcciones de seguridad, calidad de código y lógica de negocio identificadas durante la revisión post-sprint.

---

## 2. Objetivos del Sprint 1

| Objetivo | Estado |
|---|---|
| Definición del stack tecnológico | Completado |
| Arquitectura del sistema | Completado |
| Estrategia de autenticación | Completado |
| API REST funcional (auth + usuarios + proyectos) | Completado |
| Suite de tests automatizados | Completado |
| Pipeline CI/CD en GitHub Actions | Completado |

---

## 3. Funcionalidades entregadas

### Autenticación y Seguridad
- Registro e inicio de sesión de usuarios con contraseña cifrada (bcrypt)
- Tokens de acceso JWT con expiración configurable
- Control de acceso basado en roles (RBAC): **Cliente** y **Admin**

### Gestión de Usuarios
- Consulta del perfil del usuario autenticado
- Listado de usuarios (restringido a administradores)

### Gestión de Proyectos
- Creación de proyectos (restringido a administradores)
- Listado de proyectos para usuarios autenticados

---

## 4. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend / API | Python 3.10 · FastAPI |
| Base de datos | PostgreSQL (producción) · SQLite (tests) |
| ORM / Migraciones | SQLAlchemy 2.0 · Alembic |
| Autenticación | JWT (python-jose) · bcrypt |
| Testing | pytest · pytest-cov |
| CI/CD | GitHub Actions |

---

## 5. Calidad y Testing

Se ejecutaron **7 tests automatizados**, todos con resultado exitoso:

| Test | Endpoint | Resultado |
|---|---|---|
| Registro de usuario | `POST /auth/register` | Pasado |
| Inicio de sesión | `POST /auth/login` | Pasado |
| Cliente no puede crear proyecto | `POST /proyectos/` | Pasado |
| Admin crea proyecto | `POST /proyectos/` | Pasado |
| Listar proyectos | `GET /proyectos/mis-proyectos` | Pasado |
| Crear proyecto sin permisos | `POST /proyectos/` | Pasado |
| Consultar perfil | `GET /usuarios/me` | Pasado |

**Cobertura:** Auth · Roles · Proyectos · Usuarios

---

## 6. CI/CD

El pipeline de GitHub Actions ejecuta automáticamente todos los tests en cada push a la rama `develop` y en cada Pull Request, garantizando que ningún cambio rompa funcionalidad existente.

---

## 7. Arquitectura implementada

Se adoptó una arquitectura en capas desacoplada que facilita el mantenimiento y la escalabilidad:

```
Cliente HTTP → API (Routers) → Servicios → Repositorios → Base de Datos
```

Esta separación permite incorporar el frontend (Sprint 2) sin modificar la lógica de negocio existente.

---

## 8. Próximos pasos — Sprint 2

- Desarrollo del frontend con React
- Dashboard de seguimiento de proyectos
- Panel de gestión para administradores
- Integración frontend ↔ API REST

---

## 9. Correcciones post-sprint

Durante la revisión final del Sprint 1 se identificaron y resolvieron los siguientes puntos antes de avanzar al Sprint 2:

| Corrección | Detalle |
|---|---|
| Pipeline CI/CD corregido | `pytest` corría desde el directorio raíz; corregido con `working-directory: ./backend` |
| Fixtures de tests faltantes | Agregados `auth_token` y `admin_token` en `conftest.py` |
| Aislamiento de BD en tests | Agregado `StaticPool` para compartir conexión SQLite entre hilos del TestClient |
| Dependencia `get_db` duplicada | `auth_router`, `usuarios_router` y `dependencies` definían su propio `get_db` ignorando el override de tests; unificados con `database.get_db` |
| UUID incompatible con SQLite | `dependencies.py` y `conftest.py` convertían el `user_id` del JWT a `uuid.UUID` para compatibilidad con SQLite |
| Serialización de UUID en schema | `ProyectoResponse.id` cambiado de `str` a `UUID` para compatibilidad con Pydantic v2 |
| Clave JWT en variable de entorno | `SECRET_KEY` migrado a `os.getenv()` y agregado al workflow de CI |
| Deprecación `datetime.utcnow()` | Reemplazado por `datetime.now(timezone.utc)` |
| Deprecación Pydantic `class Config` | `UsuarioResponse` migrado a `ConfigDict` |
| `cliente_id` sin asignar | Al crear un proyecto se asigna `cliente_id=current_user.id` |

**Resultado tras correcciones:** 7/7 tests pasando, 0 warnings.

---

## 10. Riesgos y observaciones

| Observación | Estado |
|---|---|
| Clave JWT en variable de entorno | Resuelto — usar `SECRET_KEY` como secreto de GitHub en producción |
| Sin almacenamiento de archivos aún | Pendiente — definir estrategia en Sprint 2 (documentado en KA03) |
| Frontend pendiente | Planificado para Sprint 2 |

---

*Informe generado el 31/03/2026 · Actualizado el 31/03/2026 · Proyecto en desarrollo activo*
