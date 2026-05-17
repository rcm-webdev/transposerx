import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuizQuestion {
  question: string
  options: string[]
  answer: number
}

interface QuizComponentProps {
  question: QuizQuestion
  onCorrect: () => void
}

export function QuizComponent({ question, onCorrect }: QuizComponentProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const isAnswered = selected !== null
  const isCorrect = selected === question.answer

  const handleSelect = (index: number) => {
    if (isAnswered) return
    setSelected(index)
    if (index === question.answer) {
      onCorrect()
    }
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
          Lesson Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium">{question.question}</p>
        <div className="space-y-2">
          {question.options.map((option, index) => {
            let variant: 'outline' | 'default' | 'destructive' = 'outline'
            if (isAnswered && index === question.answer) variant = 'default'
            if (isAnswered && index === selected && !isCorrect) variant = 'destructive'

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={isAnswered}
                className={`w-full text-left px-4 py-2 rounded-md border text-sm transition-colors
                  ${variant === 'default' ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' : ''}
                  ${variant === 'destructive' ? 'border-destructive bg-destructive/10 text-destructive' : ''}
                  ${variant === 'outline' ? 'border-border hover:bg-muted' : ''}
                  ${isAnswered ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                {option}
              </button>
            )
          })}
        </div>
        {isAnswered && (
          <div className={`flex items-center gap-2 text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
            {isCorrect
              ? <><CheckCircle2 className="h-4 w-4" /> Correct — lesson marked complete.</>
              : <><XCircle className="h-4 w-4" /> Not quite. The correct answer is highlighted above.</>
            }
          </div>
        )}
      </CardContent>
    </Card>
  )
}
