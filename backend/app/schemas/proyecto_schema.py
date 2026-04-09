from uuid import UUID
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ProyectoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None


class ProyectoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None


class AsignarClienteRequest(BaseModel):
    cliente_id: UUID


class ProyectoResponse(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str] = None
    estado: str = "activo"
    etapa_actual: str = "primer_contacto"
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    cliente_id: Optional[UUID] = None
    created_by: Optional[UUID] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)