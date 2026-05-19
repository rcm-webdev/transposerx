import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import supertest from 'supertest'
import { PrismaClient } from '@prisma/client'
import { app } from '../../index.js'

const request = supertest(app)
const prisma = new PrismaClient()
const ORIGIN = 'http://localhost:5173'

beforeEach(async () => {
  await prisma.verification.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /api/auth/sign-up/email', () => {
  it('creates a user and returns 200', async () => {
    const res = await request
      .post('/api/auth/sign-up/email')
      .set('Origin', ORIGIN)
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.email).toBe('test@example.com')
  })

  it('returns an error for a duplicate email', async () => {
    await request
      .post('/api/auth/sign-up/email')
      .set('Origin', ORIGIN)
      .send({ name: 'First User', email: 'dupe@example.com', password: 'password123' })

    const res = await request
      .post('/api/auth/sign-up/email')
      .set('Origin', ORIGIN)
      .send({ name: 'Second User', email: 'dupe@example.com', password: 'password456' })

    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})

describe('POST /api/auth/sign-in/email', () => {
  beforeEach(async () => {
    await request
      .post('/api/auth/sign-up/email')
      .set('Origin', ORIGIN)
      .send({ name: 'Existing User', email: 'existing@example.com', password: 'password123' })
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
