import { describe, expect, it } from 'vitest'
import { TemplatedNarrativeGenerator } from '../../src/ai/templated-narrative-generator.js'
import type { MetricsSummary } from '../../src/metrics/types.js'

const summary: MetricsSummary = {
  totalRequests: 200,
  totalErrors: 0,
  errorRate: 0,
  durationSeconds: 20,
  throughputPerSecond: 10,
  latency: { min: 5, max: 300, mean: 80, p50: 70, p90: 150, p95: 200, p99: 280 },
  timeline: [],
}

describe('TemplatedNarrativeGenerator', () => {
  it('mentions pass when thresholds are satisfied', async () => {
    const narrative = await new TemplatedNarrativeGenerator().generate({
      scenarioName: 'checkout flow',
      summary,
      thresholdResult: { passed: true, violations: [] },
    })
    expect(narrative).toContain('checkout flow')
    expect(narrative).toContain('within all declared thresholds')
    expect(narrative).toContain('No request failures were observed')
  })

  it('mentions failures and breach when thresholds fail', async () => {
    const failingSummary = { ...summary, errorRate: 0.25 }
    const narrative = await new TemplatedNarrativeGenerator().generate({
      scenarioName: 'checkout flow',
      summary: failingSummary,
      thresholdResult: { passed: false, violations: [{ metric: 'maxErrorRate', limit: 0.05, actual: 0.25 }] },
    })
    expect(narrative).toContain('breached')
    expect(narrative).toContain('25.0% of requests failed')
  })
})
