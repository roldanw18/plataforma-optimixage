from uuid import UUID
from datetime import datetime
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

    model_config = ConfigDict(from_attributes=True)
