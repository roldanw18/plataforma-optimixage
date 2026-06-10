from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MensajeCreate(BaseModel):
    contenido: str
    proyecto_id: UUID


class MensajeResponse(BaseModel):
    id: UUID
    contenido: str
    fecha_envio: datetime
    proyecto_id: UUID
    remitente_id: UUID
    leido: bool
    remitente_nombre: Optional[str] = None
    remitente_rol: Optional[str] = None
    remitente_avatar: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
