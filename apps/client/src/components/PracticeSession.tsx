import { BookOpen, FlipHorizontal, CheckCircle2, XCircle } from 'lucide-react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function PracticeSession() {
  const {
    current,
    selected,
    score,
    result,
    lastCheckCorrect,
    question,
    questions,
    isLoading,
    error,
    selectAnswer,
    restart,
  } = usePracticeSession()

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

  if (error) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Failed to load practice session. Please try again.
        </CardContent>
      </Card>
    )
  }

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
          <Button onClick={restart} className="w-full">
            Start New Session
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!question) return null

  const hasSelected = selected !== null
  const isAnswered = lastCheckCorrect !== null

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {current + 1} of {questions.length}
          </span>
          <Badge variant="outline" className="gap-1">
            {question.type === 'concept'
              ? <><BookOpen className="h-3 w-3" /> Concept</>
              : <><FlipHorizontal className="h-3 w-3" /> Transposition Drill</>
            }
          </Badge>
        </div>
        <Progress value={((current) / questions.length) * 100} />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium font-mono text-sm">{question.question}</p>
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const isSelectedOption = index === selected
            const showCorrect = isAnswered && isSelectedOption && lastCheckCorrect === true
            const showIncorrect = isAnswered && isSelectedOption && lastCheckCorrect === false
            return (
              <button
                key={index}
                onClick={() => selectAnswer(index)}
                disabled={hasSelected}
                className={`w-full text-left px-4 py-2 rounded-md border text-sm font-mono transition-colors
                  ${showCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                  ${showIncorrect ? 'border-destructive bg-destructive/10' : ''}
                  ${!hasSelected ? 'border-border hover:bg-muted cursor-pointer' : 'cursor-default'}
                `}
              >
                <span className="flex items-center gap-2">
                  {showCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                  {showIncorrect && <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
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
