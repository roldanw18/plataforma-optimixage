import uuid


def test_register_requiere_admin(client):
    """Registro sin token debe devolver 401."""
    response = client.post(
        "/auth/register",
        json={"nombre": "Sin Auth", "email": "sinauth@test.com", "password": "123456"},
    )
    assert response.status_code == 401


def test_register_con_admin(client, admin_token):
    """El admin puede registrar un nuevo cliente."""
    email = f"nuevo_{uuid.uuid4()}@test.com"
    response = client.post(
        "/auth/register",
        json={"nombre": "Nuevo Cliente", "email": email, "password": "123456"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201
    assert "id" in response.json()


def test_register_email_duplicado(client, admin_token):
    """No se puede registrar el mismo email dos veces."""
    email = f"dup_{uuid.uuid4()}@test.com"
    payload = {"nombre": "Dup", "email": email, "password": "123456"}
    headers = {"Authorization": f"Bearer {admin_token}"}
    client.post("/auth/register", json=payload, headers=headers)
    response = client.post("/auth/register", json=payload, headers=headers)
    assert response.status_code == 409


def test_login(client, admin_token):
    """Un usuario registrado puede hacer login."""
    email = f"login_{uuid.uuid4()}@test.com"
    client.post(
        "/auth/register",
        json={"nombre": "Login Test", "email": email, "password": "123456"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    response = client.post("/auth/login", data={"username": email, "password": "123456"})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_credenciales_incorrectas(client):
    """Credenciales incorrectas devuelven 401."""
    response = client.post(
        "/auth/login",
        data={"username": "noexiste@test.com", "password": "wrong"},
    )
    assert response.status_code == 401
