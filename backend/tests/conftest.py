import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_token(client):

    email = f"test_{uuid.uuid4()}@test.com"
    password = "123456"

    # register
    client.post(
        "/auth/register",
        json={
            "nombre": "Test User",
            "email": email,
            "password": password
        }
    )

    # login
    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password
        }
    )

    token = response.json()["access_token"]

    return token


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

    # login
    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password
        }
    )

    token = response.json()["access_token"]

    return token