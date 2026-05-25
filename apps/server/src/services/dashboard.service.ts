import type { LessonProgress, QuizAttempt } from '@prisma/client'
import { LESSONS } from '../lib/lessons.js'
import { lessonRepository } from '../repositories/lesson.repository.js'
import { transpositionRepository } from '../repositories/transposition.repository.js'
import { quizRepository } from '../repositories/quiz.repository.js'

export const dashboardService = {
  async getDashboard(userId: string) {
    const [progressRecords, recentHistory, allAttempts, transpositionCount] = await Promise.all([
      lessonRepository.findProgressByUser(userId),
      transpositionRepository.findRecentByUser(userId, 2),
      quizRepository.findAllByUser(userId),
      transpositionRepository.countByUser(userId),
    ])

    const progressMap = new Map(progressRecords.map((p: LessonProgress) => [p.lessonSlug, p.status]))
    const lessonsCompleted = progressRecords.filter((p: LessonProgress) => p.status === 'completed').length
    const totalLessons = LESSONS.length

    const lessonProgress = LESSONS.map(l => ({
      slug: l.slug,
      title: l.title,
      order: l.order,
      status: progressMap.get(l.slug) ?? 'not_started',
    }))

    const bestQuiz =
      allAttempts.length === 0
        ? null
        : (() => {
            const best = allAttempts.reduce((b: QuizAttempt, c: QuizAttempt) => c.score / c.total > b.score / b.total ? c : b)
            return { score: best.score, total: best.total }
          })()

    const sorted = [...recentHistory].sort((a, b) => a.eye.localeCompare(b.eye))

    return { lessonsCompleted, totalLessons, lessonProgress, recentHistory: sorted, bestQuiz, transpositionCount }
  },
}
