import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { LESSONS } from '../lib/lessons'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const progressRecords = await prisma.lessonProgress.findMany({ where: { userId } })
    const progressMap = new Map(progressRecords.map(p => [p.lessonSlug, p.status]))
    res.json(
      LESSONS.map(lesson => ({
        ...lesson,
        status: progressMap.get(lesson.slug) ?? 'not_started',
      }))
    )
  } catch (err) {
    next(err)
  }
})

router.post('/:slug/start', async (req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const { slug } = req.params
    if (!LESSONS.find(l => l.slug === slug)) {
      res.status(404).json({ error: 'Lesson not found' })
      return
    }
    const existing = await prisma.lessonProgress.findUnique({
      where: { userId_lessonSlug: { userId, lessonSlug: slug } },
    })
    if (existing?.status === 'completed') {
      res.json({ status: existing.status })
      return
    }
    const record = await prisma.lessonProgress.upsert({
      where: { userId_lessonSlug: { userId, lessonSlug: slug } },
      create: { userId, lessonSlug: slug, status: 'started' },
      update: { status: 'started' },
    })
    res.json({ status: record.status })
  } catch (err) {
    next(err)
  }
})

router.post('/:slug/complete', async (req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const { slug } = req.params
    if (!LESSONS.find(l => l.slug === slug)) {
      res.status(404).json({ error: 'Lesson not found' })
      return
    }
    const record = await prisma.lessonProgress.upsert({
      where: { userId_lessonSlug: { userId, lessonSlug: slug } },
      create: { userId, lessonSlug: slug, status: 'completed', completedAt: new Date() },
      update: { status: 'completed', completedAt: new Date() },
    })
    res.json({ status: record.status, completedAt: record.completedAt })
  } catch (err) {
    next(err)
  }
})

export { router as lessonsRouter }
