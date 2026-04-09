from uuid import UUID
from typing import Optional
from fastapi import HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.schemas.proyecto_schema import ProyectoCreate, ProyectoUpdate, ProyectoResponse, AsignarClienteRequest
from app.models.proyecto import Proyecto
from app.models.usuario import Usuario

router = APIRouter(tags=["Proyectos"])


# ── Schema enriquecido solo para admin ──────────────────────────────────────

class ClienteInfo(BaseModel):
    id: UUID
    nombre: str
    email: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProyectoAdminResponse(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str] = None
    estado: str
    etapa_actual: str
    cliente_id: Optional[UUID] = None
    cliente: Optional[ClienteInfo] = None

    model_config = ConfigDict(from_attributes=True)


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/", response_model=ProyectoResponse)
def crear_proyecto(
    data: ProyectoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    proyecto = Proyecto(**data.model_dump(), created_by=current_user.id)
    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)
    return proyecto


@router.patch("/{proyecto_id}", response_model=ProyectoResponse)
def actualizar_proyecto(
    proyecto_id: UUID,
    data: ProyectoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(proyecto, field, value)

    db.commit()
    db.refresh(proyecto)
    return proyecto


@router.get("/admin/todos", response_model=list[ProyectoAdminResponse])
def listar_proyectos_admin(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    """Devuelve todos los proyectos con información del cliente asociado."""
    proyectos = db.query(Proyecto).all()
    resultado = []
    for p in proyectos:
        cliente_info = None
        if p.cliente_id:
            cliente = db.query(Usuario).filter(Usuario.id == p.cliente_id).first()
            if cliente:
                cliente_info = ClienteInfo(
                    id=cliente.id,
                    nombre=cliente.nombre,
                    email=cliente.email,
                    avatar_url=cliente.avatar_url,
                )
        resultado.append(
            ProyectoAdminResponse(
                id=p.id,
                nombre=p.nombre,
                descripcion=p.descripcion,
                estado=p.estado,
                etapa_actual=p.etapa_actual,
                cliente_id=p.cliente_id,
                cliente=cliente_info,
            )
        )
    return resultado


@router.get("/mis-proyectos", response_model=list[ProyectoResponse])
def listar_mis_proyectos(
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
