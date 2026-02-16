import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth'
import { requireAuth } from './middleware/requireAuth'
import { transpositionsRouter } from './routes/transpositions'
import { lessonsRouter } from './routes/lessons'
import { practiceRouter } from './routes/practice'
import { dashboardRouter } from './routes/dashboard'

export const app = express()
const PORT = Number(process.env.PORT) || 3000

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/transpositions', requireAuth, transpositionsRouter)
app.use('/api/lessons', requireAuth, lessonsRouter)
app.use('/api/practice', requireAuth, practiceRouter)
app.use('/api/dashboard', requireAuth, dashboardRouter)

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}
