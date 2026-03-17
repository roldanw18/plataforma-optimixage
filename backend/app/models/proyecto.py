from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.database import Base


class Proyecto(Base):
    __tablename__ = "proyectos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)

    cliente_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))