import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Mensaje(Base):
    __tablename__ = "mensajes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contenido = Column(String, nullable=False)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"), nullable=False)
    remitente_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    fecha_envio = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    leido = Column(Boolean, nullable=False, default=False)
