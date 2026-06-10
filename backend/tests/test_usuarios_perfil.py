"""Tests para los endpoints de perfil y contraseña (Sprint 3)."""
import uuid


def test_get_mi_perfil(client, auth_token):
    """GET /usuarios/me devuelve datos del usuario autenticado."""
    r = client.get("/usuarios/me", headers={"Authorization": f"Bearer {auth_token}"})
    assert r.status_code == 200
    data = r.json()
    assert "id" in data
    assert "nombre" in data
    assert "email" in data
    assert "rol" in data


def test_get_perfil_sin_token(client):
    """GET /usuarios/me sin token devuelve 401."""
    r = client.get("/usuarios/me")
    assert r.status_code == 401


def test_actualizar_nombre(client, auth_token):
    """PATCH /usuarios/me actualiza el nombre correctamente."""
    nuevo_nombre = f"Nombre Actualizado {uuid.uuid4().hex[:6]}"
    r = client.patch(
        "/usuarios/me",
        json={"nombre": nuevo_nombre},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert r.status_code == 200
    assert r.json()["nombre"] == nuevo_nombre


def test_actualizar_telefono(client, auth_token):
    """PATCH /usuarios/me actualiza el teléfono."""
    r = client.patch(
        "/usuarios/me",
        json={"telefono": "+57 300 111 2233"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert r.status_code == 200
    assert r.json()["telefono"] == "+57 300 111 2233"


def test_actualizar_avatar_url(client, auth_token):
    """PATCH /usuarios/me actualiza avatar_url."""
    r = client.patch(
        "/usuarios/me",
        json={"avatar_url": "https://example.com/avatar.png"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert r.status_code == 200
    assert r.json()["avatar_url"] == "https://example.com/avatar.png"


def test_patch_perfil_sin_token(client):
    """PATCH /usuarios/me sin token devuelve 401."""
    r = client.patch("/usuarios/me", json={"nombre": "Intruso"})
    assert r.status_code == 401


def test_cambiar_password_correcto(client, admin_token):
    """PATCH /usuarios/me/password con contraseña actual correcta cambia la contraseña."""
    # Crear un usuario nuevo para no afectar otros tests
    email = f"pwdtest_{uuid.uuid4().hex[:8]}@test.com"
    client.post(
        "/auth/register",
        json={"nombre": "PwdUser", "email": email, "password": "password_vieja"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    login = client.post("/auth/login", data={"username": email, "password": "password_vieja"})
    token = login.json()["access_token"]

    r = client.patch(
        "/usuarios/me/password",
        json={"password_actual": "password_vieja", "password_nuevo": "password_nueva"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["message"] == "Contraseña actualizada correctamente"

    # Verificar que la nueva contraseña funciona
    login2 = client.post("/auth/login", data={"username": email, "password": "password_nueva"})
    assert login2.status_code == 200


def test_cambiar_password_actual_incorrecta(client, auth_token):
    """PATCH /usuarios/me/password con contraseña actual errónea devuelve 400."""
    r = client.patch(
        "/usuarios/me/password",
        json={"password_actual": "CONTRASEÑA_INCORRECTA", "password_nuevo": "nueva123"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert r.status_code == 400
    assert "incorrecta" in r.json()["detail"].lower()


def test_cambiar_password_nueva_muy_corta(client, auth_token):
    """PATCH /usuarios/me/password con nueva contraseña < 6 chars devuelve 400."""
    r = client.patch(
        "/usuarios/me/password",
        json={"password_actual": "123456", "password_nuevo": "abc"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert r.status_code == 400


def test_listar_usuarios_solo_admin(client, admin_token, auth_token):
    """GET /usuarios/ solo accesible para Admin."""
    r_admin = client.get("/usuarios/", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_admin.status_code == 200
    assert isinstance(r_admin.json(), list)

    r_cliente = client.get("/usuarios/", headers={"Authorization": f"Bearer {auth_token}"})
    assert r_cliente.status_code == 403
