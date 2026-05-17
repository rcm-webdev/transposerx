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
  lessonProgress: LessonWithProgress[]
  recentHistory: TranspositionRecord[]
  bestQuiz: { score: number; total: number } | null
  transpositionCount: number
}
