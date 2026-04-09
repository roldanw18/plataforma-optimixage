from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.usuario import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/me")
def get_profile(usuario: Usuario = Depends(get_current_user)):
    return {
        "id": str(usuario.id),
        "nombre": usuario.nombre,
        "email": usuario.email,
        "avatar_url": usuario.avatar_url,
        "telefono": usuario.telefono,
        "rol": {"nombre": usuario.rol.nombre} if usuario.rol else None,
    }


@router.get("/")
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_role("Admin")),
):
    usuarios = db.query(Usuario).all()
    return [
        {
            "id": str(u.id),
            "nombre": u.nombre,
            "email": u.email,
            "avatar_url": u.avatar_url,
            "telefono": u.telefono,
            "is_active": u.is_active,
            "rol": {"nombre": u.rol.nombre} if u.rol else None,
        }
        for u in usuarios
    ]
