import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { LessonWithProgress } from '@/lib/api'

const statusConfig = {
  completed: { icon: CheckCircle2, label: 'Completed', variant: 'default' as const, color: 'text-green-600' },
  started: { icon: BookOpen, label: 'In Progress', variant: 'secondary' as const, color: 'text-yellow-600' },
  not_started: { icon: Circle, label: 'Not Started', variant: 'outline' as const, color: 'text-muted-foreground' },
}

const defaultStatus = statusConfig.not_started

export function LessonCard({ lesson }: { lesson: LessonWithProgress }) {
  const { icon: Icon, label, variant, color } = statusConfig[lesson.status] ?? defaultStatus

  return (
    <Link to={`/lessons/${lesson.slug}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-5">{lesson.order}</span>
            <span className="font-medium">{lesson.title}</span>
          </div>
          <Badge variant={variant} className="flex items-center gap-1">
            <Icon className={`h-3 w-3 ${color}`} />
            {label}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
