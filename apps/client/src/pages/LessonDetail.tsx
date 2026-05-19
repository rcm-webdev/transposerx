import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { Navbar } from '@/components/Navbar'
import { QuizComponent } from '@/components/QuizComponent'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import Lesson1, { frontmatter as fm1 } from '../../content/lessons/01-what-is-cylinder.mdx'
import Lesson2, { frontmatter as fm2 } from '../../content/lessons/02-what-is-axis.mdx'
import Lesson3, { frontmatter as fm3 } from '../../content/lessons/03-why-transposition-matters.mdx'
import Lesson4, { frontmatter as fm4 } from '../../content/lessons/04-when-to-use-each-format.mdx'

const LESSON_MODULES: Record<string, { Component: React.ComponentType; frontmatter: typeof fm1 }> = {
  'what-is-cylinder': { Component: Lesson1, frontmatter: fm1 },
  'what-is-axis': { Component: Lesson2, frontmatter: fm2 },
  'why-transposition-matters': { Component: Lesson3, frontmatter: fm3 },
  'when-to-use-each-format': { Component: Lesson4, frontmatter: fm4 },
}

export default function LessonDetail() {
  const { slug } = useParams<{ slug: string }>()
  const queryClient = useQueryClient()
  const module = slug ? LESSON_MODULES[slug] : null

  const { data: lessons, isLoading: lessonsLoading } = useQuery({ queryKey: ['lessons'], queryFn: api.lessons.list })
  const lesson = lessons?.find(l => l.slug === slug)

  const startMutation = useMutation({
    mutationFn: () => api.lessons.start(slug!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  })

  const completeMutation = useMutation({
    mutationFn: () => api.lessons.complete(slug!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  })

  useEffect(() => {
    if (slug) startMutation.mutate()
  }, [slug])

  if (!module) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-muted-foreground">Lesson not found.</p>
        </main>
      </div>
    )
  }

  const { Component, frontmatter } = module

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Link to="/lessons" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            <ChevronLeft className="h-4 w-4" />
            Lessons
          </Link>
          {lessonsLoading ? (
            <Skeleton className="h-5 w-20 rounded-full" />
          ) : lesson ? (
            <Badge variant={lesson.status === 'completed' ? 'default' : 'secondary'}>
              {lesson.status === 'completed' ? 'Completed' : lesson.status === 'started' ? 'In Progress' : 'Not Started'}
            </Badge>
          ) : null}
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <Component />
        </div>

        {frontmatter?.quiz?.[0] && (
          <QuizComponent
            question={frontmatter.quiz[0]}
            onCorrect={() => {
              if (lesson?.status !== 'completed') completeMutation.mutate()
            }}
          />
        )}
      </main>
    </div>
  )
}
