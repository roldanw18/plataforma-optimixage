from fastapi import FastAPI
from app.core.database import engine, Base
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.api import auth_router


app = FastAPI(
    title="Plataforma de Seguimiento",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router.router)

@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}
