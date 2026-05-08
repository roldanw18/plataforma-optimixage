import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Contenido(Base):
    __tablename__ = "contenidos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    tipo = Column(String, nullable=False, default="imagen")  # imagen | video
    url = Column(String, nullable=False)
    creado_por = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)  # NULL = global
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
