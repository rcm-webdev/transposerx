import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { LESSONS } from '../lib/lessons'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const [progressRecords, recentHistory, allAttempts] = await prisma.$transaction([
      prisma.lessonProgress.findMany({ where: { userId } }),
      prisma.transpositionHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          inputSphere: true, inputCylinder: true, inputAxis: true,
          outSphere: true, outCylinder: true, outAxis: true,
          eye: true,
          createdAt: true,
        },
      }),
      prisma.quizAttempt.findMany({ where: { userId }, take: 100 }),
    ])
    const progressMap = new Map(progressRecords.map(p => [p.lessonSlug, p.status]))
    const lessonsCompleted = progressRecords.filter(p => p.status === 'completed').length
    const lessonProgress = LESSONS.map(l => ({
      slug: l.slug,
      title: l.title,
      status: progressMap.get(l.slug) ?? 'not_started',
    }))
    const bestQuiz =
      allAttempts.length === 0
        ? null
        : (() => {
            const best = allAttempts.reduce((b, c) => c.score / c.total > b.score / b.total ? c : b)
            return { score: best.score, total: best.total }
          })()
    res.json({ lessonsCompleted, lessonProgress, recentHistory, bestQuiz })
  } catch (err) {
    next(err)
  }
})

export { router as dashboardRouter }
