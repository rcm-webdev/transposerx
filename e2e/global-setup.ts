import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

export default async function globalSetup() {
  config({ path: resolve(process.cwd(), 'apps/server/.env.test'), override: true })

  if (!process.env.DATABASE_URL?.includes('transposerx_test')) {
    throw new Error('E2E setup: DATABASE_URL does not point to the test DB — aborting to prevent data loss.')
  }

  const prisma = new PrismaClient()
  try {
    await prisma.verification.deleteMany()
    await prisma.user.deleteMany()
  } finally {
    await prisma.$disconnect()
  }
}
