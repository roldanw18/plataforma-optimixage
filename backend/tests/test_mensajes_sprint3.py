"""Tests para los endpoints de mensajes nuevos en Sprint 3."""


def test_mensaje_incluye_remitente_nombre(client, auth_token, proyecto_id):
    """El response de enviar mensaje incluye remitente_nombre y remitente_rol."""
    r = client.post(
        "/mensajes/",
        json={"contenido": "Mensaje con nombre", "proyecto_id": proyecto_id},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "remitente_nombre" in data
    assert "remitente_rol" in data
    assert data["remitente_nombre"] is not None


def test_mensaje_admin_tiene_rol_admin(client, admin_token, proyecto_id):
    """Un mensaje enviado por el admin tiene remitente_rol == 'Admin'."""
    r = client.post(
        "/mensajes/",
        json={"contenido": "Respuesta del admin", "proyecto_id": proyecto_id},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.json()["remitente_rol"] == "Admin"


def test_listar_mensajes_incluye_remitente(client, admin_token, auth_token, proyecto_id):
    """GET /mensajes/proyecto/{id} devuelve mensajes con remitente_nombre."""
    client.post(
        "/mensajes/",
        json={"contenido": "Test nombre en lista", "proyecto_id": proyecto_id},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    r = client.get(
        f"/mensajes/proyecto/{proyecto_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    mensajes = r.json()
    assert len(mensajes) >= 1
    for msg in mensajes:
        assert "remitente_nombre" in msg
        assert "remitente_rol" in msg
        assert "leido" in msg


def test_marcar_mensajes_leidos(client, admin_token, auth_token, proyecto_id):
    """PATCH /mensajes/proyecto/{id}/leer marca los mensajes del otro lado como leídos."""
    # Cliente envía un mensaje
    client.post(
        "/mensajes/",
        json={"contenido": "Mensaje para marcar", "proyecto_id": proyecto_id},
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    # Admin marca como leído
    r = client.patch(
        f"/mensajes/proyecto/{proyecto_id}/leer",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "marcados_leidos" in data
    assert data["marcados_leidos"] >= 1

    # Verificar que ahora aparecen como leídos
    lista = client.get(
        f"/mensajes/proyecto/{proyecto_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    mensajes_cliente = [m for m in lista.json() if m["remitente_rol"] != "Admin"]
    for msg in mensajes_cliente:
        assert msg["leido"] is True


def test_marcar_leidos_propios_no_cambia(client, admin_token, proyecto_id):
    """Marcar leídos no afecta los mensajes propios del que llama el endpoint."""
    # Admin envía un mensaje
    client.post(
        "/mensajes/",
        json={"contenido": "Mensaje propio admin", "proyecto_id": proyecto_id},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    # Admin llama a marcar-leídos (sus propios mensajes no deben cambiar)
    r = client.patch(
        f"/mensajes/proyecto/{proyecto_id}/leer",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200


def test_mensaje_sin_autenticacion(client, proyecto_id):
    """Enviar mensaje sin token devuelve 401."""
    r = client.post(
        "/mensajes/",
        json={"contenido": "Sin token", "proyecto_id": proyecto_id},
    )
    assert r.status_code == 401
