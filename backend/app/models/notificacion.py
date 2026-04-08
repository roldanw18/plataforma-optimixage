import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    tipo = Column(String, nullable=False)  # mensaje_nuevo | documento_subido | tarea_asignada | reunion_programada | proyecto_actualizado | hito_completado
    titulo = Column(String, nullable=False)
    contenido = Column(String, nullable=True)
    leida = Column(Boolean, nullable=False, default=False)
    referencia_id = Column(UUID(as_uuid=True), nullable=True)
    referencia_tipo = Column(String, nullable=True)  # proyecto | tarea | documento | mensaje | reunion | hito
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
