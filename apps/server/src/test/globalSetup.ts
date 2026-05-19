import { execSync } from 'child_process'

export async function setup() {
  execSync('npx prisma migrate deploy', {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  })
}
