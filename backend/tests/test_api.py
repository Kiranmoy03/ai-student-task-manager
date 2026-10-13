"""End-to-end FastAPI route tests with mocked Supabase Auth/PostgREST.
No live Supabase requests or database writes are made by the test suite.
"""
from __future__ import annotations

import json
from urllib.parse import parse_qs

import httpx
import pytest
from fastapi.testclient import TestClient
from main import app

ORIGINAL_ASYNC_CLIENT = httpx.AsyncClient

USER_A = '11111111-1111-4111-8111-111111111111'
USER_B = '33333333-3333-4333-8333-333333333333'
TASK_A = '22222222-2222-4222-8222-222222222222'
TASK_B = '44444444-4444-4444-8444-444444444444'
TASK_ROW = {
    'id': TASK_A, 'user_id': USER_A, 'title': 'Study FastAPI',
    'subject': 'CS', 'due': '2026-10-14', 'priority': 'High',
    'completed': False, 'created_at': '2026-10-13T12:00:00Z',
}


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv('SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
    calls: list[httpx.Request] = []
    records = {TASK_A: dict(TASK_ROW)}
    tokens = {'token-a': USER_A, 'token-b': USER_B}

    def handle(req: httpx.Request) -> httpx.Response:
        calls.append(req)
        token = req.headers.get('Authorization', '').removeprefix('Bearer ')
        if req.url.path == '/auth/v1/user':
            if token == 'auth-down':
                return httpx.Response(503, json={'error': 'unavailable'})
            if token in tokens:
                return httpx.Response(200, json={
                    'id': tokens[token], 'email': f'{token}@example.com'})
        if req.url.host == 'generativelanguage.googleapis.com':
            key = req.url.params.get('key', '')
            if key == 'gemini-down':
                return httpx.Response(500, json={'error': 'provider failure'})
            if key == 'gemini-rate-limit':
                return httpx.Response(429, json={'error': 'rate limit'})
            if key == 'gemini-invalid-json':
                return httpx.Response(200, json={
                    'candidates': [{'content': {'parts': [{'text': 'not valid json'}]}}]
                })
            if key == 'gemini-hallucinated':
                return httpx.Response(200, json={
                    'candidates': [{
                        'content': {
                            'parts': [{
                                'text': json.dumps({
                                    'summary': 'Focus on your critical tasks.',
                                    'tasks': [
                                        {'task_id': '99999999-9999-9999-9999-999999999999', 'duration_minutes': 60, 'explanation': 'Hallucinated task'},
                                        {'task_id': TASK_A, 'duration_minutes': 45, 'explanation': 'High-priority real task'}
                                    ],
                                    'study_tips': ['Use active recall', 'Take small breaks']
                                })
                            }]
                        }
                    }]
                })
            return httpx.Response(200, json={
                'candidates': [{
                    'content': {
                        'parts': [{
                            'text': json.dumps({
                                'summary': 'Start with CS assignment first.',
                                'tasks': [
                                    {'task_id': TASK_A, 'duration_minutes': 50, 'explanation': 'Due soon and high priority.'}
                                ],
                                'study_tips': [
                                    'Work in 25-minute Pomodoro focus blocks.',
                                    'Test active recall after each section.'
                                ]
                            })
                        }]
                    }
                }]
            })

        if req.url.path != '/rest/v1/tasks':
            return httpx.Response(404)
        if token not in tokens:
            return httpx.Response(401)
        user_id = tokens[token]
        query = parse_qs(req.url.query.decode())
        assert req.headers['apikey'] == 'sb_publishable_test'
        assert req.headers['Authorization'] == f'Bearer {token}'
        # Mimic database RLS: the user sees only their rows.
        items = [x for x in records.values() if x['user_id'] == user_id]
        if 'user_id' in query:
            assert query['user_id'] == [f'eq.{user_id}']
        if 'id' in query:
            item_id = query['id'][0].removeprefix('eq.')
            items = [x for x in items if x['id'] == item_id]
        if req.method == 'GET':
            return httpx.Response(200, json=items)
        if req.method == 'POST':
            payload = json.loads(req.content)
            assert set(payload) == {'title', 'subject', 'due', 'priority', 'completed', 'user_id'}
            assert payload['user_id'] == user_id
            created = {**payload, 'id': TASK_B, 'created_at': '2026-10-14T12:00:00Z'}
            records[TASK_B] = created
            return httpx.Response(201, json=[created])
        if req.method == 'PATCH':
            if not items:
                return httpx.Response(200, json=[])
            changes = json.loads(req.content)
            assert 'user_id' not in changes
            updated = {**items[0], **changes}
            records[updated['id']] = updated
            return httpx.Response(200, json=[updated])
        if req.method == 'DELETE':
            for item in items:
                records.pop(item['id'], None)
            return httpx.Response(200, json=items)
        return httpx.Response(405)

    original_client = httpx.AsyncClient
    monkeypatch.setattr(httpx, 'AsyncClient', lambda *args, **kw: original_client(
        *args, **{**kw, 'transport': httpx.MockTransport(handle)}))
    with TestClient(app) as test_client:
        yield test_client, calls, records


def auth(token='token-a'):
    return {'Authorization': f'Bearer {token}'}


def test_health_requires_no_login(client):
    test_client, _, _ = client
    assert test_client.get('/health').json() == {'status': 'ok'}


def test_missing_invalid_and_unavailable_auth_fail_closed(client):
    test_client, _, _ = client
    assert test_client.get('/api/tasks').status_code == 401
    assert test_client.get('/api/tasks', headers=auth('bad')).status_code == 401
    assert test_client.get('/api/tasks', headers=auth('auth-down')).status_code == 502


def test_user_scoped_read_create_update_delete(client):
    test_client, calls, records = client
    assert test_client.get('/api/me', headers=auth()).json()['id'] == USER_A
    initial = test_client.get('/api/tasks', headers=auth())
    assert initial.status_code == 200
    assert initial.json()[0]['due'] == '2026-10-14'
    new = test_client.post('/api/tasks', headers=auth(), json={
        'title': '  Review Linear Algebra  ', 'subject': 'Math',
        'due': '2026-10-15', 'priority': 'Low',
    })
    assert new.status_code == 201
    assert new.json()['title'] == 'Review Linear Algebra'
    assert new.json()['priority'] == 'Low'
    assert records[TASK_B]['user_id'] == USER_A
    updated = test_client.patch(f'/api/tasks/{TASK_A}', headers=auth(), json={'completed': True})
    assert updated.status_code == 200 and updated.json()['completed'] is True
    deleted = test_client.delete(f'/api/tasks/{TASK_A}', headers=auth())
    assert deleted.status_code == 204 and TASK_A not in records
    db_calls = [c for c in calls if c.url.path == '/rest/v1/tasks']
    assert len(db_calls) == 4
    assert all(c.headers['Authorization'] == 'Bearer token-a' for c in db_calls)


def test_two_users_are_isolated(client):
    test_client, _, records = client
    assert test_client.get('/api/tasks', headers=auth('token-b')).json() == []
    assert test_client.patch(f'/api/tasks/{TASK_A}', headers=auth('token-b'),
                             json={'completed': True}).status_code == 404
    assert test_client.delete(f'/api/tasks/{TASK_A}', headers=auth('token-b')).status_code == 404
    assert records[TASK_A]['completed'] is False
    assert test_client.get('/api/tasks', headers=auth('token-a')).json()[0]['id'] == TASK_A


def test_reject_missing_or_unsupported_database_fields(client):
    test_client, _, _ = client
    invalid_creates = [
        {'title': 'X', 'user_id': USER_B},
        {'title': 'X', 'due_date': '2026-10-14'},
        {'title': 'X', 'due_time': '10:30:00'},
        {'title': 'X', 'estimated_minutes': 45},
        {'title': 'X', 'priority': 'high'},
        {'title': '  '},
        {'title': 'X', 'due': 'not-a-date'},
    ]
    for payload in invalid_creates:
        assert test_client.post('/api/tasks', headers=auth(), json=payload).status_code == 422
    assert test_client.patch(f'/api/tasks/{TASK_A}', headers=auth(), json={}).status_code == 422
    assert test_client.patch(f'/api/tasks/{TASK_A}', headers=auth(),
                             json={'title': None}).status_code == 422
    assert test_client.patch(f'/api/tasks/{TASK_A}', headers=auth(),
                             json={'completed': None}).status_code == 422
    assert test_client.patch(f'/api/tasks/{TASK_A}', headers=auth(),
                             json={'priority': 'medium'}).status_code == 422
    assert test_client.patch('/api/tasks/not-a-uuid', headers=auth(),
                             json={'completed': True}).status_code == 422


def test_publishable_key_required(monkeypatch, client):
    test_client, _, _ = client
    monkeypatch.setenv('SUPABASE_PUBLISHABLE_KEY', 'sb_secret_bad')
    assert test_client.get('/api/tasks', headers=auth()).status_code == 503
    monkeypatch.setenv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')


def test_task_owner_of_upstream_response_is_checked(client):
    # Malicious/inconsistent storage responses should not leak through the API.
    test_client, calls, records = client
    # As part of the mock RLS behavior, a forged row belonging to B is invisible to A.
    records[TASK_B] = {**TASK_ROW, 'id': TASK_B, 'user_id': USER_B}
    result = test_client.get('/api/tasks', headers=auth('token-a'))
    assert result.status_code == 200 and [t['id'] for t in result.json()] == [TASK_A]


def test_bad_upstream_owner_is_not_returned(client, monkeypatch):
    test_client, _, _ = client

    def cross_owner(req: httpx.Request) -> httpx.Response:
        if req.url.path == '/auth/v1/user':
            return httpx.Response(200, json={'id': USER_A, 'email': 'user-a@example.com'})
        if req.url.path == '/rest/v1/tasks':
            return httpx.Response(200, json=[{**TASK_ROW, 'user_id': USER_B}])
        return httpx.Response(404)

    monkeypatch.setattr(httpx, 'AsyncClient', lambda *args, **kw: ORIGINAL_ASYNC_CLIENT(
        *args, **{**kw, 'transport': httpx.MockTransport(cross_owner)}))
    response = test_client.get('/api/tasks', headers=auth('token-a'))
    assert response.status_code == 502
    assert 'unexpected task ownership' in response.json()['detail'].lower()


def test_cors_preflight_for_local_react(client):
    test_client, _, _ = client
    response = test_client.options('/api/tasks', headers={
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization',
    })
    assert response.status_code == 200
    assert response.headers['access-control-allow-origin'] == 'http://localhost:3000'


def test_study_plan_requires_auth(client):
    test_client, _, _ = client
    assert test_client.post('/api/ai/study-plan').status_code == 401
    assert test_client.post('/api/ai/study-plan', headers=auth('bad')).status_code == 401


def test_study_plan_empty_tasks(client, monkeypatch):
    test_client, calls, records = client
    # Mark task as completed so user has 0 incomplete tasks
    records[TASK_A]['completed'] = True
    monkeypatch.setenv('GEMINI_API_KEY', 'valid-key')
    response = test_client.post('/api/ai/study-plan', headers=auth('token-a'))
    assert response.status_code == 200
    data = response.json()
    assert data['tasks'] == []
    assert 'all caught up' in data['summary'].lower()
    # Confirm Gemini was NOT called when tasks are empty
    gemini_calls = [c for c in calls if c.url.host == 'generativelanguage.googleapis.com']
    assert len(gemini_calls) == 0


def test_study_plan_missing_gemini_key(client, monkeypatch):
    test_client, _, records = client
    records[TASK_A]['completed'] = False
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    response = test_client.post('/api/ai/study-plan', headers=auth('token-a'))
    assert response.status_code == 503
    assert 'gemini_api_key is missing' in response.json()['detail'].lower()


def test_study_plan_successful(client, monkeypatch):
    test_client, calls, records = client
    records[TASK_A]['completed'] = False
    monkeypatch.setenv('GEMINI_API_KEY', 'valid-key')
    response = test_client.post('/api/ai/study-plan', headers=auth('token-a'))
    assert response.status_code == 200
    data = response.json()
    assert len(data['tasks']) == 1
    assert data['tasks'][0]['task_id'] == TASK_A
    assert data['tasks'][0]['title'] == 'Study FastAPI'
    assert data['tasks'][0]['duration_minutes'] == 50
    assert len(data['study_tips']) >= 2
    # Verify Gemini was invoked
    gemini_calls = [c for c in calls if c.url.host == 'generativelanguage.googleapis.com']
    assert len(gemini_calls) == 1
    assert gemini_calls[0].url.params['key'] == 'valid-key'
    assert gemini_calls[0].url.path == '/v1beta/models/gemini-3.5-flash-lite:generateContent'


def test_study_plan_hallucinated_task_id_filtered(client, monkeypatch):
    test_client, _, records = client
    records[TASK_A]['completed'] = False
    monkeypatch.setenv('GEMINI_API_KEY', 'gemini-hallucinated')
    response = test_client.post('/api/ai/study-plan', headers=auth('token-a'))
    assert response.status_code == 200
    data = response.json()
    # 9999... should not be in the returned tasks; only user's task TASK_A is returned
    returned_ids = [t['task_id'] for t in data['tasks']]
    assert '99999999-9999-9999-9999-999999999999' not in returned_ids
    assert TASK_A in returned_ids


def test_study_plan_gemini_failures_handled(client, monkeypatch):
    test_client, _, records = client
    records[TASK_A]['completed'] = False
    # Provider 500 error
    monkeypatch.setenv('GEMINI_API_KEY', 'gemini-down')
    res = test_client.post('/api/ai/study-plan', headers=auth('token-a'))
    assert res.status_code == 502

    # Rate limit 429
    monkeypatch.setenv('GEMINI_API_KEY', 'gemini-rate-limit')
    res_rl = test_client.post('/api/ai/study-plan', headers=auth('token-a'))
    assert res_rl.status_code == 503
    assert 'rate limit' in res_rl.json()['detail'].lower()

    # Invalid JSON
    monkeypatch.setenv('GEMINI_API_KEY', 'gemini-invalid-json')
    res_inv = test_client.post('/api/ai/study-plan', headers=auth('token-a'))
    assert res_inv.status_code == 502


def test_study_plan_user_isolation(client, monkeypatch):
    test_client, _, records = client
    records[TASK_A]['completed'] = False
    monkeypatch.setenv('GEMINI_API_KEY', 'valid-key')
    # User B has no tasks
    response = test_client.post('/api/ai/study-plan', headers=auth('token-b'))
    assert response.status_code == 200
    assert response.json()['tasks'] == []
