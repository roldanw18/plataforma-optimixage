from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificacionResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    tipo: str
    titulo: str
    contenido: Optional[str]
    leida: bool
    referencia_id: Optional[UUID]
    referencia_tipo: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
