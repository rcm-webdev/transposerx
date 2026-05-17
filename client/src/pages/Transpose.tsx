import { Navbar } from '@/components/Navbar'
import { TransposeForm } from '@/components/TransposeForm'

export default function Transpose() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Transpose Rx</h1>
        <TransposeForm />
      </main>
    </div>
  )
}
