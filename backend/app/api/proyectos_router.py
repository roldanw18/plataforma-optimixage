from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.usuario import Usuario

router = APIRouter(prefix="/proyectos", tags=["Proyectos"])


@router.get("/")
def listar_proyectos(usuario: Usuario = Depends(get_current_user)):

    return {
        "message": "Acceso permitido",
        "usuario": usuario.email
    }
