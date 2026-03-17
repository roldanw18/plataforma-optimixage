def test_admin_crear_proyecto(client, admin_token):

    response = client.post(
        "/proyectos/",
        json={
            "nombre": "Proyecto Admin"
        },
        headers={
            "Authorization": f"Bearer {admin_token}"
        }
    )

    # aún no existe rol admin real
    assert response.status_code == 403