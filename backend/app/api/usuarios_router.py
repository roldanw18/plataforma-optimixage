import uuid as _uuid_mod
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.security import hash_password, verify_password
from app.models.usuario import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

UPLOADS_DIR = Path("uploads")
AVATARS_DIR = UPLOADS_DIR / "avatars"
AVATARS_DIR.mkdir(parents=True, exist_ok=True)

AVATAR_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5 MB


def _perfil_dict(usuario: Usuario) -> dict:
    return {
        "id": str(usuario.id),
        "nombre": usuario.nombre,
        "email": usuario.email,
        "avatar_url": usuario.avatar_url,
        "telefono": usuario.telefono,
        "rol": {"nombre": usuario.rol.nombre} if usuario.rol else None,
    }


class PerfilUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    avatar_url: Optional[str] = None


class CambiarPasswordRequest(BaseModel):
    password_actual: str
    password_nuevo: str


@router.get("/me")
def get_profile(usuario: Usuario = Depends(get_current_user)):
    return _perfil_dict(usuario)


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
    return _perfil_dict(usuario)


@router.post("/me/avatar")
def subir_avatar(
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    ext = Path(archivo.filename or "").suffix.lower()
    if ext not in AVATAR_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no permitido. Usa: {', '.join(sorted(AVATAR_EXTS))}",
        )

    content = archivo.file.read()
    if len(content) > MAX_AVATAR_SIZE:
        raise HTTPException(status_code=400, detail="El avatar supera el límite de 5 MB")

    # Borrar avatar anterior si era local
    if usuario.avatar_url and usuario.avatar_url.startswith("/usuarios/avatar/"):
        old_name = usuario.avatar_url.rsplit("/", 1)[-1]
        old_path = AVATARS_DIR / old_name
        if old_path.exists():
            try:
                old_path.unlink()
            except OSError:
                pass

    safe_name = f"{usuario.id}_{_uuid_mod.uuid4().hex[:8]}{ext}"
    file_path = AVATARS_DIR / safe_name
    with open(file_path, "wb") as f:
        f.write(content)

    new_url = f"/usuarios/avatar/{safe_name}"
    usuario.avatar_url = new_url
    db.commit()
    db.refresh(usuario)
    return _perfil_dict(usuario)


@router.get("/avatar/{filename}")
def servir_avatar(filename: str):
    file_path = (AVATARS_DIR / filename).resolve()
    allowed_root = AVATARS_DIR.resolve()
    if not str(file_path).startswith(str(allowed_root)):
        raise HTTPException(status_code=400, detail="Ruta inválida")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Avatar no encontrado")
    return FileResponse(path=str(file_path))


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
