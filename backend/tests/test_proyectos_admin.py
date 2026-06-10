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

    assert response.status_code == 200