import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.security import hash_password
from app.models.rol import Rol
from app.models.usuario import Usuario

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

ADMIN_EMAIL = "admin_test@test.com"
ADMIN_PASSWORD = "admin1234"


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        # Seed roles
        for nombre in ["Admin", "Cliente"]:
            if not db.query(Rol).filter_by(nombre=nombre).first():
                db.add(Rol(nombre=nombre))
        db.commit()

        # Crear admin inicial directamente en BD (sin pasar por la API)
        admin_rol = db.query(Rol).filter_by(nombre="Admin").first()
        if not db.query(Usuario).filter_by(email=ADMIN_EMAIL).first():
            db.add(Usuario(
                nombre="Admin Test",
                email=ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
                rol_id=admin_rol.id,
            ))
            db.commit()
    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def admin_token(client):
    response = client.post(
        "/auth/login",
        data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert response.status_code == 200, f"Login admin falló: {response.text}"
    return response.json()["access_token"]


@pytest.fixture
def auth_token(client, admin_token):
    """Crea un usuario Cliente vía API (usando admin) y devuelve su token."""
    email = f"cliente_{uuid.uuid4()}@test.com"
    reg = client.post(
        "/auth/register",
        json={"nombre": "Cliente Test", "email": email, "password": "123456"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert reg.status_code == 201, f"Registro cliente falló: {reg.text}"

    response = client.post(
        "/auth/login",
        data={"username": email, "password": "123456"},
    )
    return response.json()["access_token"]


@pytest.fixture
def proyecto_id(client, admin_token):
    response = client.post(
        "/proyectos/",
        json={"nombre": "Proyecto Fixture"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200, f"Crear proyecto falló: {response.text}"
    return response.json()["id"]
