export interface TransposeInput {
  sphere: number
  cylinder: number
  axis: number
}

export interface TransposeResult {
  sphere: number
  cylinder: number
  axis: number
}

export function transpose({ sphere, cylinder, axis }: TransposeInput): TransposeResult {
  const newAxis = (axis + 90) % 180
  return {
    sphere: Math.round((sphere + cylinder) * 100) / 100,
    cylinder: Math.round(cylinder * -1 * 100) / 100,
    axis: newAxis === 0 ? 180 : newAxis,
  }
}
