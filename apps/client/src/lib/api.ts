import axios, { type AxiosRequestConfig } from 'axios'
import type { TranspositionRecord, LessonWithProgress, DashboardData } from '@transposerx/types'
export type { TranspositionRecord, LessonWithProgress, DashboardData }

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

async function request<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
  const res = await client.request<T>({ url: path, ...options })
  return res.data
}

export const api = {
  transpositions: {
    list: () => request<TranspositionRecord[]>('/api/transpositions'),
    create: (body: { eye: string; inputSphere: number; inputCylinder: number; inputAxis: number }) =>
      request<{ id: string; outSphere: number; outCylinder: number; outAxis: number }>(
        '/api/transpositions',
        { method: 'POST', data: body }
      ),
    createBoth: (body: {
      od: { inputSphere: number; inputCylinder: number; inputAxis: number }
      os: { inputSphere: number; inputCylinder: number; inputAxis: number }
    }) => request<{ ok: boolean }>('/api/transpositions/both', { method: 'POST', data: body }),
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
        { method: 'POST', data: body }
      ),
    best: () =>
      request<{ score: number; total: number; createdAt: string } | null>('/api/practice/best'),
  },
  dashboard: {
    get: () => request<DashboardData>('/api/dashboard'),
  },
}
