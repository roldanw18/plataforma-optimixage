def test_crear_proyecto(client, auth_token):

    response = client.post(
        "/proyectos/",
        json={
            "nombre": "Proyecto Test"
        },
        headers={
            "Authorization": f"Bearer {auth_token}"
        }
    )

    # Como el usuario no es admin, esperamos 403
    assert response.status_code == 403



    
def test_cliente_no_puede_crear_proyecto(client, auth_token):

    response = client.post(
        "/proyectos/",
        json={
            "nombre": "Proyecto Test"
        },
        headers={
            "Authorization": f"Bearer {auth_token}"
        }
    )

    assert response.status_code == 403
    
def test_listar_proyectos(client, auth_token):

    response = client.get(
        "/proyectos/mis-proyectos",
        headers={
            "Authorization": f"Bearer {auth_token}"
        }
    )

    assert response.status_code == 200