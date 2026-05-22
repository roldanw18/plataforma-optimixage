from uuid import UUID
from sqlalchemy.orm import Session
from app.models.mensaje import Mensaje
from app.models.usuario import Usuario
from app.models.proyecto import Proyecto
from app.models.proyecto_miembro import ProyectoMiembro
from app.services.notificaciones_service import crear_para_muchos


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


def _destinatarios_proyecto(db: Session, proyecto_id: UUID, excluir: UUID) -> list[UUID]:
    """Devuelve los user_ids relevantes para un proyecto (cliente + miembros), excluyendo uno."""
    ids: set[UUID] = set()
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if proyecto and proyecto.cliente_id:
        ids.add(proyecto.cliente_id)
    miembros = (
        db.query(ProyectoMiembro.usuario_id)
        .filter(ProyectoMiembro.proyecto_id == proyecto_id)
        .all()
    )
    for (uid,) in miembros:
        ids.add(uid)
    ids.discard(excluir)
    return list(ids)


def enviar_mensaje(db: Session, contenido: str, proyecto_id: UUID, remitente_id: UUID) -> dict:
    mensaje = Mensaje(
        contenido=contenido,
        proyecto_id=proyecto_id,
        remitente_id=remitente_id,
    )
    db.add(mensaje)
    db.commit()
    db.refresh(mensaje)

    destinatarios = _destinatarios_proyecto(db, proyecto_id, excluir=remitente_id)
    if destinatarios:
        remitente = db.query(Usuario).filter(Usuario.id == remitente_id).first()
        nombre_remitente = remitente.nombre if remitente else "Alguien"
        preview = contenido if len(contenido) <= 120 else contenido[:117] + "..."
        crear_para_muchos(
            db,
            usuario_ids=destinatarios,
            tipo="mensaje_nuevo",
            titulo=f"Nuevo mensaje de {nombre_remitente}",
            contenido=preview,
            referencia_id=proyecto_id,
            referencia_tipo="proyecto",
        )

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
