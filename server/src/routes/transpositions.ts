import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { transpose } from '../lib/transpose'

const router = Router()

const TransposeInputSchema = z.object({
  eye: z.enum(['OD', 'OS']),
  inputSphere: z.number(),
  inputCylinder: z.number(),
  inputAxis: z.number().int().min(1).max(180),
})

router.get('/', async (_req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const history = await prisma.transpositionHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 2,
    })
    res.json(history)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  const parsed = TransposeInputSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  const { eye, inputSphere, inputCylinder, inputAxis } = parsed.data
  const result = transpose({ sphere: inputSphere, cylinder: inputCylinder, axis: inputAxis })
  try {
    const userId = res.locals.session.user.id
    const values = {
      inputSphere,
      inputCylinder,
      inputAxis,
      outSphere: result.sphere,
      outCylinder: result.cylinder,
      outAxis: result.axis,
      createdAt: new Date(),
    }
    const record = await prisma.transpositionHistory.upsert({
      where: { userId_eye: { userId, eye } },
      update: values,
      create: { userId, eye, ...values },
    })
    res.status(201).json({
      id: record.id,
      outSphere: result.sphere,
      outCylinder: result.cylinder,
      outAxis: result.axis,
    })
  } catch (err) {
    next(err)
  }
})

export { router as transpositionsRouter }
