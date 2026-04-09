from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ReunionCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    fecha: datetime
    duracion_minutos: Optional[int] = None
    enlace: Optional[str] = None
    proyecto_id: UUID


class ReunionResponse(BaseModel):
    id: UUID
    titulo: str
    descripcion: Optional[str]
    fecha: datetime
    duracion_minutos: Optional[int]
    enlace: Optional[str]
    proyecto_id: UUID
    creado_por: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
