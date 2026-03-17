from sqlalchemy.orm import Session
from app.models.proyecto import Proyecto


def crear_proyecto(db: Session, nombre: str, cliente_id):

    proyecto = Proyecto(
        nombre=nombre,
        cliente_id=cliente_id
    )

    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)

    return proyecto


def obtener_proyectos(db: Session):

    return db.query(Proyecto).all()