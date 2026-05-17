import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

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
    const record = await prisma.quizAttempt.create({
      data: { userId: res.locals.session.user.id, ...parsed.data },
    })
    res.status(201).json({ id: record.id, score: record.score, total: record.total, createdAt: record.createdAt })
  } catch (err) {
    next(err)
  }
})

router.get('/best', async (_req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const attempts = await prisma.quizAttempt.findMany({ where: { userId } })
    if (attempts.length === 0) {
      res.json(null)
      return
    }
    const best = attempts.reduce((b, c) => c.score / c.total > b.score / b.total ? c : b)
    res.json({ score: best.score, total: best.total, createdAt: best.createdAt })
  } catch (err) {
    next(err)
  }
})

export { router as practiceRouter }
