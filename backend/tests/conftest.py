import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def test_user(client):

    email = f"test_{uuid.uuid4()}@test.com"
    password = "123456"

    response = client.post(
        "/auth/register",
        json={
            "nombre": "Test User",
            "email": email,
            "password": password
        }
    )

    assert response.status_code == 200

    return {
        "email": email,
        "password": password
    }