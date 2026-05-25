import { Router } from 'express'
import { z } from 'zod'
import { transpositionService } from '../services/transposition.service.js'

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
    const history = await transpositionService.getHistory(userId)
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
  try {
    const userId = res.locals.session.user.id
    const { eye, ...input } = parsed.data
    const result = await transpositionService.transposeSingleEye(userId, eye, input)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

const BothEyesInputSchema = z.object({
  od: z.object({ inputSphere: z.number(), inputCylinder: z.number(), inputAxis: z.number().int().min(1).max(180) }),
  os: z.object({ inputSphere: z.number(), inputCylinder: z.number(), inputAxis: z.number().int().min(1).max(180) }),
})

router.post('/both', async (req, res, next) => {
  const parsed = BothEyesInputSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  try {
    const userId = res.locals.session.user.id
    await transpositionService.transposeBothEyes(userId, parsed.data.od, parsed.data.os)
    res.status(201).json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export { router as transpositionsRouter }
