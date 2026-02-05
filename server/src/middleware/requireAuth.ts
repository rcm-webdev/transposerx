import { Request, Response, NextFunction } from 'express'
import { auth } from '../lib/auth'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers })
    if (!session) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    res.locals.session = session
    next()
  } catch (err) {
    next(err)
  }
}
