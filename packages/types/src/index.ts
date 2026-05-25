export interface TransposeInput {
  sphere: number
  cylinder: number
  axis: number
}

export interface TransposeResult {
  sphere: number
  cylinder: number
  axis: number
}

export interface TranspositionRecord {
  id: string
  eye: string
  inputSphere: number
  inputCylinder: number
  inputAxis: number
  outSphere: number
  outCylinder: number
  outAxis: number
  createdAt: string
}

export interface LessonWithProgress {
  slug: string
  title: string
  order: number
  status: 'not_started' | 'started' | 'completed'
}

export interface DashboardData {
  lessonsCompleted: number
  totalLessons: number
  lessonProgress: LessonWithProgress[]
  recentHistory: TranspositionRecord[]
  bestQuiz: { score: number; total: number } | null
  transpositionCount: number
}

export interface PracticeQuestion {
  id: string
  type: 'concept' | 'drill'
  question: string
  options: string[]
}

export interface PracticeSession {
  sessionId: string
  questions: PracticeQuestion[]
}

export interface PracticeCheckResult {
  correct: boolean
}

export interface PracticeSubmitResult {
  id: string
  score: number
  total: number
  results: { questionId: string; correct: boolean; correctIndex: number }[]
  createdAt: string
}
