from uuid import UUID
from fastapi import HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.schemas.proyecto_schema import ProyectoCreate, ProyectoResponse, AsignarClienteRequest
from app.models.proyecto import Proyecto
from app.models.usuario import Usuario

router = APIRouter(tags=["Proyectos"])


@router.post("/", response_model=ProyectoResponse)
def crear_proyecto(
    data: ProyectoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    proyecto = Proyecto(nombre=data.nombre)
    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)
    return proyecto


@router.get("/mis-proyectos", response_model=list[ProyectoResponse])
def listar_proyectos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol.nombre == "Admin":
        return db.query(Proyecto).all()
    return db.query(Proyecto).filter(Proyecto.cliente_id == current_user.id).all()


@router.get("/{proyecto_id}", response_model=ProyectoResponse)
def obtener_proyecto(
    proyecto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto


@router.put("/{proyecto_id}/asignar-cliente", response_model=ProyectoResponse)
def asignar_cliente(
    proyecto_id: UUID,
    data: AsignarClienteRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    cliente = db.query(Usuario).filter(Usuario.id == data.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    proyecto.cliente_id = data.cliente_id
    db.commit()
    db.refresh(proyecto)
    return proyecto