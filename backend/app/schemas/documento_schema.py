from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DocumentoCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    url: str
    estado: Optional[str] = "borrador"
    proyecto_id: UUID


class DocumentoResponse(BaseModel):
    id: UUID
    titulo: str
    descripcion: Optional[str]
    url: str
    estado: str
    fecha_creacion: datetime
    proyecto_id: UUID
    autor_id: UUID

    model_config = ConfigDict(from_attributes=True)
