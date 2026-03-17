# Plataforma de Seguimiento de Proyectos

## Descripción del Proyecto

Este proyecto consiste en una plataforma web para la gestión y seguimiento del progreso de proyectos entre administradores y clientes.

El sistema permite:

* Registrar usuarios con roles (Administrador / Cliente)
* Autenticación segura mediante JWT
* Gestión y seguimiento de proyectos
* Visualización del estado y avance del proyecto
* Control de acceso basado en roles (RBAC)

La aplicación está diseñada siguiendo principios de arquitectura por capas para garantizar escalabilidad, mantenibilidad y claridad en la organización del código.

---

# Arquitectura del Sistema

El backend implementa una **arquitectura por capas (Layered Architecture)** separando responsabilidades en:

* **API Layer** → Endpoints y routers
* **Service Layer** → Lógica de negocio
* **Data Layer** → Modelos ORM y acceso a datos
* **Core Layer** → Configuración, seguridad, logging y dependencias

Esto permite mantener el sistema modular y fácil de escalar.

---

# Stack Tecnológico

Backend:

* FastAPI
* Python
* SQLAlchemy
* JWT Authentication
* PostgreSQL / SQLite
* Pytest para testing

Infraestructura:

* GitHub (Control de versiones)
* CI Pipeline (GitHub Actions)
* Migración futura a Azure DevOps

Frontend (Sprint 2):

* React
* API REST

---

# Estructura del Proyecto

backend
│
├── alembic
├── app
│   ├── api
│   ├── core
│   ├── models
│   ├── repositories
│   ├── schemas
│   ├── scripts
│   ├── services
│   └── main.py
├── tests
docs
frontend
│
└── docker-compose.yml
└── README.md
└── requirements.txt


# Funcionalidades Implementadas (Sprint 1)

* Arquitectura base del sistema
* Modelado de base de datos
* Sistema de autenticación JWT
* Control de acceso por roles (RBAC)
* Protección de endpoints
* Logging del sistema
* Manejo global de errores
* Testing automático con Pytest

---

# Instalación del Proyecto

1. Clonar repositorio

git clone <repo_url>

2. Crear entorno virtual

python -m venv venv

3. Activar entorno

Windows:
venv\Scripts\activate

4. Instalar dependencias

pip install -r requirements.txt

5. Ejecutar servidor

uvicorn app.main:app --reload

---

# Documentación de la API

FastAPI genera documentación automática:

http://127.0.0.1:8000/docs

---

# Testing

Para ejecutar los tests:

pytest

---

# Roadmap del Proyecto

Sprint 1:

* Backend base
* Autenticación
* Seguridad
* Testing

Sprint 2:

* Implementación del frontend con React
* Dashboard de proyectos
* Gestión de etapas del proyecto

Sprint 3:

* Gestión documental
* Sistema de comunicación
* CI/CD y despliegue

---

# Autor

Proyecto desarrollado como parte del proceso de práctica en ingeniería de software.
