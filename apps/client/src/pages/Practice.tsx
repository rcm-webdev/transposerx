import { Navbar } from '@/components/Navbar'
import { PracticeSession } from '@/components/PracticeSession'

export default function Practice() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Practice Mode</h1>
          <p className="text-muted-foreground text-sm mt-1">
            10 questions — concept recall and transposition drills
          </p>
        </div>
        <PracticeSession />
      </main>
    </div>
  )
}
