import type { Thresholds } from '../config/scenario-schema.js'
import type { MetricsSummary } from '../metrics/types.js'

export interface ThresholdViolation {
  readonly metric: string
  readonly limit: number
  readonly actual: number
}

export interface ThresholdResult {
  readonly passed: boolean
  readonly violations: readonly ThresholdViolation[]
}

/** Pure function: compares a run's metrics against the scenario's declared thresholds (a CI pass/fail gate). */
export function evaluateThresholds(summary: MetricsSummary, thresholds: Thresholds | undefined): ThresholdResult {
  if (!thresholds) {
    return { passed: true, violations: [] }
  }

  const violations: ThresholdViolation[] = []

  if (thresholds.p95LatencyMs !== undefined && summary.latency.p95 > thresholds.p95LatencyMs) {
    violations.push({ metric: 'p95LatencyMs', limit: thresholds.p95LatencyMs, actual: summary.latency.p95 })
  }
  if (thresholds.p99LatencyMs !== undefined && summary.latency.p99 > thresholds.p99LatencyMs) {
    violations.push({ metric: 'p99LatencyMs', limit: thresholds.p99LatencyMs, actual: summary.latency.p99 })
  }
  if (thresholds.maxErrorRate !== undefined && summary.errorRate > thresholds.maxErrorRate) {
    violations.push({ metric: 'maxErrorRate', limit: thresholds.maxErrorRate, actual: summary.errorRate })
  }

  return { passed: violations.length === 0, violations }
}
