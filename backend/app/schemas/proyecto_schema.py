from pydantic import BaseModel


class ProyectoCreate(BaseModel):
    nombre: str


class ProyectoResponse(BaseModel):
    id: str
    nombre: str

    class Config:
        from_attributes = True