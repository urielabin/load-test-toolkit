export interface RequestResult {
  readonly timestampMs: number
  readonly latencyMs: number
  readonly success: boolean
  readonly statusCode: number | null
  readonly requestName: string
  readonly error?: string
}

export interface TimeBucket {
  readonly secondOffset: number
  readonly requestCount: number
  readonly errorCount: number
  readonly avgLatencyMs: number
}

export interface MetricsSummary {
  readonly totalRequests: number
  readonly totalErrors: number
  readonly errorRate: number
  readonly durationSeconds: number
  readonly throughputPerSecond: number
  readonly latency: {
    readonly min: number
    readonly max: number
    readonly mean: number
    readonly p50: number
    readonly p90: number
    readonly p95: number
    readonly p99: number
  }
  readonly timeline: readonly TimeBucket[]
}
