# FastAPI task API — existing Supabase schema

This backend securely connects the React app to project `ojrkktrfjbigmgkserfl` without changing database tables or disabling RLS.

## Existing routes

| Route | Meaning |
| --- | --- |
| `GET /health` | Server health (no login) |
| `GET /api/me` | Validate student's Supabase Auth bearer token |
| `GET /api/tasks` | Read signed-in student's tasks |
| `POST /api/tasks` | Create a task belonging to signed-in student |
| `PATCH /api/tasks/{task_id}` | Update student's task |
| `DELETE /api/tasks/{task_id}` | Delete student's task |
| `GET /docs` | Interactive API documentation |

Requires the logged-in user's `Authorization: Bearer <access_token>` on every `/api/` request. `GET /auth/v1/user` checks the token with Supabase Auth; the same token is forwarded to Supabase PostgREST with a **publishable** key so `auth.uid() = user_id` RLS rules apply. Task ownership is never accepted from the request body; it is assigned on the server. Do not use a service-role or secret key.

## Verified table

`public.tasks` has precisely `id`, `user_id`, `title`, `subject`, `due`, `priority`, `completed`, `created_at`.

- `due`: optional ISO date (`YYYY-MM-DD`), not `due_date`.
- `priority`: one of **`High`, `Medium`, `Low`**, never lowercase.
- No `due_time` or `estimated_minutes` storage columns; any request containing them is rejected.
- RLS and CRUD grants already exist. **No SQL migrations should be run.**

## Start on Windows PowerShell (Python 3.11+)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

In the newly created `backend/.env`, set `SUPABASE_PUBLISHABLE_KEY` to the active `sb_publishable_...` key from **Supabase > Project Settings > API Keys**. Leave `SUPABASE_URL=https://ojrkktrfjbigmgkserfl.supabase.co`, and configure `CORS_ORIGINS` with comma-separated exact React frontend origins (`http://localhost:3000` for local Vite, add deployed `https://...` origin before deployment). `backend/.env` must remain untracked.

```powershell
python -m pytest -q
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Visit http://127.0.0.1:8000/health. In a second terminal start the React frontend. Production must use a deployed **HTTPS** FastAPI URL and CORS must allow the hosted React origin.
