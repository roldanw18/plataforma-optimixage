from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.tarea import Tarea
from app.models.proyecto import Proyecto
from app.models.usuario import Usuario
from app.schemas.tarea_schema import TareaCreate, TareaUpdate, TareaResponse

router = APIRouter(prefix="/tareas", tags=["Tareas"])


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

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(tarea, field, value)

    db.commit()
    db.refresh(tarea)
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
