import { useReducer } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PracticeSubmitResult } from '@transposerx/types'
import { api } from '@/lib/api'

type QuizState = {
  current: number
  selected: number | null
  score: number
  lastCheckCorrect: boolean | null
  result: PracticeSubmitResult | null
}

type QuizAction =
  | { type: 'SELECT'; index: number }
  | { type: 'CHECKED'; correct: boolean; newScore: number }
  | { type: 'ADVANCE' }
  | { type: 'FINISH'; result: PracticeSubmitResult }
  | { type: 'RESET' }

const initialState: QuizState = {
  current: 0,
  selected: null,
  score: 0,
  lastCheckCorrect: null,
  result: null,
}

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SELECT':
      return { ...state, selected: action.index }
    case 'CHECKED':
      return { ...state, lastCheckCorrect: action.correct, score: action.newScore }
    case 'ADVANCE':
      return {
        ...state,
        current: state.current + 1,
        selected: null,
        lastCheckCorrect: null,
      }
    case 'FINISH':
      return { ...state, result: action.result }
    case 'RESET':
      return initialState
  }
}

export function usePracticeSession() {
  const queryClient = useQueryClient()
  const [state, dispatch] = useReducer(quizReducer, initialState)

  const sessionQuery = useQuery({
    queryKey: ['practice-session'],
    queryFn: api.practice.createSession,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  })

  const checkMutation = useMutation({
    mutationFn: api.practice.checkAnswer,
  })

  const submitMutation = useMutation({
    mutationFn: api.practice.submitSession,
    onSuccess: (data) => dispatch({ type: 'FINISH', result: data }),
  })

  const session = sessionQuery.data
  const questions = session?.questions ?? []
  const question = questions[state.current] ?? null

  const selectAnswer = (index: number) => {
    if (state.selected !== null || checkMutation.isPending || !session || !question) return

    dispatch({ type: 'SELECT', index })

    checkMutation.mutate(
      { sessionId: session.sessionId, questionId: question.id, selectedIndex: index },
      {
        onSuccess: ({ correct }) => {
          const newScore = correct ? state.score + 1 : state.score
          dispatch({ type: 'CHECKED', correct, newScore })

          setTimeout(() => {
            if (state.current + 1 >= questions.length) {
              submitMutation.mutate({ sessionId: session.sessionId })
            } else {
              dispatch({ type: 'ADVANCE' })
            }
          }, 1000)
        },
      },
    )
  }

  const restart = () => {
    dispatch({ type: 'RESET' })
    queryClient.removeQueries({ queryKey: ['practice-session'] })
    sessionQuery.refetch()
  }

  return {
    ...state,
    question,
    questions,
    isLoading: sessionQuery.isPending,
    error: sessionQuery.error,
    isChecking: checkMutation.isPending,
    selectAnswer,
    restart,
  }
}
