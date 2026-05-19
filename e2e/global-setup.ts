import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

export default async function globalSetup() {
  config({ path: resolve(process.cwd(), 'apps/server/.env.test') })
  const prisma = new PrismaClient()
  try {
    await prisma.verification.deleteMany()
    await prisma.user.deleteMany()
  } finally {
    await prisma.$disconnect()
  }
}
