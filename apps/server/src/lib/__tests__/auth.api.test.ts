import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import supertest from 'supertest'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@better-auth/utils/password'
import { app } from '../../index.js'

const request = supertest(app)
const prisma = new PrismaClient()
const ORIGIN = 'http://localhost:5173'

beforeEach(async () => {
  await prisma.rateLimit.deleteMany()
  await prisma.verification.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

async function seedUser(name: string, email: string, password: string) {
  const hashed = await hashPassword(password)
  const userId = crypto.randomUUID()
  await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: userId,
          providerId: 'credential',
          password: hashed,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  })
}

describe('POST /api/auth/sign-up/email', () => {
  it('returns 403 when registration is closed', async () => {
    const res = await request
      .post('/api/auth/sign-up/email')
      .set('Origin', ORIGIN)
      .send({ name: 'New User', email: 'new@example.com', password: 'password123' })

    expect(res.status).toBe(403)
    expect(res.body.message).toBe('Registration is currently closed.')
  })
})

describe('rate limiting', () => {
  it('returns 429 after exceeding the sign-in attempt limit', async () => {
    // Sign-in has a hardcoded special rule in better-auth: max 3 per 10s
    for (let i = 0; i < 3; i++) {
      await request
        .post('/api/auth/sign-in/email')
        .set('Origin', ORIGIN)
        .send({ email: 'test@example.com', password: 'wrongpassword' })
    }

    const res = await request
      .post('/api/auth/sign-in/email')
      .set('Origin', ORIGIN)
      .send({ email: 'test@example.com', password: 'wrongpassword' })

    expect(res.status).toBe(429)
    expect(JSON.parse(res.text).message).toBe('Too many requests. Please try again later.')
  })
})

describe('POST /api/auth/sign-in/email', () => {
  beforeEach(async () => {
    await seedUser('Existing User', 'existing@example.com', 'password123')
  })

  it('returns 200 and a session cookie for valid credentials', async () => {
    const res = await request
      .post('/api/auth/sign-in/email')
      .set('Origin', ORIGIN)
      .send({ email: 'existing@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('returns an error for wrong password', async () => {
    const res = await request
      .post('/api/auth/sign-in/email')
      .set('Origin', ORIGIN)
      .send({ email: 'existing@example.com', password: 'wrongpassword' })

    expect(res.status).toBeGreaterThanOrEqual(400)
  })

  it('returns an error for a non-existent email', async () => {
    const res = await request
      .post('/api/auth/sign-in/email')
      .set('Origin', ORIGIN)
      .send({ email: 'nobody@example.com', password: 'password123' })

    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})
