from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.usuario_schema import UsuarioCreate
from app.services.auth_service import crear_usuario, autenticar_usuario, crear_token
from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.usuario import Usuario

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=201)
def register(
    user: UsuarioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("Admin")),
):
    """
    Crea un nuevo usuario con rol Cliente.
    Solo accesible por administradores.
    """
    existing = db.query(Usuario).filter(Usuario.email == user.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe un usuario con ese correo.")

    usuario = crear_usuario(db, user.nombre, user.email, user.password)
    return {"message": "Usuario creado", "id": str(usuario.id)}


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    usuario = autenticar_usuario(db, form_data.username, form_data.password)
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = crear_token(usuario)
    return {"access_token": token, "token_type": "bearer"}
