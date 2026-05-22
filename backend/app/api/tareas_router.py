from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.tarea import Tarea
from app.models.proyecto import Proyecto
from app.models.usuario import Usuario
from app.schemas.tarea_schema import TareaCreate, TareaUpdate, TareaResponse
from app.services.notificaciones_service import crear_notificacion

router = APIRouter(prefix="/tareas", tags=["Tareas"])


def _notificar_asignacion(db: Session, tarea: Tarea, asignador: Usuario):
    """Crea notificación cuando una tarea queda asignada a alguien distinto al asignador."""
    if not tarea.asignado_a or tarea.asignado_a == asignador.id:
        return
    crear_notificacion(
        db,
        usuario_id=tarea.asignado_a,
        tipo="tarea_asignada",
        titulo=f"Nueva tarea asignada: {tarea.titulo}",
        contenido=f"{asignador.nombre} te asignó una tarea",
        referencia_id=tarea.id,
        referencia_tipo="tarea",
    )


@router.post("/", response_model=TareaResponse)
def crear_tarea(
    data: TareaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    proyecto = db.query(Proyecto).filter(Proyecto.id == data.proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    tarea = Tarea(**data.model_dump(), creado_por=current_user.id)
    db.add(tarea)
    db.commit()
    db.refresh(tarea)

    _notificar_asignacion(db, tarea, current_user)

    return tarea


@router.get("/proyecto/{proyecto_id}", response_model=list[TareaResponse])
def listar_tareas_proyecto(
    proyecto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return db.query(Tarea).filter(Tarea.proyecto_id == proyecto_id).all()


@router.get("/mis-tareas", response_model=list[TareaResponse])
def mis_tareas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return db.query(Tarea).filter(Tarea.asignado_a == current_user.id).all()


@router.patch("/{tarea_id}", response_model=TareaResponse)
def actualizar_tarea(
    tarea_id: UUID,
    data: TareaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    tarea = db.query(Tarea).filter(Tarea.id == tarea_id).first()
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    # Solo Admin puede cambiar todo; el asignado solo puede cambiar el estado
    if current_user.rol.nombre != "Admin" and tarea.asignado_a != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos sobre esta tarea")

    asignado_previo = tarea.asignado_a
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(tarea, field, value)

    db.commit()
    db.refresh(tarea)

    # Notificar solo si la tarea quedó asignada a alguien distinto al previo
    if tarea.asignado_a and tarea.asignado_a != asignado_previo:
        _notificar_asignacion(db, tarea, current_user)

    return tarea


@router.delete("/{tarea_id}", status_code=204)
def eliminar_tarea(
    tarea_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    tarea = db.query(Tarea).filter(Tarea.id == tarea_id).first()
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    db.delete(tarea)
    db.commit()
