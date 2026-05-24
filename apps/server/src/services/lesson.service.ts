import type { LessonProgress } from '@prisma/client'
import { LESSONS } from '../lib/lessons.js'
import { lessonRepository } from '../repositories/lesson.repository.js'

export const lessonService = {
  async listWithProgress(userId: string) {
    const progressRecords = await lessonRepository.findProgressByUser(userId)
    const progressMap = new Map(progressRecords.map((p: LessonProgress) => [p.lessonSlug, p.status]))
    return LESSONS.map(lesson => ({
      ...lesson,
      status: progressMap.get(lesson.slug) ?? 'not_started',
    }))
  },

  async startLesson(userId: string, slug: string) {
    if (!LESSONS.find(l => l.slug === slug)) {
      return { error: 'Lesson not found' as const }
    }
    const existing = await lessonRepository.findProgress(userId, slug)
    if (existing?.status === 'completed') {
      return { status: existing.status }
    }
    const record = await lessonRepository.upsertProgress(userId, slug, 'started')
    return { status: record.status }
  },

  async completeLesson(userId: string, slug: string) {
    if (!LESSONS.find(l => l.slug === slug)) {
      return { error: 'Lesson not found' as const }
    }
    const record = await lessonRepository.upsertProgress(userId, slug, 'completed', new Date())
    return { status: record.status, completedAt: record.completedAt }
  },
}
