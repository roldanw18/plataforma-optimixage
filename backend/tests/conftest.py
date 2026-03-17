import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import Base, get_db


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

    Base.metadata.create_all(bind=engine)

    connection = engine.connect()
    transaction = connection.begin()

    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    yield TestClient(app)

    app.dependency_overrides.clear()


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

    assert response.status_code == 200

    return response.json()["access_token"]


# 👇 Fixture para usuario admin
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