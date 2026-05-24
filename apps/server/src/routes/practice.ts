import { Router } from 'express'
import { z } from 'zod'
import { quizService } from '../services/quiz.service.js'
import { practiceService } from '../services/practice.service.js'

const router = Router()

const AttemptSchema = z.object({
  source: z.string().min(1),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
}).refine(data => data.score <= data.total, {
  message: 'score must be less than or equal to total',
  path: ['score'],
})

router.post('/attempt', async (req, res, next) => {
  const parsed = AttemptSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  try {
    const result = await quizService.submitAttempt(res.locals.session.user.id, parsed.data)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/best', async (_req, res, next) => {
  try {
    const result = await quizService.getBestAttempt(res.locals.session.user.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// --- New server-driven practice session endpoints ---

router.post('/session', async (_req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const session = practiceService.generateSession(userId)
    res.status(201).json(session)
  } catch (err) {
    next(err)
  }
})

const CheckAnswerSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0),
})

router.post('/check', async (req, res, next) => {
  const parsed = CheckAnswerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  try {
    const userId = res.locals.session.user.id
    const result = practiceService.checkAnswer(
      parsed.data.sessionId, parsed.data.questionId, parsed.data.selectedIndex, userId,
    )
    if ('error' in result) {
      res.status(404).json({ error: result.error })
      return
    }
    res.json(result)
  } catch (err) {
    next(err)
  }
})

const SubmitSessionSchema = z.object({
  sessionId: z.string().min(1),
  answers: z.array(z.object({
    questionId: z.string().min(1),
    selectedIndex: z.number().int().min(0),
  })),
})

router.post('/submit', async (req, res, next) => {
  const parsed = SubmitSessionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  try {
    const userId = res.locals.session.user.id
    const result = await practiceService.submitSession(
      parsed.data.sessionId, parsed.data.answers, userId,
    )
    if ('error' in result) {
      res.status(404).json({ error: result.error })
      return
    }
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

export { router as practiceRouter }
