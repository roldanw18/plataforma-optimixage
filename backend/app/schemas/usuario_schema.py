from pydantic import BaseModel, EmailStr
from uuid import UUID


class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str


class UsuarioResponse(BaseModel):
    id: UUID
    nombre: str
    email: EmailStr
    rol_id: UUID

    class Config:
        from_attributes = True
