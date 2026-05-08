from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ContenidoCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    tipo: str  # imagen | video
    url: str
    cliente_id: Optional[UUID] = None


class ContenidoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None


class ContenidoResponse(BaseModel):
    id: UUID
    titulo: str
    descripcion: Optional[str] = None
    tipo: str
    url: str
    creado_por: Optional[UUID] = None
    cliente_id: Optional[UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
