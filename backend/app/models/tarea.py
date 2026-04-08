import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Tarea(Base):
    __tablename__ = "tareas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    estado = Column(String, nullable=False, default="pendiente")  # pendiente | en_progreso | completado | cancelado
    prioridad = Column(String, nullable=False, default="media")   # baja | media | alta | urgente
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"), nullable=False)
    hito_id = Column(UUID(as_uuid=True), ForeignKey("hitos.id"), nullable=True)
    asignado_a = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)
    creado_por = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)
    fecha_limite = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    proyecto = relationship("Proyecto", back_populates="tareas")
    hito = relationship("Hito", back_populates="tareas")
