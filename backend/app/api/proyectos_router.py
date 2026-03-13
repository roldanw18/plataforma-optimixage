from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user, require_role
from app.models.usuario import Usuario

router = APIRouter(prefix="/proyectos", tags=["Proyectos"])

@router.post("/")
def crear_proyecto(usuario = Depends(require_role("Admin"))):

    return {
        "message": "Proyecto creado",
        "admin": usuario.email
    }
    
@router.get("/mis-proyectos")
def ver_proyectos(usuario = Depends(require_role("Cliente"))):

    return {
        "message": "Proyectos del cliente",
        "usuario": usuario.email
    }