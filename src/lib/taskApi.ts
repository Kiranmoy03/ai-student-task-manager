import { Priority, Task, StudyPlan } from '../types/student';

// Local: VITE_API_BASE_URL=http://localhost:8000
// Hosted site: VITE_API_BASE_URL=https://your-deployed-fastapi.example
function normalizeUrl(url?: string): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  const configured = normalizeUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);
  if (configured) {
    return configured;
  }
  // When running locally in browser (localhost/127.0.0.1)
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return 'http://localhost:8000';
    }
  } else if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  return '';
}

export function isApiConfigured(): boolean {
  return Boolean(getApiBaseUrl());
}

type ApiPriority = 'High' | 'Medium' | 'Low';
type ApiTask = {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  due: string | null;
  priority: ApiPriority;
  completed: boolean;
  created_at: string;
};

const apiPriority: Record<Priority, ApiPriority> = {
  high: 'High', medium: 'Medium', low: 'Low',
};

function toTask(row: ApiTask): Task {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    dueDate: row.due ?? 'No deadline',
    priority: row.priority.toLowerCase() as Priority,
    completed: row.completed,
    // No dueTime or estimatedMinutes: neither exists in public.tasks.
  };
}

async function request<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    throw new Error(
      'Task API is not configured. Set VITE_API_BASE_URL in your environment to your deployed HTTPS FastAPI backend URL.'
    );
  }

  // Prevent mixed-content blocking when frontend runs over HTTPS
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && baseUrl.startsWith('http://')) {
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      throw new Error(
        'Cannot connect to local HTTP FastAPI from an HTTPS site due to browser mixed-content restrictions. Deploy FastAPI with HTTPS or run the frontend locally at http://localhost:3000.'
      );
    }
    throw new Error(
      'Task API URL must use HTTPS when loaded over an HTTPS page. Update VITE_API_BASE_URL to use https://.'
    );
  }

  if (!token) throw new Error('Please sign in to manage tasks.');

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
  } catch {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    throw new Error(
      `Cannot reach the task API at ${baseUrl}. Ensure FastAPI is running and CORS_ORIGINS on the backend allows ${currentOrigin || 'this origin'}.`
    );
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error('Your session expired. Please sign in again.');
    let detail = `Task request failed (HTTP ${response.status}).`;
    try {
      const error: unknown = await response.json();
      if (error && typeof error === 'object' && 'detail' in error && typeof error.detail === 'string') {
        detail = error.detail;
      }
    } catch { /* avoid exposing raw server response */ }
    throw new Error(detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function fetchTasks(token: string): Promise<Task[]> {
  const rows = await request<ApiTask[]>(token, '/api/tasks');
  return rows.map(toTask);
}

export async function createTask(token: string, task: {
  title: string;
  subject: string;
  priority: Priority;
  due?: string | null;
}): Promise<Task> {
  const row = await request<ApiTask>(token, '/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ ...task, priority: apiPriority[task.priority] }),
  });
  return toTask(row);
}

export async function updateTask(token: string, taskId: string, changes: { completed: boolean }): Promise<Task> {
  const row = await request<ApiTask>(token, `/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
  return toTask(row);
}

export async function deleteTask(token: string, taskId: string): Promise<void> {
  await request<void>(token, `/api/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
}

export async function fetchStudyPlan(token: string): Promise<StudyPlan> {
  return await request<StudyPlan>(token, '/api/ai/study-plan', {
    method: 'POST',
  });
}

