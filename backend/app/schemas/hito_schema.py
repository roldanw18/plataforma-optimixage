from uuid import UUID
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class HitoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    proyecto_id: UUID
    fecha_limite: Optional[date] = None
    orden: Optional[int] = 0


class HitoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_limite: Optional[date] = None
    estado: Optional[str] = None
    orden: Optional[int] = None


class HitoResponse(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str]
    proyecto_id: UUID
    fecha_limite: Optional[date]
    estado: str
    orden: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
