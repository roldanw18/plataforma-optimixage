from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.hito import Hito
from app.models.proyecto import Proyecto
from app.models.usuario import Usuario
from app.schemas.hito_schema import HitoCreate, HitoUpdate, HitoResponse

router = APIRouter(prefix="/hitos", tags=["Hitos"])


@router.post("/", response_model=HitoResponse)
def crear_hito(
    data: HitoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    proyecto = db.query(Proyecto).filter(Proyecto.id == data.proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    hito = Hito(**data.model_dump())
    db.add(hito)
    db.commit()
    db.refresh(hito)
    return hito


@router.get("/proyecto/{proyecto_id}", response_model=list[HitoResponse])
def listar_hitos(
    proyecto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return db.query(Hito).filter(Hito.proyecto_id == proyecto_id).order_by(Hito.orden).all()


@router.patch("/{hito_id}", response_model=HitoResponse)
def actualizar_hito(
    hito_id: UUID,
    data: HitoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    hito = db.query(Hito).filter(Hito.id == hito_id).first()
    if not hito:
        raise HTTPException(status_code=404, detail="Hito no encontrado")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(hito, field, value)

    db.commit()
    db.refresh(hito)
    return hito


@router.delete("/{hito_id}", status_code=204)
def eliminar_hito(
    hito_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    hito = db.query(Hito).filter(Hito.id == hito_id).first()
    if not hito:
        raise HTTPException(status_code=404, detail="Hito no encontrado")

    db.delete(hito)
    db.commit()
