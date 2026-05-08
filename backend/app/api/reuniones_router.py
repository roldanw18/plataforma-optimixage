from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.reunion import Reunion
from app.models.proyecto import Proyecto
from app.models.usuario import Usuario
from app.schemas.reunion_schema import (
    ReunionCreate,
    ReunionUpdate,
    ReunionResponse,
    ESTADOS_REUNION,
)

router = APIRouter(prefix="/reuniones", tags=["Reuniones"])


@router.post("/", response_model=ReunionResponse)
def crear_reunion(
    data: ReunionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    proyecto = db.query(Proyecto).filter(Proyecto.id == data.proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if data.estado and data.estado not in ESTADOS_REUNION:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Usa: {sorted(ESTADOS_REUNION)}")

    reunion = Reunion(**data.model_dump(), creado_por=current_user.id)
    db.add(reunion)
    db.commit()
    db.refresh(reunion)
    return reunion


@router.get("/proyecto/{proyecto_id}", response_model=list[ReunionResponse])
def listar_reuniones(
    proyecto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return (
        db.query(Reunion)
        .filter(Reunion.proyecto_id == proyecto_id)
        .order_by(Reunion.fecha)
        .all()
    )


@router.get("/cliente/{cliente_id}", response_model=list[ReunionResponse])
def listar_reuniones_cliente(
    cliente_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    """Devuelve todas las reuniones agrupadas de los proyectos del cliente."""
    proyectos_ids = [
        p.id for p in db.query(Proyecto).filter(Proyecto.cliente_id == cliente_id).all()
    ]
    if not proyectos_ids:
        return []
    return (
        db.query(Reunion)
        .filter(Reunion.proyecto_id.in_(proyectos_ids))
        .order_by(Reunion.fecha)
        .all()
    )


@router.get("/mias", response_model=list[ReunionResponse])
def listar_mis_reuniones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Reuniones de todos los proyectos donde el usuario actual es cliente."""
    proyectos_ids = [
        p.id for p in db.query(Proyecto).filter(Proyecto.cliente_id == current_user.id).all()
    ]
    if not proyectos_ids:
        return []
    return (
        db.query(Reunion)
        .filter(Reunion.proyecto_id.in_(proyectos_ids))
        .order_by(Reunion.fecha)
        .all()
    )


@router.patch("/{reunion_id}", response_model=ReunionResponse)
def actualizar_reunion(
    reunion_id: UUID,
    data: ReunionUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    reunion = db.query(Reunion).filter(Reunion.id == reunion_id).first()
    if not reunion:
        raise HTTPException(status_code=404, detail="Reunión no encontrada")

    if data.estado and data.estado not in ESTADOS_REUNION:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Usa: {sorted(ESTADOS_REUNION)}")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(reunion, field, value)

    db.commit()
    db.refresh(reunion)
    return reunion


@router.delete("/{reunion_id}", status_code=204)
def eliminar_reunion(
    reunion_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    reunion = db.query(Reunion).filter(Reunion.id == reunion_id).first()
    if not reunion:
        raise HTTPException(status_code=404, detail="Reunión no encontrada")

    db.delete(reunion)
    db.commit()
