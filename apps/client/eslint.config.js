import globals from 'globals'
import reactConfig from '@transposerx/eslint-config/react'

export default [
  { ignores: ['dist'] },
  ...reactConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]
