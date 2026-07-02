import type { MetricsSummary } from '../metrics/types.js'
import type { ThresholdResult } from '../thresholds/threshold-evaluator.js'

export interface NarrativeInput {
  readonly scenarioName: string
  readonly summary: MetricsSummary
  readonly thresholdResult: ThresholdResult
}

export interface NarrativeGenerator {
  generate(input: NarrativeInput): Promise<string>
}
