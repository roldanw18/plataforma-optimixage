import uuid


def test_register(client):

    email = f"test_{uuid.uuid4()}@test.com"

    response = client.post(
        "/auth/register",
        json={
            "nombre": "Test User",
            "email": email,
            "password": "123456"
        }
    )

    assert response.status_code == 200
    assert "id" in response.json()


def test_login(client):

    email = f"test_{uuid.uuid4()}@test.com"

    client.post(
        "/auth/register",
        json={
            "nombre": "Test User",
            "email": email,
            "password": "123456"
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": "123456"
        }
    )

    assert response.status_code == 200
    assert "access_token" in response.json()