import { prisma } from '../lib/prisma.js'

export const quizRepository = {
  create(userId: string, data: { source: string; score: number; total: number }) {
    return prisma.quizAttempt.create({
      data: { userId, ...data },
    })
  },

  findAllByUser(userId: string) {
    return prisma.quizAttempt.findMany({ where: { userId } })
  },
}
