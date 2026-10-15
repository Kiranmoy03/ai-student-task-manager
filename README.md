# AI Student Task Manager

A full-stack study planning application built with React, Python, FastAPI, and Supabase. Students can manage assignments, review deadlines, and request an AI-generated study plan.

**Live frontend:** https://ai-student-task-manager.vercel.app/  
**Backend:** FastAPI service deployed separately on Render.

## Features

- Student authentication using Supabase Auth.
- Create, view, update, complete, and delete tasks.
- Filter and organize tasks by subject, priority, and deadline.
- Request study-plan suggestions for incomplete tasks through a FastAPI endpoint using Gemini.
- Server-side user identity checks and access to user-scoped Supabase/PostgreSQL records.
- Validation of generated task IDs before including them in an AI study-plan response.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| API | Python, FastAPI, Pydantic, httpx |
| Database and authentication | PostgreSQL and Supabase Auth (Supabase) |
| AI study suggestions | Gemini API through the backend |
| Deployment | Vercel frontend; separate Render API service |

## Architecture

```text
React / Vite frontend (Vercel)
    |
    | Supabase Auth user token
    v
FastAPI application (Render)
    |-- verifies user identity with Supabase Auth
    |-- sends user-scoped requests to Supabase PostgREST (RLS)
    `-- sends sanitized incomplete tasks to Gemini for study-plan suggestions
```

The Gemini key stays on the backend. The frontend only uses a Supabase publishable/anon key and never contains a Supabase service-role key.

## Local development

**Frontend** (Node.js and npm required):

```bash
npm install
npm run dev
```

**Backend** (Python 3.11+):

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements-dev.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Use `backend/.env.example` and the repository's `.env.example` to configure the appropriate development variables. Do not commit real `.env` files, tokens, service-role keys, or Gemini API keys.

The frontend must set `VITE_API_BASE_URL` to the running API. On production HTTPS hosting, that URL must use HTTPS, and the backend `CORS_ORIGINS` setting must allow the frontend origin.

## Verification

The `backend/tests/test_api.py` suite contains API tests with mocked Supabase and Gemini responses covering authentication, task CRUD, user separation, request validation, and AI response handling. These tests do **not** verify the live database or Gemini service. For end-to-end confirmation, test login, task persistence, and study-plan generation against the deployed backend.

```bash
cd backend
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

Live availability of the AI study plan depends on the separate backend deployment and Gemini configuration.

## Scope

This is a portfolio/student productivity project. The AI feature suggests task ordering and study durations; it does not autonomously alter a student's assignments. Students should review AI-generated advice before relying on it.
