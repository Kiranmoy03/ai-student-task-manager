# FastAPI backend — AI Student Task Manager

The React frontend remains at the repository root. This folder is a separate Python API. **The dashboard still shows local demo tasks until we connect its React handlers to this API in a later step.**

## What it does

- `GET /health` — check whether the Python API is running (no login needed)
- `GET /api/me` — verify a Supabase Auth access token
- `GET /api/tasks` — list the signed-in student's tasks
- `POST /api/tasks` — create a task owned by the signed-in student
- `PATCH /api/tasks/{task_id}` — update a task
- `DELETE /api/tasks/{task_id}` — delete a task
- `GET /docs` — automatically generated interactive FastAPI documentation

Every `/api/` request needs `Authorization: Bearer <supabase_access_token>`. The backend validates that token with Supabase Auth and sends it with each query to Supabase PostgREST, so table **Row Level Security (RLS)** rules apply. No database password, service-role key, or admin bypass is needed.

## Run locally (Python 3.11+)

From the `backend` directory:

```bash
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS / Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # On Windows, use: Copy-Item .env.example .env
```

Edit `.env`: set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for **the same Supabase project used by the frontend**. Keep `.env` out of Git. The publishable key may be public; never paste in a service-role/secret key.

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Open <http://127.0.0.1:8000/health> or <http://127.0.0.1:8000/docs>. Run the mock tests with `python -m pytest -q` after installing `pytest`.

## Important: confirm database schema before connecting the UI

**This commit does not create or change Supabase tables.** Before using task endpoints, check that `public.tasks` in the frontend's Supabase project has these columns:

| Column | PostgreSQL type |
| --- | --- |
| `id` | `uuid` primary key, default `gen_random_uuid()` |
| `user_id` | `uuid` not null, references `auth.users(id)` |
| `title` | `text` not null |
| `subject` | `text` not null (or compatible) |
| `due_date` | `date` nullable |
| `due_time` | `time` nullable |
| `estimated_minutes` | `integer` not null |
| `priority` | `text` (`low` / `medium` / `high`) |
| `completed` | `boolean` not null |
| `created_at` | `timestamptz` not null, default `now()` |

Enable RLS and verify **four user-scoped policies** (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) based on `auth.uid() = user_id`. For `UPDATE`, check both `USING` and `WITH CHECK` ownership conditions. A policy that only checks `TO authenticated` is not enough. Do **not** execute a table-creation SQL script over an existing schema without checking for conflicts, and do not disable RLS to troubleshoot.

The React `Task` interface currently uses `dueDate`, `estimatedMinutes` etc., while Postgres uses `due_date`, `estimated_minutes`. The frontend adapter will convert these once the schema is confirmed. Currently the frontend also uses `Today`/`Tomorrow` for demo dates; the API expects ISO dates (for example `2026-10-14`).

## Example create request

After signing in through the React app, supply its Supabase **access token** (not the publishable key) in the request header:

```http
POST /api/tasks
Authorization: Bearer <access-token>
Content-Type: application/json

{"title":"Revise algorithms","subject":"CS","estimated_minutes":45,"priority":"medium"}
```

For deployment, add `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `CORS_ORIGINS` as backend environment variables and run `uvicorn main:app --host 0.0.0.0 --port $PORT` where your host provides `$PORT`. No deployment has been performed yet.
