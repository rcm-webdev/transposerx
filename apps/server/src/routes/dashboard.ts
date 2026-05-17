import { Router } from 'express'
import type { LessonProgress, QuizAttempt } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { LESSONS } from '../lib/lessons.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const [progressRecords, recentHistory, allAttempts, transpositionCount] = await prisma.$transaction([
      prisma.lessonProgress.findMany({ where: { userId } }),
      prisma.transpositionHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: {
          id: true,
          inputSphere: true, inputCylinder: true, inputAxis: true,
          outSphere: true, outCylinder: true, outAxis: true,
          eye: true,
          createdAt: true,
        },
      }),
      prisma.quizAttempt.findMany({ where: { userId } }),
      prisma.transpositionHistory.count({ where: { userId } }),
    ]) as [LessonProgress[], { id: string; inputSphere: number; inputCylinder: number; inputAxis: number; outSphere: number; outCylinder: number; outAxis: number; eye: string; createdAt: Date }[], QuizAttempt[], number]
    const progressMap = new Map(progressRecords.map((p: LessonProgress) => [p.lessonSlug, p.status]))
    const lessonsCompleted = progressRecords.filter((p: LessonProgress) => p.status === 'completed').length
    const lessonProgress = LESSONS.map(l => ({
      slug: l.slug,
      title: l.title,
      status: progressMap.get(l.slug) ?? 'not_started',
    }))
    const bestQuiz =
      allAttempts.length === 0
        ? null
        : (() => {
            const best = allAttempts.reduce((b: QuizAttempt, c: QuizAttempt) => c.score / c.total > b.score / b.total ? c : b)
            return { score: best.score, total: best.total }
          })()
    recentHistory.sort((a, b) => a.eye.localeCompare(b.eye))
    res.json({ lessonsCompleted, lessonProgress, recentHistory, bestQuiz, transpositionCount })
  } catch (err) {
    next(err)
  }
})

export { router as dashboardRouter }
