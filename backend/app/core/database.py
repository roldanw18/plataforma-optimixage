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
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.models.proyecto import Proyecto  # noqa: F401
from app.models.documento import Documento  # noqa: F401
from app.models.mensaje import Mensaje  # noqa: F401