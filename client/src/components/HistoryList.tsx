import { ArrowRight } from 'lucide-react'
import type { TranspositionRecord } from '@/lib/api'

function formatVal(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}`
}

export function HistoryList({ records }: { records: TranspositionRecord[] }) {
  if (records.length === 0) {
    return <p className="text-sm text-muted-foreground">No transpositions yet.</p>
  }

  return (
    <div className="space-y-1">
      {records.map(r => (
        <div key={r.id} className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
          <span>{r.eye}:</span>
          <span>{`${formatVal(r.inputSphere)} ${formatVal(r.inputCylinder)} x ${String(r.inputAxis).padStart(3,'0')}`}</span>
          <ArrowRight className="h-3 w-3 shrink-0" />
          <span>{`${formatVal(r.outSphere)} ${formatVal(r.outCylinder)} x ${String(r.outAxis).padStart(3,'0')}`}</span>
        </div>
      ))}
    </div>
  )
}
