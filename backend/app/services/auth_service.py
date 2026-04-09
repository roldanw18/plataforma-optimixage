import os
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.core.security import hash_password, verify_password
from app.utils.audit import registrar_evento
from jose import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def crear_usuario(db: Session, nombre: str, email: str, password: str):

    rol_cliente = db.query(Rol).filter(Rol.nombre == "Cliente").first()

    if not rol_cliente:
        raise Exception("Rol Cliente no encontrado")

    usuario = Usuario(
        nombre=nombre,
        email=email,
        password_hash=hash_password(password),
        rol_id=rol_cliente.id
    )

    db.add(usuario)
    db.flush()  # obtener el id antes del commit

    registrar_evento(
        db,
        accion="registro_usuario",
        usuario_id=usuario.id,
        tabla="usuarios",
        registro_id=usuario.id,
        detalle_nuevo={"nombre": nombre, "email": email, "rol": "Cliente"},
    )

    db.commit()
    db.refresh(usuario)

    return usuario


def autenticar_usuario(db: Session, email: str, password: str):

    usuario = db.query(Usuario).filter(Usuario.email == email).first()

    if not usuario:
        return None

    if not verify_password(password, usuario.password_hash):
        return None

    return usuario


def crear_token(usuario: Usuario):

    payload = {
        "sub": str(usuario.id),
        "email": usuario.email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return token