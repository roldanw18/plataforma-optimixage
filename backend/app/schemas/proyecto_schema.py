from pydantic import BaseModel, ConfigDict


class ProyectoCreate(BaseModel):
    nombre: str


class ProyectoResponse(BaseModel):
    id: str
    nombre: str

    model_config = ConfigDict(from_attributes=True)