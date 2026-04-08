import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Hito(Base):
    __tablename__ = "hitos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"), nullable=False)
    fecha_limite = Column(Date, nullable=True)
    estado = Column(String, nullable=False, default="pendiente")  # pendiente | en_progreso | completado
    orden = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    proyecto = relationship("Proyecto", back_populates="hitos")
    tareas = relationship("Tarea", back_populates="hito")
