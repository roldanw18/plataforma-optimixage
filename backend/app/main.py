from contextlib import asynccontextmanager

from fastapi import FastAPI

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


def _seed_roles():
    """Crea los roles base (Admin, Cliente) si no existen."""
    from app.models.rol import Rol

    db = SessionLocal()
    try:
        for nombre in ["Admin", "Cliente"]:
            if not db.query(Rol).filter(Rol.nombre == nombre).first():
                db.add(Rol(nombre=nombre))
                logger.info(f"Rol creado: {nombre}")
        db.commit()
    except Exception as exc:
        logger.warning(f"Seed de roles omitido: {exc}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando aplicación…")
    _seed_roles()
    yield
    logger.info("Aplicación detenida.")


app = FastAPI(
    title="Plataforma de Seguimiento",
    version="3.0.0",
    lifespan=lifespan,
)

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
    return {"message": "API funcionando correctamente"}
