import { Priority, Task } from '../types/student';

// Local: VITE_API_BASE_URL=http://localhost:8000
// Hosted site: VITE_API_BASE_URL=https://your-deployed-fastapi.example
const configuredUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const API_BASE_URL = (configuredUrl || (import.meta.env.DEV ? 'http://localhost:8000' : '')).replace(/\/+$/, '');

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
  if (!API_BASE_URL || (import.meta.env.PROD && !API_BASE_URL.startsWith('https://'))) {
    throw new Error('Task API is not configured. Set VITE_API_BASE_URL to your HTTPS FastAPI URL.');
  }
  if (!token) throw new Error('Please sign in to manage tasks.');
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
  } catch {
    throw new Error('Cannot reach the task API. Check that FastAPI is running and its URL is configured.');
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
