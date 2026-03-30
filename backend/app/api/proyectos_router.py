from fastapi import HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.proyecto_schema import ProyectoCreate
from app.models.proyecto import Proyecto

router = APIRouter(tags=["Proyectos"])


@router.post("/")
def crear_proyecto(
    data: ProyectoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # TEMPORAL (hasta implementar roles bien)
    # if current_user.rol.nombre != "admin":
    #     raise HTTPException(status_code=403, detail="No autorizado")

    proyecto = Proyecto(
        nombre=data.nombre,
        descripcion=data.descripcion
    )

    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)

    return proyecto


@router.get("/mis-proyectos")
def listar_proyectos(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    proyectos = db.query(Proyecto).all()
    return proyectos