import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

await prisma.verification.deleteMany()
await prisma.user.deleteMany()

await prisma.$disconnect()
