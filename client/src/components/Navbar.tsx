import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, LayoutDashboard, FlipHorizontal, Brain, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'

export function Navbar() {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="border-b bg-background">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="font-bold text-lg tracking-tight">
          TransposerX
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/transpose">
              <FlipHorizontal className="h-4 w-4 mr-1" />
              Transpose
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/lessons">
              <BookOpen className="h-4 w-4 mr-1" />
              Lessons
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/practice">
              <Brain className="h-4 w-4 mr-1" />
              Practice
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  )
}
