import { describe, it, expect } from 'vitest'
import { transpose, formatRx } from '../index'

describe('transpose', () => {
  it('transposes basic negative cylinder prescription', () => {
    expect(transpose({ sphere: -2, cylinder: -1, axis: 180 })).toEqual({
      sphere: -3,
      cylinder: 1,
      axis: 90,
    })
  })

  it('axis 90 returns 180, not 0', () => {
    expect(transpose({ sphere: 0, cylinder: -0.5, axis: 90 })).toEqual({
      sphere: -0.5,
      cylinder: 0.5,
      axis: 180,
    })
  })

  it('axis < 90 adds 90', () => {
    expect(transpose({ sphere: 1, cylinder: -1, axis: 45 })).toEqual({
      sphere: 0,
      cylinder: 1,
      axis: 135,
    })
  })

  it('axis > 90 subtracts 90', () => {
    expect(transpose({ sphere: -1.5, cylinder: -0.75, axis: 135 })).toEqual({
      sphere: -2.25,
      cylinder: 0.75,
      axis: 45,
    })
  })

  it('cylinder 0 does not produce negative zero', () => {
    const result = transpose({ sphere: 1, cylinder: 0, axis: 90 })
    expect(Object.is(result.cylinder, -0)).toBe(false)
    expect(result.cylinder).toBe(0)
  })
})

describe('formatRx', () => {
  it('formats positive sphere with sign', () => {
    expect(formatRx({ sphere: 1, cylinder: -0.5, axis: 90 })).toBe('+1.00 -0.50 x 090')
  })

  it('formats negative sphere', () => {
    expect(formatRx({ sphere: -2.25, cylinder: 0.75, axis: 45 })).toBe('-2.25 +0.75 x 045')
  })

  it('pads axis to 3 digits', () => {
    expect(formatRx({ sphere: 0, cylinder: -1, axis: 5 })).toBe('+0.00 -1.00 x 005')
  })
})
