import { describe, it, expect } from 'vitest'
import { transpose } from '../transpose'

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
})
