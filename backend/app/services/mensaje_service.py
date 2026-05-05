from uuid import UUID
from sqlalchemy.orm import Session
from app.models.mensaje import Mensaje
from app.models.usuario import Usuario


def _enrich(db: Session, mensaje: Mensaje) -> dict:
    remitente = db.query(Usuario).filter(Usuario.id == mensaje.remitente_id).first()
    return {
        "id": mensaje.id,
        "contenido": mensaje.contenido,
        "fecha_envio": mensaje.fecha_envio,
        "proyecto_id": mensaje.proyecto_id,
        "remitente_id": mensaje.remitente_id,
        "leido": mensaje.leido,
        "remitente_nombre": remitente.nombre if remitente else None,
        "remitente_rol": remitente.rol.nombre if remitente and remitente.rol else None,
    }


def enviar_mensaje(db: Session, contenido: str, proyecto_id: UUID, remitente_id: UUID) -> dict:
    mensaje = Mensaje(
        contenido=contenido,
        proyecto_id=proyecto_id,
        remitente_id=remitente_id,
    )
    db.add(mensaje)
    db.commit()
    db.refresh(mensaje)
    return _enrich(db, mensaje)


def obtener_mensajes_proyecto(db: Session, proyecto_id: UUID) -> list[dict]:
    mensajes = (
        db.query(Mensaje)
        .filter(Mensaje.proyecto_id == proyecto_id)
        .order_by(Mensaje.fecha_envio)
        .all()
    )
    return [_enrich(db, m) for m in mensajes]


def marcar_leidos(db: Session, proyecto_id: UUID, lector_id: UUID) -> int:
    mensajes = (
        db.query(Mensaje)
        .filter(Mensaje.proyecto_id == proyecto_id, Mensaje.remitente_id != lector_id, Mensaje.leido == False)
        .all()
    )
    for m in mensajes:
        m.leido = True
    db.commit()
    return len(mensajes)
