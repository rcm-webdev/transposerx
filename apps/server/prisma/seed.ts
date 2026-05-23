import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@better-auth/utils/password'
import { transpose } from '@transposerx/utils'

const DEMO_EMAIL = process.env.DEMO_SEED_EMAIL ?? 'demo@transposerx.app'
const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD ?? 'DemoPass123!'
const DEMO_NAME = 'Demo User'

const prisma = new PrismaClient()

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? ''
  if (databaseUrl.includes('transposerx_test')) {
    console.log('Skipping seed: DATABASE_URL points at the test database.')
    return
  }

  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } })

  const hashed = await hashPassword(DEMO_PASSWORD)
  const userId = crypto.randomUUID()
  const now = new Date()

  const odInput = { sphere: -2, cylinder: -1, axis: 180 }
  const osInput = { sphere: -1.5, cylinder: -0.75, axis: 135 }
  const odOut = transpose(odInput)
  const osOut = transpose(osInput)

  await prisma.user.create({
    data: {
      id: userId,
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: userId,
          providerId: 'credential',
          password: hashed,
          createdAt: now,
          updatedAt: now,
        },
      },
      history: {
        create: [
          {
            inputSphere: odInput.sphere,
            inputCylinder: odInput.cylinder,
            inputAxis: odInput.axis,
            outSphere: odOut.sphere,
            outCylinder: odOut.cylinder,
            outAxis: odOut.axis,
            eye: 'OD',
          },
          {
            inputSphere: osInput.sphere,
            inputCylinder: osInput.cylinder,
            inputAxis: osInput.axis,
            outSphere: osOut.sphere,
            outCylinder: osOut.cylinder,
            outAxis: osOut.axis,
            eye: 'OS',
          },
        ],
      },
      progress: {
        create: [
          {
            lessonSlug: 'what-is-cylinder',
            status: 'completed',
            completedAt: now,
          },
          {
            lessonSlug: 'what-is-axis',
            status: 'completed',
            completedAt: now,
          },
          {
            lessonSlug: 'why-transposition-matters',
            status: 'started',
          },
        ],
      },
      quizAttempts: {
        create: {
          source: 'what-is-cylinder',
          score: 3,
          total: 3,
        },
      },
    },
  })

  console.log(`Seeded demo user: ${DEMO_EMAIL}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
