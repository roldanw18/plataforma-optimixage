import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    url = Column(String, nullable=False)
    estado = Column(String, nullable=False, default="borrador")  # borrador | publicado
    fecha_creacion = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"), nullable=False)
    autor_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
