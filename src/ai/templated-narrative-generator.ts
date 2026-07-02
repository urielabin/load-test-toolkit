import type { NarrativeGenerator, NarrativeInput } from './narrative-generator.interface.js'

/** Zero-cost fallback: a deterministic, templated summary — always available, no API key required. */
export class TemplatedNarrativeGenerator implements NarrativeGenerator {
  async generate({ scenarioName, summary, thresholdResult }: NarrativeInput): Promise<string> {
    const status = thresholdResult.passed ? 'stayed within all declared thresholds' : 'breached one or more declared thresholds'
    const errorNote = summary.errorRate > 0
      ? ` ${(summary.errorRate * 100).toFixed(1)}% of requests failed.`
      : ' No request failures were observed.'

    return `"${scenarioName}" sent ${summary.totalRequests} requests over ${summary.durationSeconds.toFixed(0)}s `
      + `(${summary.throughputPerSecond.toFixed(1)} req/s average), with p95 latency of ${summary.latency.p95.toFixed(0)}ms `
      + `and p99 of ${summary.latency.p99.toFixed(0)}ms. The run ${status}.${errorNote}`
  }
}
