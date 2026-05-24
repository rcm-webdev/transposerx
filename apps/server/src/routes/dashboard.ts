import { Router } from 'express'
import { dashboardService } from '../services/dashboard.service.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const userId = res.locals.session.user.id
    const data = await dashboardService.getDashboard(userId)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export { router as dashboardRouter }
