import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import Base, get_db
from app.models.rol import Rol

# Base de datos de testing (SQLite en memoria o archivo)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"  # Para tests rápidos en memoria

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Crear tablas antes de correr tests
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)

    # Seed de roles
    db = TestingSessionLocal()

    if not db.query(Rol).filter_by(nombre="Cliente").first():
        db.add(Rol(nombre="Cliente"))

    if not db.query(Rol).filter_by(nombre="Admin").first():
        db.add(Rol(nombre="Admin"))

    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


# Override de la DB para FastAPI
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# Cliente de pruebas
@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


# Token de usuario Cliente
@pytest.fixture
def auth_token(client):
    import uuid
    email = f"cliente_{uuid.uuid4()}@test.com"
    client.post("/auth/register", json={
        "nombre": "Cliente Test",
        "email": email,
        "password": "123456"
    })
    response = client.post("/auth/login", data={
        "username": email,
        "password": "123456"
    })
    return response.json()["access_token"]


# Token de usuario Admin
@pytest.fixture
def admin_token(client):
    import uuid
    from app.models.usuario import Usuario
    email = f"admin_{uuid.uuid4()}@test.com"
    reg = client.post("/auth/register", json={
        "nombre": "Admin Test",
        "email": email,
        "password": "123456"
    })
    user_id = reg.json()["id"]
    db = TestingSessionLocal()
    admin_rol = db.query(Rol).filter_by(nombre="Admin").first()
    user = db.query(Usuario).filter_by(id=uuid.UUID(user_id)).first()
    user.rol_id = admin_rol.id
    db.commit()
    db.close()
    response = client.post("/auth/login", data={
        "username": email,
        "password": "123456"
    })
    return response.json()["access_token"]


# Proyecto creado por admin (devuelve el id como string)
@pytest.fixture
def proyecto_id(client, admin_token):
    response = client.post(
        "/proyectos/",
        json={"nombre": "Proyecto Fixture"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    return response.json()["id"]