export interface LessonMeta {
  slug: string
  title: string
  order: number
}

export const LESSONS: LessonMeta[] = [
  { slug: 'what-is-cylinder', title: 'What is Cylinder?', order: 1 },
  { slug: 'what-is-axis', title: 'What is Axis?', order: 2 },
  { slug: 'why-transposition-matters', title: 'Why Transposition Matters', order: 3 },
  { slug: 'when-to-use-each-format', title: 'When to Use Each Format', order: 4 },
]
