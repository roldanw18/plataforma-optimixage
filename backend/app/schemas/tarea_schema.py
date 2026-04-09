from uuid import UUID
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TareaCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    proyecto_id: UUID
    hito_id: Optional[UUID] = None
    asignado_a: Optional[UUID] = None
    prioridad: Optional[str] = "media"
    fecha_limite: Optional[date] = None


class TareaUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    prioridad: Optional[str] = None
    hito_id: Optional[UUID] = None
    asignado_a: Optional[UUID] = None
    fecha_limite: Optional[date] = None


class TareaResponse(BaseModel):
    id: UUID
    titulo: str
    descripcion: Optional[str]
    estado: str
    prioridad: str
    proyecto_id: UUID
    hito_id: Optional[UUID]
    asignado_a: Optional[UUID]
    creado_por: Optional[UUID]
    fecha_limite: Optional[date]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
