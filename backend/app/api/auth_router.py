from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.usuario_schema import UsuarioCreate, UsuarioLogin
from app.services.auth_service import crear_usuario, autenticar_usuario, crear_token
from app.core.database import SessionLocal

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(user: UsuarioCreate, db: Session = Depends(get_db)):

    usuario = crear_usuario(
        db,
        user.nombre,
        user.email,
        user.password,
        rol_id=None
    )

    return {"message": "Usuario creado", "id": usuario.id}


@router.post("/login")
def login(user: UsuarioLogin, db: Session = Depends(get_db)):

    usuario = autenticar_usuario(db, user.email, user.password)

    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = crear_token(usuario)

    return {"access_token": token, "token_type": "bearer"}
