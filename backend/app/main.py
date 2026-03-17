from fastapi import FastAPI
from app.core.database import engine, Base
from app.core.exception_handlers import global_exception_handler
#from app.models.usuario import Usuario
#from app.models.rol import Rol
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth_router import router as auth_router
from app.api.proyectos_router import router as proyectos_router
from app.api.usuarios_router import router as usuarios_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Plataforma de Seguimiento",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(proyectos_router)
app.include_router(usuarios_router)
app.add_exception_handler(Exception, global_exception_handler)

logger.info("API iniciada correctamente")

@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}

#@app.get("/error-test")
#def error_test():
#    raise Exception("Error de prueba")

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "backend",
        "version": "1.0"
    }