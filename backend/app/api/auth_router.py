from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas.usuario_schema import UsuarioCreate
from app.services.auth_service import crear_usuario, autenticar_usuario, crear_token
from app.core.database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(user: UsuarioCreate, db: Session = Depends(get_db)):

    usuario = crear_usuario(
        db,
        user.nombre,
        user.email,
        user.password
    )

    return {
        "message": "Usuario creado",
        "id": usuario.id
    }


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    email = form_data.username
    password = form_data.password

    usuario = autenticar_usuario(db, email, password)

    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = crear_token(usuario)

    return {
        "access_token": token,
        "token_type": "bearer"
    }