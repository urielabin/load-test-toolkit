import { describe, expect, it, vi } from 'vitest'
import { MetricsCollector } from '../../src/metrics/metrics-collector.js'
import type { RequestResult } from '../../src/metrics/types.js'

function makeResult(overrides: Partial<RequestResult> = {}): RequestResult {
  return {
    timestampMs: Date.now(),
    latencyMs: 100,
    success: true,
    statusCode: 200,
    requestName: 'GET /',
    ...overrides,
  }
}

describe('MetricsCollector', () => {
  it('summarizes zero requests without dividing by zero', () => {
    const collector = new MetricsCollector()
    const summary = collector.summarize()

    expect(summary.totalRequests).toBe(0)
    expect(summary.errorRate).toBe(0)
    expect(summary.throughputPerSecond).toBe(0)
    expect(summary.latency.p95).toBe(0)
  })

  it('computes error rate and totals correctly', () => {
    const collector = new MetricsCollector()
    collector.record(makeResult({ success: true }))
    collector.record(makeResult({ success: true }))
    collector.record(makeResult({ success: false, statusCode: 500 }))

    const summary = collector.summarize()
    expect(summary.totalRequests).toBe(3)
    expect(summary.totalErrors).toBe(1)
    expect(summary.errorRate).toBeCloseTo(1 / 3)
  })

  it('emits a sample event per recorded result', () => {
    const collector = new MetricsCollector()
    const listener = vi.fn()
    collector.on('sample', listener)

    collector.record(makeResult())
    collector.record(makeResult())

    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('computes latency percentiles across recorded results', () => {
    const collector = new MetricsCollector()
    for (const latencyMs of [10, 20, 30, 40, 50]) {
      collector.record(makeResult({ latencyMs }))
    }

    const summary = collector.summarize()
    expect(summary.latency.min).toBe(10)
    expect(summary.latency.max).toBe(50)
    expect(summary.latency.p50).toBe(30)
  })
})
