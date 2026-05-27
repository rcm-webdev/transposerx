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
    <div className="space-y-2">
      {records.map(r => (
        <div
          key={r.id}
          className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] sm:text-xs font-mono text-muted-foreground min-w-0"
        >
          <span className="shrink-0">{r.eye}:</span>
          <span className="break-all">
            {`${formatVal(r.inputSphere)} ${formatVal(r.inputCylinder)} x ${String(r.inputAxis).padStart(3, '0')}`}
          </span>
          <ArrowRight className="h-3 w-3 shrink-0" />
          <span className="break-all">
            {`${formatVal(r.outSphere)} ${formatVal(r.outCylinder)} x ${String(r.outAxis).padStart(3, '0')}`}
          </span>
        </div>
      ))}
    </div>
  )
}
