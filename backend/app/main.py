from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import SessionLocal
from app.api.auth_router import router as auth_router
from app.api.proyectos_router import router as proyectos_router
from app.api.usuarios_router import router as usuarios_router
from app.api.documentos_router import router as documentos_router
from app.api.mensajes_router import router as mensajes_router
from app.api.hitos_router import router as hitos_router
from app.api.tareas_router import router as tareas_router
from app.api.reuniones_router import router as reuniones_router
from app.api.notificaciones_router import router as notificaciones_router
from app.api.proceso_router import router as proceso_router
from app.utils.logger import get_logger

logger = get_logger(__name__)


def _seed_roles_y_admin():
    """
    Asegura roles base (Admin, Cliente) y un usuario administrador inicial.

    El admin se crea SOLO si todavia no existe ningun usuario, para que un
    desarrollador que clona limpio pueda iniciar sesion sin tocar la BD a mano.
    Las credenciales se controlan via .env (BOOTSTRAP_ADMIN_*).
    """
    from app.models.rol import Rol
    from app.models.usuario import Usuario
    from app.core.security import hash_password

    db = SessionLocal()
    try:
        for nombre in ["Admin", "Cliente"]:
            if not db.query(Rol).filter(Rol.nombre == nombre).first():
                db.add(Rol(nombre=nombre))
                logger.info(f"Rol creado: {nombre}")
        db.commit()

        if db.query(Usuario).count() == 0:
            admin_rol = db.query(Rol).filter(Rol.nombre == "Admin").first()
            db.add(
                Usuario(
                    nombre=settings.BOOTSTRAP_ADMIN_NOMBRE,
                    email=settings.BOOTSTRAP_ADMIN_EMAIL,
                    password_hash=hash_password(settings.BOOTSTRAP_ADMIN_PASSWORD),
                    rol_id=admin_rol.id,
                )
            )
            db.commit()
            logger.warning(
                "Usuario admin de bootstrap creado: %s (cambialo en produccion)",
                settings.BOOTSTRAP_ADMIN_EMAIL,
            )
    except Exception as exc:
        logger.warning(f"Seed inicial omitido: {exc}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando aplicacion en entorno '%s'", settings.ENVIRONMENT)
    logger.info("CORS origins permitidos: %s", settings.CORS_ORIGINS)
    _seed_roles_y_admin()
    yield
    logger.info("Aplicacion detenida.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# --- CORS ---------------------------------------------------------------
# Sin esto el frontend que corre en otro origen (localhost:5173 / :3000)
# recibe respuestas bloqueadas por el navegador y el login falla en silencio.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ------------------------------------------------------------
app.include_router(auth_router)
app.include_router(proyectos_router, prefix="/proyectos", tags=["Proyectos"])
app.include_router(usuarios_router)
app.include_router(documentos_router)
app.include_router(mensajes_router)
app.include_router(hitos_router)
app.include_router(tareas_router)
app.include_router(reuniones_router)
app.include_router(notificaciones_router)
app.include_router(proceso_router)


@app.get("/")
def root():
    return {
        "message": "API funcionando correctamente",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health")
def health():
    """Healthcheck simple para Docker / load balancers."""
    return {"status": "ok"}
