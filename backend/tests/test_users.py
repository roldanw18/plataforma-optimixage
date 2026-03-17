def test_get_profile(client, auth_token):

    response = client.get(
        "/usuarios/me",
        headers={
            "Authorization": f"Bearer {auth_token}"
        }
    )

    assert response.status_code == 200