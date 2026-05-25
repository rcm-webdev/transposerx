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

export interface QuizQuestion {
  question: string
  options: string[]
  answer: number
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'Cylinder power in a prescription corrects for which condition?',
    options: ['Myopia (nearsightedness)', 'Astigmatism', 'Presbyopia'],
    answer: 1,
  },
  {
    question: 'An axis value of 090 means the cylinder power is oriented...',
    options: ['Horizontally (180°)', 'Vertically (90°)', 'Diagonally at 45°'],
    answer: 1,
  },
  {
    question: 'Which instrument convention typically requires plus cylinder format?',
    options: ['Manual lensometer', 'Automated phoropter', 'Auto-refractor / keratometer'],
    answer: 2,
  },
  {
    question: 'Before entering a prescription into optical lab software, you should verify...',
    options: [
      'The patient\'s date of birth',
      'Which cylinder convention the software expects',
      'Whether the prescription is more than one year old',
    ],
    answer: 1,
  },
]
