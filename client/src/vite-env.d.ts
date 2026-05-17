/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.mdx' {
  import { ComponentType } from 'react'
  const Component: ComponentType
  export const frontmatter: {
    slug?: string
    title?: string
    order?: number
    quiz?: Array<{
      question: string
      options: string[]
      answer: number
    }>
  } | undefined
  export default Component
}
