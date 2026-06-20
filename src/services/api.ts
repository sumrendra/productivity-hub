import type { Note, Task, Link, Expense, DashboardSummary } from '@/types'

const BASE = '/api'

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error((err as { error: string }).error || 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

const api = {
  get:    <T>(path: string) => req<T>('GET', path),
  post:   <T>(path: string, body: unknown) => req<T>('POST', path, body),
  put:    <T>(path: string, body: unknown) => req<T>('PUT', path, body),
  patch:  <T>(path: string, body: unknown) => req<T>('PATCH', path, body),
  delete: <T>(path: string) => req<T>('DELETE', path),
}

export { api }

export const notesApi = {
  getAll:  ()                            => api.get<Note[]>('/notes'),
  getOne:  (id: number)                  => api.get<Note>(`/notes/${id}`),
  create:  (data: Partial<Note>)         => api.post<Note>('/notes', data),
  update:  (id: number, data: Partial<Note>) => api.put<Note>(`/notes/${id}`, data),
  delete:  (id: number)                  => api.delete<void>(`/notes/${id}`),
}

export const tasksApi = {
  getAll:       ()                                      => api.get<Task[]>('/tasks'),
  create:       (data: Partial<Task>)                   => api.post<Task>('/tasks', data),
  update:       (id: number, data: Partial<Task>)        => api.put<Task>(`/tasks/${id}`, data),
  patchStatus:  (id: number, status: Task['status'])    => api.patch<Task>(`/tasks/${id}/status`, { status }),
  delete:       (id: number)                            => api.delete<void>(`/tasks/${id}`),
}

export const linksApi = {
  getAll:        ()                           => api.get<Link[]>('/links'),
  create:        (data: Partial<Link>)        => api.post<Link>('/links', data),
  update:        (id: number, data: Partial<Link>) => api.put<Link>(`/links/${id}`, data),
  delete:        (id: number)                 => api.delete<void>(`/links/${id}`),
  fetchMetadata: (url: string)                => api.post<Partial<Link>>('/links/fetch-metadata', { url }),
  trackVisit:    (id: number)                 => api.patch<void>(`/links/${id}/visit`, {}),
}

export const expensesApi = {
  getAll:  ()                                       => api.get<Expense[]>('/expenses'),
  summary: ()                                       => api.get<unknown>('/expenses/summary'),
  create:  (data: Partial<Expense>)                 => api.post<Expense>('/expenses', data),
  update:  (id: number, data: Partial<Expense>)     => api.put<Expense>(`/expenses/${id}`, data),
  delete:  (id: number)                             => api.delete<void>(`/expenses/${id}`),
}

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
}

export const settingsApi = {
  getAll: () => api.get<Record<string, unknown>>('/settings'),
  set:    (key: string, value: unknown) => api.put<Record<string, unknown>>(`/settings/${key}`, { value }),
}

export const aiApi = {
  dailyBrief:      ()                                       => api.post<{ brief: string }>('/ai/daily-brief', {}),
  summarizeNote:   (noteId: number)                         => api.post<{ summary: string }>('/ai/summarize-note', { noteId }),
  expandNote:      (content: string, prompt?: string)       => api.post<{ expanded: string }>('/ai/expand-note', { content, prompt }),
  breakdownTask:   (taskTitle: string)                      => api.post<{ subtasks: { title: string }[] }>('/ai/breakdown-task', { taskTitle }),
  financeInsight:  ()                                       => api.post<{ insight: string }>('/ai/finance-insight', {}),
}
