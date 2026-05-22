import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    tipo = Column(String, nullable=False)
    titulo = Column(String, nullable=False)
    contenido = Column(String, nullable=True)
    leida = Column(Boolean, nullable=False, default=False)
    referencia_id = Column(UUID(as_uuid=True), nullable=True)
    referencia_tipo = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # i18n: cuando estos campos están presentes el frontend traduce usando la
    # clave + interpola los `params`. Para notificaciones libres del admin
    # (broadcasts), se dejan en NULL y se usa `titulo`/`contenido` tal cual.
    titulo_key = Column(String, nullable=True)
    contenido_key = Column(String, nullable=True)
    params = Column(JSONB, nullable=True)

    usuario = relationship("Usuario", lazy="joined", foreign_keys=[usuario_id])
