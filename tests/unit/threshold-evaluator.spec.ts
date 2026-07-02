import { describe, expect, it } from 'vitest'
import { evaluateThresholds } from '../../src/thresholds/threshold-evaluator.js'
import type { MetricsSummary } from '../../src/metrics/types.js'

function makeSummary(overrides: Partial<MetricsSummary['latency']> & { errorRate?: number } = {}): MetricsSummary {
  return {
    totalRequests: 100,
    totalErrors: 0,
    errorRate: overrides.errorRate ?? 0,
    durationSeconds: 10,
    throughputPerSecond: 10,
    latency: { min: 10, max: 500, mean: 100, p50: 90, p90: 200, p95: overrides.p95 ?? 300, p99: overrides.p99 ?? 400 },
    timeline: [],
  }
}

describe('evaluateThresholds', () => {
  it('passes when no thresholds are declared', () => {
    const result = evaluateThresholds(makeSummary(), undefined)
    expect(result.passed).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('passes when metrics are within limits', () => {
    const result = evaluateThresholds(makeSummary({ p95: 300 }), { p95LatencyMs: 500 })
    expect(result.passed).toBe(true)
  })

  it('fails and reports a violation when p95 exceeds the limit', () => {
    const result = evaluateThresholds(makeSummary({ p95: 600 }), { p95LatencyMs: 500 })
    expect(result.passed).toBe(false)
    expect(result.violations).toEqual([{ metric: 'p95LatencyMs', limit: 500, actual: 600 }])
  })

  it('fails when error rate exceeds the limit', () => {
    const result = evaluateThresholds(makeSummary({ errorRate: 0.1 }), { maxErrorRate: 0.05 })
    expect(result.passed).toBe(false)
    expect(result.violations[0]?.metric).toBe('maxErrorRate')
  })

  it('reports every violated metric, not just the first', () => {
    const result = evaluateThresholds(
      makeSummary({ p95: 600, p99: 900, errorRate: 0.2 }),
      { p95LatencyMs: 500, p99LatencyMs: 800, maxErrorRate: 0.05 },
    )
    expect(result.violations).toHaveLength(3)
  })
})
