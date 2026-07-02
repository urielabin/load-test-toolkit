import { describe, expect, it } from 'vitest'
import { percentile } from '../../src/metrics/percentiles.js'

describe('percentile', () => {
  it('returns 0 for an empty array', () => {
    expect(percentile([], 95)).toBe(0)
  })

  it('returns the single value for a one-element array', () => {
    expect(percentile([42], 50)).toBe(42)
  })

  it('returns the min at p0 and max at p100', () => {
    const values = [10, 20, 30, 40, 50]
    expect(percentile(values, 0)).toBe(10)
    expect(percentile(values, 100)).toBe(50)
  })

  it('interpolates between ranks', () => {
    const values = [10, 20, 30, 40]
    // rank = 0.5 * 3 = 1.5 -> between index 1 (20) and 2 (30)
    expect(percentile(values, 50)).toBe(25)
  })

  it('matches a known p95 on a larger sorted sample', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1) // 1..100
    expect(percentile(values, 95)).toBeCloseTo(95.05, 1)
  })
})
