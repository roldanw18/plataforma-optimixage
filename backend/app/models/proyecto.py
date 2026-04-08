import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Proyecto(Base):
    __tablename__ = "proyectos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    estado = Column(String, nullable=False, default="activo")  # activo | en_progreso | completado | pausado | cancelado
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    hitos = relationship("Hito", back_populates="proyecto", cascade="all, delete-orphan")
    tareas = relationship("Tarea", back_populates="proyecto", cascade="all, delete-orphan")
    reuniones = relationship("Reunion", back_populates="proyecto", cascade="all, delete-orphan")