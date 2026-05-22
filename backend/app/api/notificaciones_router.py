from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.notificacion import Notificacion
from app.models.usuario import Usuario
from app.schemas.notificacion_schema import (
    BroadcastResultado,
    NotificacionAdminResponse,
    NotificacionBroadcast,
    NotificacionCountResponse,
    NotificacionResponse,
)
from app.services.notificaciones_service import crear_para_muchos, crear_para_todos

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


@router.get("/", response_model=list[NotificacionResponse])
def mis_notificaciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return (
        db.query(Notificacion)
        .filter(Notificacion.usuario_id == current_user.id)
        .order_by(Notificacion.created_at.desc())
        .all()
    )


@router.get("/count", response_model=NotificacionCountResponse)
def contar_no_leidas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Endpoint ligero para el badge del sidebar.
    - Admin: cuenta TODAS las no leídas del sistema (vista de supervisión).
    - Cliente: cuenta solo las suyas.
    """
    es_admin = current_user.rol and current_user.rol.nombre == "Admin"
    query = db.query(Notificacion).filter(Notificacion.leida.is_(False))
    if not es_admin:
        query = query.filter(Notificacion.usuario_id == current_user.id)
    return {"no_leidas": query.count()}


@router.get("/todas", response_model=list[NotificacionAdminResponse])
def todas_las_notificaciones(
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_role("Admin")),
):
    """Devuelve todas las notificaciones del sistema. Solo admin."""
    return (
        db.query(Notificacion)
        .order_by(Notificacion.created_at.desc())
        .limit(300)
        .all()
    )


@router.patch("/leer-todas", status_code=204)
def marcar_todas_leidas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Marca todas las no leídas como leídas.
    - Admin: marca TODAS las del sistema (vista de supervisión).
    - Cliente: marca solo las suyas.
    """
    es_admin = current_user.rol and current_user.rol.nombre == "Admin"
    query = db.query(Notificacion).filter(Notificacion.leida.is_(False))
    if not es_admin:
        query = query.filter(Notificacion.usuario_id == current_user.id)
    query.update({"leida": True}, synchronize_session=False)
    db.commit()


@router.patch("/{notificacion_id}/leer", response_model=NotificacionResponse)
def marcar_leida(
    notificacion_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Marca una notificación como leída. El dueño puede marcar las suyas; los
    administradores pueden marcar cualquiera desde el panel de supervisión.
    """
    es_admin = current_user.rol and current_user.rol.nombre == "Admin"

    query = db.query(Notificacion).filter(Notificacion.id == notificacion_id)
    if not es_admin:
        query = query.filter(Notificacion.usuario_id == current_user.id)

    notif = query.first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")

    notif.leida = True
    db.commit()
    db.refresh(notif)
    return notif


@router.delete("/{notificacion_id}", status_code=204)
def eliminar_notificacion(
    notificacion_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Elimina una notificación. El dueño puede borrar las suyas; los administradores
    pueden borrar cualquier notificación desde el panel de supervisión.
    """
    es_admin = current_user.rol and current_user.rol.nombre == "Admin"

    query = db.query(Notificacion).filter(Notificacion.id == notificacion_id)
    if not es_admin:
        query = query.filter(Notificacion.usuario_id == current_user.id)

    notif = query.first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")

    db.delete(notif)
    db.commit()


@router.post("/broadcast", response_model=BroadcastResultado, status_code=201)
def broadcast_admin(
    payload: NotificacionBroadcast,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_role("Admin")),
):
    """
    Envía una notificación a uno, varios o todos los usuarios activos.
    Restringido a administradores.
    """
    if payload.usuario_ids:
        enviadas = crear_para_muchos(
            db,
            usuario_ids=payload.usuario_ids,
            tipo=payload.tipo,
            titulo=payload.titulo,
            contenido=payload.contenido,
        )
        destino = "seleccionados"
    else:
        enviadas = crear_para_todos(
            db,
            tipo=payload.tipo,
            titulo=payload.titulo,
            contenido=payload.contenido,
            excluir_usuario_id=admin.id,
        )
        destino = "todos"

    return {"enviadas": enviadas, "destino": destino}
