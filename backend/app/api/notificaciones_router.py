from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.notificacion import Notificacion
from app.models.usuario import Usuario
from app.schemas.notificacion_schema import NotificacionResponse

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


@router.patch("/{notificacion_id}/leer", response_model=NotificacionResponse)
def marcar_leida(
    notificacion_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    notif = (
        db.query(Notificacion)
        .filter(
            Notificacion.id == notificacion_id,
            Notificacion.usuario_id == current_user.id,
        )
        .first()
    )
    if not notif:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Notificación no encontrada")

    notif.leida = True
    db.commit()
    db.refresh(notif)
    return notif


@router.patch("/leer-todas", status_code=204)
def marcar_todas_leidas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    db.query(Notificacion).filter(
        Notificacion.usuario_id == current_user.id,
        Notificacion.leida == False,
    ).update({"leida": True})
    db.commit()
