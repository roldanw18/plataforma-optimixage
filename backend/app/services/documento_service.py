from uuid import UUID
from sqlalchemy.orm import Session
from app.models.documento import Documento


def crear_documento(db: Session, titulo: str, descripcion: str, url: str,
                    estado: str, proyecto_id: UUID, autor_id: UUID) -> Documento:
    documento = Documento(
        titulo=titulo,
        descripcion=descripcion,
        url=url,
        estado=estado,
        proyecto_id=proyecto_id,
        autor_id=autor_id,
    )
    db.add(documento)
    db.commit()
    db.refresh(documento)
    return documento


def obtener_documentos_proyecto(db: Session, proyecto_id: UUID) -> list[Documento]:
    return db.query(Documento).filter(Documento.proyecto_id == proyecto_id).all()
