from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


ESTADOS_REUNION = {"pendiente", "confirmada", "cancelada", "completada"}


class ReunionCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    fecha: datetime
    duracion_minutos: Optional[int] = None
    enlace: Optional[str] = None
    estado: Optional[str] = "pendiente"
    proyecto_id: UUID


class ReunionUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha: Optional[datetime] = None
    duracion_minutos: Optional[int] = None
    enlace: Optional[str] = None
    estado: Optional[str] = None


class ReunionResponse(BaseModel):
    id: UUID
    titulo: str
    descripcion: Optional[str]
    fecha: datetime
    duracion_minutos: Optional[int]
    enlace: Optional[str]
    estado: str = "pendiente"
    proyecto_id: UUID
    creado_por: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
