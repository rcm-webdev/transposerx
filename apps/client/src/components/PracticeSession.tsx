import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { BookOpen, FlipHorizontal, CheckCircle2, XCircle } from 'lucide-react'
import type { PracticeQuestion, PracticeSubmitResult } from '@transposerx/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function PracticeSession() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([])
  const [result, setResult] = useState<PracticeSubmitResult | null>(null)
  const [lastCorrectIndex, setLastCorrectIndex] = useState<number | null>(null)

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['practice-session'],
    queryFn: api.practice.createSession,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const checkMutation = useMutation({
    mutationFn: api.practice.checkAnswer,
  })

  const submitMutation = useMutation({
    mutationFn: api.practice.submitSession,
    onSuccess: (data) => setResult(data),
  })

  if (isLoading) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !session) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Failed to load practice session. Please try again.
        </CardContent>
      </Card>
    )
  }

  const questions: PracticeQuestion[] = session.questions

  if (result) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <p className="text-xl font-bold">Session Complete</p>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-4xl font-bold">{result.score} / {result.total}</p>
          <p className="text-muted-foreground">
            {result.score === result.total ? 'Perfect score!' : result.score >= 7 ? 'Great work.' : 'Keep practicing.'}
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

  const handleSelect = (index: number) => {
    if (isAnswered || checkMutation.isPending) return
    setSelected(index)

    const newAnswers = [...answers, { questionId: q.id, selectedIndex: index }]
    setAnswers(newAnswers)

    checkMutation.mutate(
      { sessionId: session.sessionId, questionId: q.id, selectedIndex: index },
      {
        onSuccess: (checkResult) => {
          setLastCorrectIndex(checkResult.correctIndex)
          const correct = checkResult.correct
          const newScore = correct ? score + 1 : score

          setTimeout(() => {
            if (current + 1 >= questions.length) {
              setScore(newScore)
              submitMutation.mutate({ sessionId: session.sessionId, answers: newAnswers })
            } else {
              if (correct) setScore(newScore)
              setCurrent(c => c + 1)
              setSelected(null)
              setLastCorrectIndex(null)
            }
          }, 1000)
        },
      },
    )
  }

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
            const isCorrectOption = lastCorrectIndex !== null && index === lastCorrectIndex
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
