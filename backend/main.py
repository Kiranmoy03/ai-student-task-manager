"""FastAPI task API. Supabase Auth + user-scoped PostgREST (no admin key)."""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from datetime import date, datetime, time
from pathlib import Path
from typing import Annotated, Literal
from uuid import UUID

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field, field_validator

load_dotenv(Path(__file__).with_name('.env'))
logger = logging.getLogger(__name__)

app = FastAPI(title='AI Student Task Manager API', version='0.1.0')
origins = [origin.strip() for origin in os.getenv(
    'CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173'
).split(',') if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False,
                   allow_methods=['GET', 'POST', 'PATCH', 'DELETE'],
                   allow_headers=['Authorization', 'Content-Type'])
bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class Settings:
    url: str
    publishable_key: str


def get_settings() -> Settings:
    url = os.getenv('SUPABASE_URL', '').rstrip('/')
    key = os.getenv('SUPABASE_PUBLISHABLE_KEY', '')
    if not url.startswith('https://') or not key:
        raise HTTPException(status_code=503, detail='Configure Supabase backend environment variables.')
    return Settings(url, key)


@dataclass(frozen=True)
class CurrentUser:
    id: UUID
    email: str | None
    token: str
    settings: Settings


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> CurrentUser:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail='Sign in first.',
                            headers={'WWW-Authenticate': 'Bearer'})
    token = credentials.credentials
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f'{settings.url}/auth/v1/user', headers={
                'apikey': settings.publishable_key, 'Authorization': f'Bearer {token}'
            })
    except httpx.RequestError as exc:
        logger.warning('Supabase authentication unavailable: %s', type(exc).__name__)
        raise HTTPException(status_code=502, detail='Authentication service unavailable.') from exc
    if response.status_code in (401, 403):
        raise HTTPException(status_code=401, detail='Invalid or expired login.',
                            headers={'WWW-Authenticate': 'Bearer'})
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail='Authentication service unavailable.')
    try:
        data = response.json()
        user_id = UUID(data['id'])
    except (ValueError, TypeError, KeyError) as exc:
        raise HTTPException(status_code=502, detail='Invalid authentication service response.') from exc
    return CurrentUser(user_id, data.get('email'), token, settings)


class TaskCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    title: str = Field(min_length=1, max_length=160)
    subject: str = Field(default='General', min_length=1, max_length=80)
    due_date: date | None = None
    due_time: time | None = None
    estimated_minutes: int = Field(default=45, ge=1, le=1440)
    priority: Literal['low', 'medium', 'high'] = 'medium'
    completed: bool = False

    @field_validator('title', 'subject')
    @classmethod
    def reject_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError('Cannot be blank')
        return value


class TaskUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    title: str | None = Field(default=None, min_length=1, max_length=160)
    subject: str | None = Field(default=None, min_length=1, max_length=80)
    due_date: date | None = None
    due_time: time | None = None
    estimated_minutes: int | None = Field(default=None, ge=1, le=1440)
    priority: Literal['low', 'medium', 'high'] | None = None
    completed: bool | None = None

    @field_validator('title', 'subject')
    @classmethod
    def reject_blank(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            if not value:
                raise ValueError('Cannot be blank')
        return value


class Task(TaskCreate):
    id: UUID
    user_id: UUID
    created_at: datetime


async def task_query(user: CurrentUser, method: str,
                     params: dict[str, str] | None = None,
                     payload: dict | None = None) -> list[dict]:
    """Send the user's JWT to PostgREST; RLS stays in effect."""
    headers = {'apikey': user.settings.publishable_key,
               'Authorization': f'Bearer {user.token}',
               'Prefer': 'return=representation'}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.request(method, f'{user.settings.url}/rest/v1/tasks',
                                            params=params, json=payload, headers=headers)
    except httpx.RequestError as exc:
        logger.warning('Task storage unavailable: %s', type(exc).__name__)
        raise HTTPException(status_code=502, detail='Task storage unavailable.') from exc
    if response.status_code in (401, 403):
        raise HTTPException(status_code=403, detail='Task access denied; check RLS policies.')
    if not response.is_success:
        logger.warning('Task storage returned HTTP %s', response.status_code)
        raise HTTPException(status_code=502, detail='Task storage error; check table schema and RLS.')
    try:
        result = response.json()
        if not isinstance(result, list):
            raise ValueError('Expected list')
        return result
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=502, detail='Unexpected task storage response.') from exc


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.get('/api/me')
async def me(user: Annotated[CurrentUser, Depends(get_current_user)]) -> dict[str, str | None]:
    return {'id': str(user.id), 'email': user.email}


@app.get('/api/tasks', response_model=list[Task])
async def list_tasks(user: Annotated[CurrentUser, Depends(get_current_user)]):
    return await task_query(user, 'GET', {'select': '*', 'user_id': f'eq.{user.id}',
                                          'order': 'created_at.desc'})


@app.post('/api/tasks', response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate, user: Annotated[CurrentUser, Depends(get_current_user)]):
    payload = task.model_dump(mode='json')
    payload['user_id'] = str(user.id)  # Never accept ownership from the browser
    rows = await task_query(user, 'POST', payload=payload)
    if not rows:
        raise HTTPException(status_code=502, detail='Task was not returned by storage.')
    return rows[0]


@app.patch('/api/tasks/{task_id}', response_model=Task)
async def update_task(task_id: UUID, task: TaskUpdate,
                      user: Annotated[CurrentUser, Depends(get_current_user)]):
    fields = task.model_dump(mode='json', exclude_unset=True)
    if not fields:
        raise HTTPException(status_code=422, detail='Provide at least one field to update.')
    rows = await task_query(user, 'PATCH', {'id': f'eq.{task_id}',
                                            'user_id': f'eq.{user.id}'}, fields)
    if not rows:
        raise HTTPException(status_code=404, detail='Task not found.')
    return rows[0]


@app.delete('/api/tasks/{task_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: UUID, user: Annotated[CurrentUser, Depends(get_current_user)]):
    rows = await task_query(user, 'DELETE', {'id': f'eq.{task_id}',
                                             'user_id': f'eq.{user.id}'})
    if not rows:
        raise HTTPException(status_code=404, detail='Task not found.')
