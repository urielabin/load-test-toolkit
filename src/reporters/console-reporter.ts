import type { Reporter } from './reporter.interface.js'
import type { ReportContext } from './report-context.js'

export class ConsoleReporter implements Reporter {
  report(context: ReportContext): void {
    const { scenarioName, summary, thresholdResult, narrative } = context

    console.log(`\n${scenarioName}`)
    console.log('-'.repeat(scenarioName.length))
    console.log(`Requests:    ${summary.totalRequests} (${summary.totalErrors} errors, ${(summary.errorRate * 100).toFixed(2)}%)`)
    console.log(`Duration:    ${summary.durationSeconds.toFixed(1)}s`)
    console.log(`Throughput:  ${summary.throughputPerSecond.toFixed(2)} req/s`)
    console.log('Latency (ms):')
    console.log(`  min=${summary.latency.min.toFixed(0)} mean=${summary.latency.mean.toFixed(0)} p50=${summary.latency.p50.toFixed(0)} p90=${summary.latency.p90.toFixed(0)} p95=${summary.latency.p95.toFixed(0)} p99=${summary.latency.p99.toFixed(0)} max=${summary.latency.max.toFixed(0)}`)

    console.log(`\n${thresholdResult.passed ? 'PASS' : 'FAIL'} thresholds`)
    for (const violation of thresholdResult.violations) {
      console.log(`  ✗ ${violation.metric}: ${violation.actual.toFixed(2)} > ${violation.limit}`)
    }

    console.log(`\n${narrative}\n`)
  }
}
