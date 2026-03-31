from fastapi import HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.proyecto_schema import ProyectoCreate, ProyectoResponse
from app.models.proyecto import Proyecto
from app.models.usuario import Usuario

router = APIRouter(tags=["Proyectos"])


@router.post("/", response_model=ProyectoResponse)
def crear_proyecto(
    data: ProyectoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Validar rol
    if current_user.rol.nombre != "Admin":
        raise HTTPException(
            status_code=403,
            detail="No autorizado"
        )

    proyecto = Proyecto(
        nombre=data.nombre,
        cliente_id=current_user.id
    )

    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)

    return proyecto


@router.get("/mis-proyectos", response_model=list[ProyectoResponse])
def listar_proyectos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    proyectos = db.query(Proyecto).all()
    return proyectos