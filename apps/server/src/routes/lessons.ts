import { Router } from 'express'
import { lessonService } from '../services/lesson.service.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const lessons = await lessonService.listWithProgress(userId)
    res.json(lessons)
  } catch (err) {
    next(err)
  }
})

router.post('/:slug/start', async (req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const result = await lessonService.startLesson(userId, req.params.slug)
    if ('error' in result) {
      res.status(404).json({ error: result.error })
      return
    }
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/:slug/complete', async (req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const result = await lessonService.completeLesson(userId, req.params.slug)
    if ('error' in result) {
      res.status(404).json({ error: result.error })
      return
    }
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export { router as lessonsRouter }
