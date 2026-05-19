import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

export default async function globalTeardown() {
  config({ path: resolve(process.cwd(), 'apps/server/.env.test'), override: true })
  const prisma = new PrismaClient()
  try {
    await prisma.verification.deleteMany()
    await prisma.user.deleteMany()
  } finally {
    await prisma.$disconnect()
  }
}
