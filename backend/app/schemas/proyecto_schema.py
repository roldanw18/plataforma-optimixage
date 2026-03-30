from pydantic import BaseModel

from typing import Optional

class ProyectoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class ProyectoResponse(BaseModel):
    id: str
    nombre: str

    class Config:
        from_attributes = True