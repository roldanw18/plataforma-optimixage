"""
Service centralizado para crear y gestionar notificaciones.

Diseñado para ser llamado desde cualquier otro service cuando ocurra un evento
relevante. Las funciones nunca lanzan excepción: si la notificación falla, se
registra en el logger pero NO rompe la transacción que la disparó.
"""
from typing import Iterable, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.notificacion import Notificacion
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.utils.logger import get_logger

logger = get_logger(__name__)


def crear_notificacion(
    db: Session,
    *,
    usuario_id: UUID,
    tipo: str,
    titulo: str,
    contenido: Optional[str] = None,
    referencia_id: Optional[UUID] = None,
    referencia_tipo: Optional[str] = None,
    commit: bool = True,
) -> Optional[Notificacion]:
    """
    Crea una notificación para un usuario. Si falla, no propaga la excepción
    (loguea y devuelve None) para no romper el flujo del caller.

    `commit=False` permite agrupar varias notificaciones en una sola transacción.
    """
    try:
        notif = Notificacion(
            usuario_id=usuario_id,
            tipo=tipo,
            titulo=titulo,
            contenido=contenido,
            referencia_id=referencia_id,
            referencia_tipo=referencia_tipo,
        )
        db.add(notif)
        if commit:
            db.commit()
            db.refresh(notif)
        else:
            db.flush()
        return notif
    except Exception as exc:
        logger.warning("No se pudo crear notificacion para usuario %s: %s", usuario_id, exc)
        if commit:
            db.rollback()
        return None


def crear_para_muchos(
    db: Session,
    *,
    usuario_ids: Iterable[UUID],
    tipo: str,
    titulo: str,
    contenido: Optional[str] = None,
    referencia_id: Optional[UUID] = None,
    referencia_tipo: Optional[str] = None,
) -> int:
    """
    Crea la misma notificación para una lista de usuarios en una sola transacción.
    Devuelve el número de notificaciones efectivamente creadas.
    """
    creadas = 0
    try:
        for uid in usuario_ids:
            notif = Notificacion(
                usuario_id=uid,
                tipo=tipo,
                titulo=titulo,
                contenido=contenido,
                referencia_id=referencia_id,
                referencia_tipo=referencia_tipo,
            )
            db.add(notif)
            creadas += 1
        db.commit()
        return creadas
    except Exception as exc:
        logger.warning("Fallo creando notificaciones en lote: %s", exc)
        db.rollback()
        return 0


def crear_para_admins(
    db: Session,
    *,
    tipo: str,
    titulo: str,
    contenido: Optional[str] = None,
    referencia_id: Optional[UUID] = None,
    referencia_tipo: Optional[str] = None,
    excluir_usuario_id: Optional[UUID] = None,
) -> int:
    """
    Crea la misma notificación para todos los usuarios con rol Admin activos.
    Útil para eventos del sistema que el admin debe conocer (nuevo cliente,
    cambio de etapa, etc.). `excluir_usuario_id` opcionalmente evita notificar
    al admin que disparó el evento.
    """
    query = (
        db.query(Usuario.id)
        .join(Rol, Usuario.rol_id == Rol.id)
        .filter(Usuario.is_active.is_(True), Rol.nombre == "Admin")
    )
    if excluir_usuario_id is not None:
        query = query.filter(Usuario.id != excluir_usuario_id)
    admin_ids = [row.id for row in query.all()]
    if not admin_ids:
        return 0
    return crear_para_muchos(
        db,
        usuario_ids=admin_ids,
        tipo=tipo,
        titulo=titulo,
        contenido=contenido,
        referencia_id=referencia_id,
        referencia_tipo=referencia_tipo,
    )


def crear_para_todos(
    db: Session,
    *,
    tipo: str,
    titulo: str,
    contenido: Optional[str] = None,
    referencia_id: Optional[UUID] = None,
    referencia_tipo: Optional[str] = None,
    excluir_usuario_id: Optional[UUID] = None,
) -> int:
    """
    Crea la misma notificación para todos los usuarios activos del sistema.
    `excluir_usuario_id` evita notificar al propio emisor del evento.
    """
    query = db.query(Usuario.id).filter(Usuario.is_active.is_(True))
    if excluir_usuario_id is not None:
        query = query.filter(Usuario.id != excluir_usuario_id)
    user_ids = [row.id for row in query.all()]
    return crear_para_muchos(
        db,
        usuario_ids=user_ids,
        tipo=tipo,
        titulo=titulo,
        contenido=contenido,
        referencia_id=referencia_id,
        referencia_tipo=referencia_tipo,
    )
