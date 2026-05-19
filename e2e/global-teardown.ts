import { PrismaClient } from '@prisma/client'

export default async function globalTeardown() {
  const prisma = new PrismaClient()
  try {
    await prisma.verification.deleteMany()
    await prisma.user.deleteMany()
  } finally {
    await prisma.$disconnect()
  }
}
