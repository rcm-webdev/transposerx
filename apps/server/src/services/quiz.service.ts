import type { QuizAttempt } from '@prisma/client'
import { quizRepository } from '../repositories/quiz.repository.js'

export const quizService = {
  async submitAttempt(userId: string, data: { source: string; score: number; total: number }) {
    const record = await quizRepository.create(userId, data)
    return { id: record.id, score: record.score, total: record.total, createdAt: record.createdAt }
  },

  async getBestAttempt(userId: string) {
    const attempts = await quizRepository.findAllByUser(userId)
    if (attempts.length === 0) return null
    const best = attempts.reduce((b: QuizAttempt, c: QuizAttempt) => c.score / c.total > b.score / b.total ? c : b)
    return { score: best.score, total: best.total, createdAt: best.createdAt }
  },
}
