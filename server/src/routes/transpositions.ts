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
  const { od, os } = parsed.data
  const odResult = transpose({ sphere: od.inputSphere, cylinder: od.inputCylinder, axis: od.inputAxis })
  const osResult = transpose({ sphere: os.inputSphere, cylinder: os.inputCylinder, axis: os.inputAxis })
  const userId = res.locals.session.user.id
  try {
    await prisma.$transaction([
      prisma.transpositionHistory.upsert({
        where: { userId_eye: { userId, eye: 'OD' } },
        update: { ...od, outSphere: odResult.sphere, outCylinder: odResult.cylinder, outAxis: odResult.axis, createdAt: new Date() },
        create: { userId, eye: 'OD', ...od, outSphere: odResult.sphere, outCylinder: odResult.cylinder, outAxis: odResult.axis, createdAt: new Date() },
      }),
      prisma.transpositionHistory.upsert({
        where: { userId_eye: { userId, eye: 'OS' } },
        update: { ...os, outSphere: osResult.sphere, outCylinder: osResult.cylinder, outAxis: osResult.axis, createdAt: new Date() },
        create: { userId, eye: 'OS', ...os, outSphere: osResult.sphere, outCylinder: osResult.cylinder, outAxis: osResult.axis, createdAt: new Date() },
      }),
    ])
    res.status(201).json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export { router as transpositionsRouter }
