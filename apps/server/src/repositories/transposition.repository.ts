import { prisma } from '../lib/prisma.js'

export const transpositionRepository = {
  findByUser(userId: string, limit?: number) {
    return prisma.transpositionHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    })
  },

  findRecentByUser(userId: string, limit: number) {
    return prisma.transpositionHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        inputSphere: true, inputCylinder: true, inputAxis: true,
        outSphere: true, outCylinder: true, outAxis: true,
        eye: true,
        createdAt: true,
      },
    })
  },

  countByUser(userId: string) {
    return prisma.transpositionHistory.count({ where: { userId } })
  },

  upsertForEye(
    userId: string,
    eye: string,
    input: { inputSphere: number; inputCylinder: number; inputAxis: number },
    output: { outSphere: number; outCylinder: number; outAxis: number },
  ) {
    const values = { ...input, ...output, createdAt: new Date() }
    return prisma.transpositionHistory.upsert({
      where: { userId_eye: { userId, eye } },
      update: values,
      create: { userId, eye, ...values },
    })
  },

  upsertBothEyes(
    userId: string,
    od: { input: { inputSphere: number; inputCylinder: number; inputAxis: number }; output: { outSphere: number; outCylinder: number; outAxis: number } },
    os: { input: { inputSphere: number; inputCylinder: number; inputAxis: number }; output: { outSphere: number; outCylinder: number; outAxis: number } },
  ) {
    return prisma.$transaction([
      prisma.transpositionHistory.upsert({
        where: { userId_eye: { userId, eye: 'OD' } },
        update: { ...od.input, ...od.output, createdAt: new Date() },
        create: { userId, eye: 'OD', ...od.input, ...od.output, createdAt: new Date() },
      }),
      prisma.transpositionHistory.upsert({
        where: { userId_eye: { userId, eye: 'OS' } },
        update: { ...os.input, ...os.output, createdAt: new Date() },
        create: { userId, eye: 'OS', ...os.input, ...os.output, createdAt: new Date() },
      }),
    ])
  },
}
