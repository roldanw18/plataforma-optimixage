"""Tests del módulo Proceso (Sprint 2 Core)"""


def test_obtener_proceso_inicial(client, admin_token, proyecto_id):
    """El proceso de un proyecto nuevo empieza en primer_contacto con 20% de avance."""
    response = client.get(
        f"/proceso/{proyecto_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["etapa_actual"] == "primer_contacto"
    assert data["progreso"] == 20
    assert len(data["etapas"]) == 5
    assert data["etapas"][0]["estado"] == "activo"
    assert data["etapas"][1]["estado"] == "pendiente"


def test_cambiar_etapa_admin(client, admin_token, proyecto_id):
    """El admin puede avanzar la etapa del proyecto."""
    response = client.post(
        f"/proceso/{proyecto_id}/cambiar-etapa",
        json={"etapa": "diagnostico", "notas": "Iniciando diagnóstico"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["etapa_actual"] == "diagnostico"
    assert data["progreso"] == 40
    assert data["etapas"][0]["estado"] == "completado"
    assert data["etapas"][1]["estado"] == "activo"


def test_cambiar_etapa_registra_historial(client, admin_token, proyecto_id):
    """Cada cambio de etapa queda registrado en el historial."""
    client.post(
        f"/proceso/{proyecto_id}/cambiar-etapa",
        json={"etapa": "capacitacion"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    response = client.get(
        f"/proceso/{proyecto_id}/historial",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    historial = response.json()
    assert isinstance(historial, list)
    assert len(historial) >= 1
    assert any(h["etapa"] == "capacitacion" for h in historial)


def test_cambiar_etapa_cliente_prohibido(client, auth_token, proyecto_id):
    """Un cliente no puede cambiar la etapa de un proyecto."""
    response = client.post(
        f"/proceso/{proyecto_id}/cambiar-etapa",
        json={"etapa": "desarrollo"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 403


def test_etapa_invalida(client, admin_token, proyecto_id):
    """Una etapa con valor inválido debe retornar 422."""
    response = client.post(
        f"/proceso/{proyecto_id}/cambiar-etapa",
        json={"etapa": "fase_inexistente"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 422


def test_progreso_completo_en_entrega(client, admin_token, proyecto_id):
    """Al llegar a 'entrega' el progreso debe ser 100%."""
    client.post(
        f"/proceso/{proyecto_id}/cambiar-etapa",
        json={"etapa": "entrega"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    response = client.get(
        f"/proceso/{proyecto_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["progreso"] == 100


def test_cliente_no_ve_proyecto_ajeno(client, auth_token):
    """Un cliente no puede ver el proceso de un proyecto que no le pertenece."""
    import uuid
    fake_id = str(uuid.uuid4())
    response = client.get(
        f"/proceso/{fake_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code in (403, 404)
