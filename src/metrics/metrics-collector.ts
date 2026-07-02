import { EventEmitter } from 'node:events'
import { percentile } from './percentiles.js'
import type { MetricsSummary, RequestResult, TimeBucket } from './types.js'

interface MetricsCollectorEvents {
  sample: [RequestResult]
}

/**
 * Collects request results as they happen and emits a 'sample' event per
 * result, so live reporters (e.g. a console progress line) can subscribe
 * without coupling the engine to any particular output.
 */
export class MetricsCollector extends EventEmitter<MetricsCollectorEvents> {
  private readonly results: RequestResult[] = []
  private readonly startedAtMs = Date.now()

  record(result: RequestResult): void {
    this.results.push(result)
    this.emit('sample', result)
  }

  summarize(): MetricsSummary {
    const totalRequests = this.results.length
    const totalErrors = this.results.filter((r) => !r.success).length
    const latencies = this.results.map((r) => r.latencyMs).sort((a, b) => a - b)
    const durationSeconds = totalRequests === 0
      ? 0
      : Math.max(1, (Date.now() - this.startedAtMs) / 1000)

    return {
      totalRequests,
      totalErrors,
      errorRate: totalRequests === 0 ? 0 : totalErrors / totalRequests,
      durationSeconds,
      throughputPerSecond: totalRequests === 0 ? 0 : totalRequests / durationSeconds,
      latency: {
        min: latencies[0] ?? 0,
        max: latencies.at(-1) ?? 0,
        mean: latencies.length === 0 ? 0 : latencies.reduce((a, b) => a + b, 0) / latencies.length,
        p50: percentile(latencies, 50),
        p90: percentile(latencies, 90),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
      },
      timeline: this.buildTimeline(),
    }
  }

  private buildTimeline(): TimeBucket[] {
    if (this.results.length === 0) return []

    const buckets = new Map<number, RequestResult[]>()
    for (const result of this.results) {
      const secondOffset = Math.floor((result.timestampMs - this.startedAtMs) / 1000)
      const bucket = buckets.get(secondOffset) ?? []
      bucket.push(result)
      buckets.set(secondOffset, bucket)
    }

    const maxOffset = Math.max(...buckets.keys())
    const timeline: TimeBucket[] = []
    for (let second = 0; second <= maxOffset; second++) {
      const bucketResults = buckets.get(second) ?? []
      const errorCount = bucketResults.filter((r) => !r.success).length
      const avgLatencyMs = bucketResults.length === 0
        ? 0
        : bucketResults.reduce((sum, r) => sum + r.latencyMs, 0) / bucketResults.length

      timeline.push({
        secondOffset: second,
        requestCount: bucketResults.length,
        errorCount,
        avgLatencyMs,
      })
    }
    return timeline
  }
}
