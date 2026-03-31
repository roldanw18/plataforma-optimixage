def test_enviar_mensaje(client, auth_token, proyecto_id):
    response = client.post(
        "/mensajes/",
        json={
            "contenido": "Hola, ¿cómo va el proyecto?",
            "proyecto_id": proyecto_id
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["contenido"] == "Hola, ¿cómo va el proyecto?"
    assert data["proyecto_id"] == proyecto_id


def test_admin_puede_enviar_mensaje(client, admin_token, proyecto_id):
    response = client.post(
        "/mensajes/",
        json={
            "contenido": "Avance del 50% completado.",
            "proyecto_id": proyecto_id
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200


def test_listar_mensajes_proyecto(client, auth_token, admin_token, proyecto_id):
    # Enviar dos mensajes
    client.post("/mensajes/", json={"contenido": "Msg 1", "proyecto_id": proyecto_id},
                headers={"Authorization": f"Bearer {auth_token}"})
    client.post("/mensajes/", json={"contenido": "Msg 2", "proyecto_id": proyecto_id},
                headers={"Authorization": f"Bearer {admin_token}"})

    response = client.get(
        f"/mensajes/proyecto/{proyecto_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    mensajes = response.json()
    assert isinstance(mensajes, list)
    assert len(mensajes) >= 2
