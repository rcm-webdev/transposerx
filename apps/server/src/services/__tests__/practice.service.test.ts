import { describe, it, expect, vi } from 'vitest'

vi.mock('../../repositories/quiz.repository.js', () => ({
  quizRepository: {
    create: vi.fn().mockResolvedValue({ id: 'attempt-1', createdAt: new Date('2026-01-01') }),
  },
}))

import { practiceService } from '../practice.service.js'

describe('practiceService', () => {
  it('does not leak correctIndex from checkAnswer', () => {
    const userId = 'user-1'
    const { sessionId, questions } = practiceService.generateSession(userId)
    const q = questions[0]

    const check = practiceService.checkAnswer(sessionId, q.id, 0, userId)
    expect('error' in check).toBe(false)
    if ('error' in check) return

    expect(check).toEqual({ correct: expect.any(Boolean) })
    expect(check).not.toHaveProperty('correctIndex')
  })

  it('rejects re-checking the same question', () => {
    const userId = 'user-1'
    const { sessionId, questions } = practiceService.generateSession(userId)
    const q = questions[0]

    practiceService.checkAnswer(sessionId, q.id, 0, userId)
    const second = practiceService.checkAnswer(sessionId, q.id, 1, userId)

    expect(second).toEqual({ error: 'Question already answered' })
  })

  it('scores from server-recorded answers, not client submit payload', async () => {
    const userId = 'user-1'
    const { sessionId, questions } = practiceService.generateSession(userId)

    for (const q of questions) {
      practiceService.checkAnswer(sessionId, q.id, 0, userId)
    }

    const submitted = await practiceService.submitSession(sessionId, userId)
    expect('error' in submitted).toBe(false)
    if ('error' in submitted) return

    const allZerosCorrect = questions.every((_, i) => submitted.results[i].correct)
    expect(submitted.score).toBe(allZerosCorrect ? questions.length : 0)
    expect(submitted.score).toBeLessThanOrEqual(questions.length)
  })
})
