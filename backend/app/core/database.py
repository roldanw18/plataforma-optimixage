import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1@localhost:5432/optimixagedb")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# importar modelos para que SQLAlchemy los registre
from app.models.rol import Rol  # noqa: F401
from app.models.usuario import Usuario  # noqa: F401
from app.models.proyecto import Proyecto  # noqa: F401
from app.models.hito import Hito  # noqa: F401
from app.models.tarea import Tarea  # noqa: F401
from app.models.documento import Documento  # noqa: F401
from app.models.mensaje import Mensaje  # noqa: F401
from app.models.reunion import Reunion  # noqa: F401
from app.models.notificacion import Notificacion  # noqa: F401
from app.models.proyecto_miembro import ProyectoMiembro  # noqa: F401