def test_admin_crea_documento(client, admin_token, proyecto_id):
    response = client.post(
        "/documentos/",
        json={
            "titulo": "Doc de prueba",
            "descripcion": "Descripción de prueba",
            "url": "https://example.com/doc.pdf",
            "estado": "borrador",
            "proyecto_id": proyecto_id
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["titulo"] == "Doc de prueba"
    assert data["estado"] == "borrador"
    assert data["proyecto_id"] == proyecto_id


def test_cliente_no_puede_crear_documento(client, auth_token, proyecto_id):
    response = client.post(
        "/documentos/",
        json={
            "titulo": "Intento cliente",
            "url": "https://example.com/doc.pdf",
            "estado": "borrador",
            "proyecto_id": proyecto_id
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 403


def test_listar_documentos_proyecto(client, admin_token, auth_token, proyecto_id):
    # El admin crea un documento
    client.post(
        "/documentos/",
        json={
            "titulo": "Doc visible",
            "url": "https://example.com/visible.pdf",
            "estado": "publicado",
            "proyecto_id": proyecto_id
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # El cliente puede listar los documentos
    response = client.get(
        f"/documentos/proyecto/{proyecto_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1
