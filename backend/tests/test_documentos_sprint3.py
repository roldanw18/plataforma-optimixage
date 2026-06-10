"""Tests para los endpoints de documentos nuevos en Sprint 3."""
import io


def test_upload_documento(client, admin_token, proyecto_id):
    """POST /documentos/upload sube un archivo y devuelve el documento creado."""
    archivo = io.BytesIO(b"%PDF-1.4 test content")
    r = client.post(
        "/documentos/upload",
        data={
            "proyecto_id": proyecto_id,
            "titulo": "Contrato de prueba",
            "descripcion": "Descripción test",
            "tipo": "contrato",
            "estado": "borrador",
        },
        files={"archivo": ("contrato.pdf", archivo, "application/pdf")},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["titulo"] == "Contrato de prueba"
    assert data["tipo"] == "contrato"
    assert data["estado"] == "borrador"
    assert "/documentos/download/" in data["url"]


def test_upload_extension_no_permitida(client, admin_token, proyecto_id):
    """Upload de extensión no permitida devuelve 400."""
    r = client.post(
        "/documentos/upload",
        data={"proyecto_id": proyecto_id, "titulo": "Malicioso"},
        files={"archivo": ("script.sh", io.BytesIO(b"#!/bin/bash"), "text/plain")},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 400


def test_upload_cliente_no_permitido(client, auth_token, proyecto_id):
    """Un cliente no puede subir documentos."""
    r = client.post(
        "/documentos/upload",
        data={"proyecto_id": proyecto_id, "titulo": "Intento"},
        files={"archivo": ("doc.pdf", io.BytesIO(b"content"), "application/pdf")},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert r.status_code == 403


def test_eliminar_documento(client, admin_token, proyecto_id):
    """DELETE /documentos/{id} elimina el documento correctamente."""
    # Crear documento primero
    create = client.post(
        "/documentos/",
        json={
            "titulo": "Para eliminar",
            "url": "https://example.com/borrar.pdf",
            "estado": "borrador",
            "proyecto_id": proyecto_id,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert create.status_code == 200
    doc_id = create.json()["id"]

    # Eliminar
    r = client.delete(
        f"/documentos/{doc_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert "eliminado" in r.json()["message"].lower()

    # Verificar que ya no está en la lista
    lista = client.get(
        f"/documentos/proyecto/{proyecto_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    ids = [d["id"] for d in lista.json()]
    assert doc_id not in ids


def test_eliminar_documento_cliente_prohibido(client, auth_token, admin_token, proyecto_id):
    """Un cliente no puede eliminar documentos."""
    create = client.post(
        "/documentos/",
        json={
            "titulo": "No borrable por cliente",
            "url": "https://example.com/nodel.pdf",
            "estado": "borrador",
            "proyecto_id": proyecto_id,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    doc_id = create.json()["id"]

    r = client.delete(
        f"/documentos/{doc_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert r.status_code == 403


def test_eliminar_documento_inexistente(client, admin_token):
    """DELETE de un doc que no existe devuelve 404."""
    import uuid
    r = client.delete(
        f"/documentos/{uuid.uuid4()}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 404
