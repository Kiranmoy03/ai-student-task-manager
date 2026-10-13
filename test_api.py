"""Mock external Supabase requests; never use live database credentials in tests."""

import httpx
import pytest
from fastapi.testclient import TestClient

from main import app

USER_ID = '11111111-1111-4111-8111-111111111111'
TASK_ID = '22222222-2222-4222-8222-222222222222'
TASK = {
    'id': TASK_ID, 'user_id': USER_ID, 'title': 'Study FastAPI',
    'subject': 'CS', 'due_date': None, 'due_time': None,
    'estimated_minutes': 45, 'priority': 'medium', 'completed': False,
    'created_at': '2026-10-13T12:00:00Z',
}


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv('SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
    requests = []

    def handle(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        if request.url.path == '/auth/v1/user':
            if request.headers.get('Authorization') == 'Bearer valid-token':
                return httpx.Response(200, json={'id': USER_ID, 'email': 'student@example.com'})
            return httpx.Response(401, json={'message': 'invalid'})
        if request.url.path == '/rest/v1/tasks':
            if request.method == 'GET':
                return httpx.Response(200, json=[TASK])
            if request.method == 'POST':
                return httpx.Response(201, json=[TASK])
            if request.method == 'PATCH':
                return httpx.Response(200, json=[TASK])
            if request.method == 'DELETE':
                return httpx.Response(200, json=[TASK])
        return httpx.Response(404)

    original = httpx.AsyncClient

    def mocked_client(*args, **kwargs):
        return original(*args, transport=httpx.MockTransport(handle), **kwargs)

    monkeypatch.setattr(httpx, 'AsyncClient', mocked_client)
    with TestClient(app) as test_client:
        yield test_client, requests


def test_health_without_auth(client):
    app_client, _ = client
    assert app_client.get('/health').json() == {'status': 'ok'}


def test_reject_missing_or_invalid_login(client):
    app_client, _ = client
    assert app_client.get('/api/tasks').status_code == 401
    assert app_client.get('/api/tasks', headers={'Authorization': 'Bearer invalid'}).status_code == 401


def test_owner_scoped_crud(client):
    app_client, requests = client
    headers = {'Authorization': 'Bearer valid-token'}
    assert app_client.get('/api/me', headers=headers).json()['id'] == USER_ID
    assert app_client.get('/api/tasks', headers=headers).json()[0]['title'] == TASK['title']
    assert app_client.post('/api/tasks', headers=headers, json={
        'title': 'Study FastAPI', 'subject': 'CS'}).status_code == 201
    assert app_client.patch(f'/api/tasks/{TASK_ID}', headers=headers,
                            json={'completed': True}).status_code == 200
    assert app_client.delete(f'/api/tasks/{TASK_ID}', headers=headers).status_code == 204
    db_requests = [req for req in requests if req.url.path == '/rest/v1/tasks']
    assert len(db_requests) == 4
    assert all(req.headers['Authorization'] == 'Bearer valid-token' for req in db_requests)
    assert all(req.headers['apikey'] == 'sb_publishable_test' for req in db_requests)
    assert all('user_id=eq.' + USER_ID in str(req.url) for req in (db_requests[0], db_requests[2], db_requests[3]))
    assert '"user_id":"' + USER_ID + '"' in db_requests[1].content.decode()


def test_cannot_supply_own_user_id_or_blank_title(client):
    app_client, _ = client
    headers = {'Authorization': 'Bearer valid-token'}
    assert app_client.post('/api/tasks', headers=headers, json={
        'title': 'X', 'user_id': USER_ID}).status_code == 422
    assert app_client.post('/api/tasks', headers=headers, json={
        'title': '   '}).status_code == 422
    assert app_client.patch(f'/api/tasks/{TASK_ID}', headers=headers, json={}).status_code == 422
    assert app_client.patch('/api/tasks/not-a-uuid', headers=headers, json={'completed': True}).status_code == 422
