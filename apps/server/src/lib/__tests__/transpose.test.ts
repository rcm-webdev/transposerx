import { describe, it, expect } from 'vitest'
import { transpose } from '@transposerx/utils'

describe('transpose (smoke test via @transposerx/utils)', () => {
  it('transposes basic negative cylinder prescription', () => {
    expect(transpose({ sphere: -2, cylinder: -1, axis: 180 })).toEqual({
      sphere: -3,
      cylinder: 1,
      axis: 90,
    })
  })
})
