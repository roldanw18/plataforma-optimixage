from uuid import UUID
from datetime import datetime
from typing import Any, Optional, List, Literal
from pydantic import BaseModel, ConfigDict, Field


class UsuarioInfo(BaseModel):
    id: UUID
    nombre: str
    email: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


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
    titulo_key: Optional[str] = None
    contenido_key: Optional[str] = None
    params: Optional[dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class NotificacionAdminResponse(NotificacionResponse):
    usuario: Optional[UsuarioInfo] = None


class NotificacionBroadcast(BaseModel):
    """Payload para que un admin envíe una notificación a uno, varios o todos los usuarios."""
    titulo: str = Field(min_length=1, max_length=200)
    contenido: Optional[str] = Field(default=None, max_length=2000)
    tipo: str = Field(default="anuncio", max_length=50)
    # Si usuario_ids es None o vacío, se envía a todos los usuarios activos.
    usuario_ids: Optional[List[UUID]] = None


class NotificacionCountResponse(BaseModel):
    no_leidas: int


class BroadcastResultado(BaseModel):
    enviadas: int
    destino: Literal["seleccionados", "todos"]
