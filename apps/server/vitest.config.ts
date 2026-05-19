import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

config({ path: resolve(fileURLToPath(import.meta.url), '..', '.env.test') })

export default defineConfig({
  test: {
    globalSetup: ['./src/test/globalSetup.ts'],
  },
})
