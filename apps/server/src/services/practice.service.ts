import { transpose, formatRx } from '@transposerx/utils'
import { quizRepository } from '../repositories/quiz.repository.js'
import { QUIZ_QUESTIONS } from '../lib/lessons.js'

interface Question {
  id: string
  type: 'concept' | 'drill'
  question: string
  options: string[]
}

interface SessionQuestion extends Question {
  answer: number
}

interface ActiveSession {
  questions: SessionQuestion[]
  userId: string
  createdAt: number
  /** First committed answer per question; score is derived from this only. */
  answers: Map<string, number>
}

const activeSessions = new Map<string, ActiveSession>()

const SESSION_TTL_MS = 30 * 60 * 1000 // 30 minutes

function randomInRange(min: number, max: number, step: number): number {
  const steps = Math.round((max - min) / step)
  return min + Math.round(Math.random() * steps) * step
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function generateDrill(): SessionQuestion {
  const sphere = randomInRange(-10, 10, 0.25)
  const cylinder = randomInRange(-4, -0.25, 0.25)
  const axis = Math.floor(Math.random() * 180) + 1
  const correct = transpose({ sphere, cylinder, axis })

  const distractor1 = transpose({ sphere, cylinder, axis: axis <= 135 ? axis + 45 : axis - 45 })
  const distractor2 = transpose({ sphere, cylinder: -cylinder, axis })

  const options = [formatRx(correct), formatRx(distractor1), formatRx(distractor2)]
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5)
  const correctIndex = shuffledOptions.indexOf(options[0])

  return {
    id: crypto.randomUUID(),
    type: 'drill',
    question: `Transpose: ${round2(sphere) >= 0 ? '+' : ''}${round2(sphere).toFixed(2)} ${round2(cylinder).toFixed(2)} x ${String(axis).padStart(3, '0')}`,
    options: shuffledOptions,
    answer: correctIndex,
  }
}

function buildSession(): SessionQuestion[] {
  const allConceptQs: SessionQuestion[] = QUIZ_QUESTIONS.map(q => ({
    id: crypto.randomUUID(),
    type: 'concept' as const,
    ...q,
  }))

  const shuffledConcept = [...allConceptQs].sort(() => Math.random() - 0.5).slice(0, 6)
  const drills = Array.from({ length: 4 }, generateDrill)

  return [...shuffledConcept, ...drills].sort(() => Math.random() - 0.5)
}

function cleanExpiredSessions() {
  const now = Date.now()
  for (const [id, session] of activeSessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      activeSessions.delete(id)
    }
  }
}

export const practiceService = {
  generateSession(userId: string) {
    cleanExpiredSessions()

    const questions = buildSession()
    const sessionId = crypto.randomUUID()

    activeSessions.set(sessionId, { questions, userId, createdAt: Date.now(), answers: new Map() })

    const clientQuestions: Question[] = questions.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
    }))

    return { sessionId, questions: clientQuestions }
  },

  checkAnswer(sessionId: string, questionId: string, selectedIndex: number, userId: string) {
    const session = activeSessions.get(sessionId)
    if (!session || session.userId !== userId) {
      return { error: 'Session not found or expired' as const }
    }

    const question = session.questions.find(q => q.id === questionId)
    if (!question) {
      return { error: 'Question not found' as const }
    }

    if (session.answers.has(questionId)) {
      return { error: 'Question already answered' as const }
    }

    session.answers.set(questionId, selectedIndex)
    const correct = selectedIndex === question.answer
    return { correct }
  },

  async submitSession(sessionId: string, userId: string) {
    const session = activeSessions.get(sessionId)
    if (!session || session.userId !== userId) {
      return { error: 'Session not found or expired' as const }
    }

    let score = 0
    const results = session.questions.map(q => {
      const selectedIndex = session.answers.get(q.id)
      const correct = selectedIndex !== undefined && selectedIndex === q.answer
      if (correct) score++
      return { questionId: q.id, correct, correctIndex: q.answer }
    })

    const record = await quizRepository.create(userId, {
      source: 'practice',
      score,
      total: session.questions.length,
    })

    activeSessions.delete(sessionId)

    return {
      id: record.id,
      score,
      total: session.questions.length,
      results,
      createdAt: record.createdAt,
    }
  },
}
