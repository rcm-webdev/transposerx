import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { BookOpen, FlipHorizontal, CheckCircle2, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { transpose, formatRx } from '@/lib/transpose'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

import { frontmatter as fm1 } from '../../content/lessons/01-what-is-cylinder.mdx'
import { frontmatter as fm2 } from '../../content/lessons/02-what-is-axis.mdx'
import { frontmatter as fm3 } from '../../content/lessons/03-why-transposition-matters.mdx'
import { frontmatter as fm4 } from '../../content/lessons/04-when-to-use-each-format.mdx'

type QuestionType = 'concept' | 'drill'

interface Question {
  type: QuestionType
  question: string
  options: string[]
  answer: number
}

function randomInRange(min: number, max: number, step: number): number {
  const steps = Math.round((max - min) / step)
  return min + Math.round(Math.random() * steps) * step
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function generateDrill(): Question {
  const sphere = randomInRange(-10, 10, 0.25)
  const cylinder = randomInRange(-4, -0.25, 0.25)
  const axis = Math.floor(Math.random() * 180) + 1
  const correct = transpose({ sphere, cylinder, axis })

  const distractor1 = transpose({ sphere, cylinder, axis: axis <= 135 ? axis + 45 : axis - 45 })
  const distractor2 = transpose({ sphere, cylinder: -cylinder, axis })

  const options = [
    formatRx(correct),
    formatRx(distractor1),
    formatRx(distractor2),
  ]

  const shuffledOptions = [...options].sort(() => Math.random() - 0.5)
  const correctIndex = shuffledOptions.indexOf(options[0])

  return {
    type: 'drill',
    question: `Transpose: ${round2(sphere) >= 0 ? '+' : ''}${round2(sphere).toFixed(2)} ${round2(cylinder).toFixed(2)} x ${String(axis).padStart(3, '0')}`,
    options: shuffledOptions,
    answer: correctIndex,
  }
}

function buildSession(): Question[] {
  const allConceptQs: Question[] = [fm1, fm2, fm3, fm4]
    .flatMap(fm => fm.quiz.map(q => ({ type: 'concept' as const, ...q })))

  const shuffledConcept = [...allConceptQs].sort(() => Math.random() - 0.5).slice(0, 6)
  const drills = Array.from({ length: 4 }, generateDrill)

  return [...shuffledConcept, ...drills].sort(() => Math.random() - 0.5)
}

export function PracticeSession() {
  const [questions] = useState<Question[]>(() => buildSession())
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const submitMutation = useMutation({
    mutationFn: (s: number) =>
      api.practice.submitAttempt({ source: 'practice', score: s, total: questions.length }),
  })

  const handleSelect = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    const correct = index === questions[current].answer
    const newScore = correct ? score + 1 : score

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setScore(newScore)
        setDone(true)
        submitMutation.mutate(newScore)
      } else {
        if (correct) setScore(newScore)
        setCurrent(c => c + 1)
        setSelected(null)
      }
    }, 1000)
  }

  if (done) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <p className="text-xl font-bold">Session Complete</p>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-4xl font-bold">{score} / {questions.length}</p>
          <p className="text-muted-foreground">
            {score === questions.length ? 'Perfect score!' : score >= 7 ? 'Great work.' : 'Keep practicing.'}
          </p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Start New Session
          </Button>
        </CardContent>
      </Card>
    )
  }

  const q = questions[current]
  const isAnswered = selected !== null

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {current + 1} of {questions.length}
          </span>
          <Badge variant="outline" className="gap-1">
            {q.type === 'concept'
              ? <><BookOpen className="h-3 w-3" /> Concept</>
              : <><FlipHorizontal className="h-3 w-3" /> Transposition Drill</>
            }
          </Badge>
        </div>
        <Progress value={((current) / questions.length) * 100} />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium font-mono text-sm">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((option, index) => {
            const isCorrectOption = index === q.answer
            const isSelectedOption = index === selected
            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={isAnswered}
                className={`w-full text-left px-4 py-2 rounded-md border text-sm font-mono transition-colors
                  ${isAnswered && isCorrectOption ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                  ${isAnswered && isSelectedOption && !isCorrectOption ? 'border-destructive bg-destructive/10' : ''}
                  ${!isAnswered ? 'border-border hover:bg-muted cursor-pointer' : 'cursor-default'}
                `}
              >
                <span className="flex items-center gap-2">
                  {isAnswered && isCorrectOption && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                  {isAnswered && isSelectedOption && !isCorrectOption && <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                  {option}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground text-right">
          Score: {score} correct
        </p>
      </CardContent>
    </Card>
  )
}
