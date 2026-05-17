import type { TranspositionRecord, LessonWithProgress, DashboardData } from '@transposerx/types'
export type { TranspositionRecord, LessonWithProgress, DashboardData }

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  transpositions: {
    list: () => request<TranspositionRecord[]>('/api/transpositions'),
    create: (body: { eye: string; inputSphere: number; inputCylinder: number; inputAxis: number }) =>
      request<{ id: string; outSphere: number; outCylinder: number; outAxis: number }>(
        '/api/transpositions',
        { method: 'POST', body: JSON.stringify(body) }
      ),
    createBoth: (body: {
      od: { inputSphere: number; inputCylinder: number; inputAxis: number }
      os: { inputSphere: number; inputCylinder: number; inputAxis: number }
    }) => request<{ ok: boolean }>('/api/transpositions/both', { method: 'POST', body: JSON.stringify(body) }),
  },
  lessons: {
    list: () => request<LessonWithProgress[]>('/api/lessons'),
    start: (slug: string) =>
      request<{ status: string }>(`/api/lessons/${slug}/start`, { method: 'POST' }),
    complete: (slug: string) =>
      request<{ status: string; completedAt: string }>(
        `/api/lessons/${slug}/complete`,
        { method: 'POST' }
      ),
  },
  practice: {
    submitAttempt: (body: { source: string; score: number; total: number }) =>
      request<{ id: string; score: number; total: number; createdAt: string }>(
        '/api/practice/attempt',
        { method: 'POST', body: JSON.stringify(body) }
      ),
    best: () =>
      request<{ score: number; total: number; createdAt: string } | null>('/api/practice/best'),
  },
  dashboard: {
    get: () => request<DashboardData>('/api/dashboard'),
  },
}
