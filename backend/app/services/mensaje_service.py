from uuid import UUID
from sqlalchemy.orm import Session
from app.models.mensaje import Mensaje


def enviar_mensaje(db: Session, contenido: str, proyecto_id: UUID, remitente_id: UUID) -> Mensaje:
    mensaje = Mensaje(
        contenido=contenido,
        proyecto_id=proyecto_id,
        remitente_id=remitente_id,
    )
    db.add(mensaje)
    db.commit()
    db.refresh(mensaje)
    return mensaje


def obtener_mensajes_proyecto(db: Session, proyecto_id: UUID) -> list[Mensaje]:
    return db.query(Mensaje).filter(Mensaje.proyecto_id == proyecto_id).order_by(Mensaje.fecha_envio).all()
