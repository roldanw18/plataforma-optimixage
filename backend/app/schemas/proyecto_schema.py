from uuid import UUID
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ProyectoCreate(BaseModel):
    nombre: str


class AsignarClienteRequest(BaseModel):
    cliente_id: UUID


class ProyectoResponse(BaseModel):
    id: UUID
    nombre: str
    cliente_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)