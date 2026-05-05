from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.security import hash_password, verify_password
from app.models.usuario import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


class PerfilUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    avatar_url: Optional[str] = None


class CambiarPasswordRequest(BaseModel):
    password_actual: str
    password_nuevo: str


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


@router.patch("/me")
def update_profile(
    data: PerfilUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    if data.nombre is not None:
        usuario.nombre = data.nombre
    if data.telefono is not None:
        usuario.telefono = data.telefono
    if data.avatar_url is not None:
        usuario.avatar_url = data.avatar_url
    db.commit()
    db.refresh(usuario)
    return {
        "id": str(usuario.id),
        "nombre": usuario.nombre,
        "email": usuario.email,
        "avatar_url": usuario.avatar_url,
        "telefono": usuario.telefono,
        "rol": {"nombre": usuario.rol.nombre} if usuario.rol else None,
    }


@router.patch("/me/password")
def change_password(
    data: CambiarPasswordRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    if not verify_password(data.password_actual, usuario.password_hash):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    if len(data.password_nuevo) < 6:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 6 caracteres")
    usuario.password_hash = hash_password(data.password_nuevo)
    db.commit()
    return {"message": "Contraseña actualizada correctamente"}


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
