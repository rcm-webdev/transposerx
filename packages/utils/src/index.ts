import type { TransposeInput, TransposeResult } from '@transposerx/types'

export function transpose({ sphere, cylinder, axis }: TransposeInput): TransposeResult {
  const newAxis = (axis + 90) % 180
  return {
    sphere: Math.round((sphere + cylinder) * 100) / 100,
    cylinder: Math.round(cylinder * -1 * 100) / 100 || 0,
    axis: newAxis === 0 ? 180 : newAxis,
  }
}

export function formatRx(result: TransposeResult): string {
  const sph = `${result.sphere >= 0 ? '+' : ''}${result.sphere.toFixed(2)}`
  const cyl = `${result.cylinder >= 0 ? '+' : ''}${result.cylinder.toFixed(2)}`
  const axis = String(result.axis).padStart(3, '0')
  return `${sph} ${cyl} x ${axis}`
}
