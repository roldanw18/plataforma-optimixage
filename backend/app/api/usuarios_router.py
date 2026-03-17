from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.dependencies import get_current_user, require_role
from app.models.usuario import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/me")
def get_profile(usuario: Usuario = Depends(get_current_user)):
    """
    Devuelve la información del usuario autenticado
    """
    return {
        "id": str(usuario.id),
        "nombre": usuario.nombre,
        "email": usuario.email
    }


@router.get("/")
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Admin"))
):
    """
    Lista todos los usuarios
    """
    usuarios = db.query(Usuario).all()

    return [
        {
            "id": str(u.id),
            "nombre": u.nombre,
            "email": u.email
        }
        for u in usuarios
    ]