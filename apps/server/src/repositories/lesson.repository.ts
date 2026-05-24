import { prisma } from '../lib/prisma.js'

export const lessonRepository = {
  findProgressByUser(userId: string) {
    return prisma.lessonProgress.findMany({ where: { userId } })
  },

  findProgress(userId: string, lessonSlug: string) {
    return prisma.lessonProgress.findUnique({
      where: { userId_lessonSlug: { userId, lessonSlug } },
    })
  },

  upsertProgress(
    userId: string,
    lessonSlug: string,
    status: 'not_started' | 'started' | 'completed',
    completedAt?: Date,
  ) {
    return prisma.lessonProgress.upsert({
      where: { userId_lessonSlug: { userId, lessonSlug } },
      create: { userId, lessonSlug, status, completedAt },
      update: { status, ...(completedAt ? { completedAt } : {}) },
    })
  },
}
