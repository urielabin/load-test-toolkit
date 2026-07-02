import type { MetricsSummary } from '../metrics/types.js'
import type { ThresholdResult } from '../thresholds/threshold-evaluator.js'

export interface ReportContext {
  readonly scenarioName: string
  readonly summary: MetricsSummary
  readonly thresholdResult: ThresholdResult
  readonly narrative: string
}
