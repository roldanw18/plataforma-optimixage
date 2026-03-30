import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app as fastapi_app
from app.core.database import Base, get_db

# 🔴 IMPORTAR MODELOS (ESTO ES CLAVE PARA CI)
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.models.proyecto import Proyecto

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

@pytest.fixture(scope="function")
def db():

    # 🔴 ASEGURAR QUE TABLAS EXISTAN
    Base.metadata.create_all(bind=engine)

    connection = engine.connect()
    transaction = connection.begin()

    session = TestingSessionLocal(bind=connection)

    # 🔴 INSERTAR ROLES SI NO EXISTEN
    if session.query(Rol).count() == 0:
        session.add_all([
            Rol(nombre="Admin"),
            Rol(nombre="Cliente")
        ])
        session.commit()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):

    def override_get_db():
        yield db

    fastapi_app.dependency_overrides[get_db] = override_get_db

    yield TestClient(fastapi_app)

    fastapi_app.dependency_overrides.clear()


@pytest.fixture
def auth_token(client):

    email = f"test_{uuid.uuid4()}@test.com"
    password = "123456"

    client.post(
        "/auth/register",
        json={
            "nombre": "Test User",
            "email": email,
            "password": password
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password
        }
    )

    return response.json()["access_token"]


@pytest.fixture
def admin_token(client):

    email = f"admin_{uuid.uuid4()}@test.com"
    password = "123456"

    client.post(
        "/auth/register",
        json={
            "nombre": "Admin User",
            "email": email,
            "password": password
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password
        }
    )

    return response.json()["access_token"]