from fastapi import FastAPI
from app.core.database import engine, Base

from app.api.auth_router import router as auth_router
from app.api.proyectos_router import router as proyectos_router
from app.api.usuarios_router import router as usuarios_router

app = FastAPI(
    title="Plataforma de Seguimiento",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(proyectos_router, prefix="/proyectos", tags=["Proyectos"])
app.include_router(usuarios_router)

@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}