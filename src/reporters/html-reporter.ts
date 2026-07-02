import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { Reporter } from './reporter.interface.js'
import type { ReportContext } from './report-context.js'
import { renderTimelineChart } from './svg-chart.js'

export class HtmlReporter implements Reporter {
  constructor(private readonly outputPath: string) {}

  async report(context: ReportContext): Promise<void> {
    await mkdir(dirname(this.outputPath), { recursive: true })
    await writeFile(this.outputPath, renderHtml(context), 'utf-8')
  }
}

function renderHtml(context: ReportContext): string {
  const { scenarioName, summary, thresholdResult, narrative } = context
  const statusColor = thresholdResult.passed ? '#34c759' : '#ff3b30'
  const statusLabel = thresholdResult.passed ? 'PASS' : 'FAIL'

  const violationsHtml = thresholdResult.violations
    .map((v) => `<li>${v.metric}: ${v.actual.toFixed(2)} exceeds limit ${v.limit}</li>`)
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Load test report — ${escapeHtml(scenarioName)}</title>
<style>
  body { background: #000; color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; max-width: 820px; margin: 0 auto; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-weight: 600; font-size: 13px; background: ${statusColor}22; color: ${statusColor}; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  td, th { text-align: left; padding: 8px 0; border-bottom: 1px solid #2a2a2a; font-size: 14px; }
  th { color: #86868b; font-weight: 500; }
  .narrative { background: #111; border: 1px solid #2a2a2a; border-radius: 12px; padding: 16px; font-size: 14px; line-height: 1.5; color: #86868b; }
  ul { color: ${statusColor}; font-size: 13px; }
</style>
</head>
<body>
  <h1>${escapeHtml(scenarioName)}</h1>
  <span class="status">${statusLabel}</span>
  ${renderTimelineChart(summary.timeline)}
  <table>
    <tr><th>Total requests</th><td>${summary.totalRequests}</td></tr>
    <tr><th>Errors</th><td>${summary.totalErrors} (${(summary.errorRate * 100).toFixed(2)}%)</td></tr>
    <tr><th>Duration</th><td>${summary.durationSeconds.toFixed(1)}s</td></tr>
    <tr><th>Throughput</th><td>${summary.throughputPerSecond.toFixed(2)} req/s</td></tr>
    <tr><th>p50 / p90 / p95 / p99 latency</th><td>${summary.latency.p50.toFixed(0)} / ${summary.latency.p90.toFixed(0)} / ${summary.latency.p95.toFixed(0)} / ${summary.latency.p99.toFixed(0)} ms</td></tr>
  </table>
  ${violationsHtml ? `<ul>${violationsHtml}</ul>` : ''}
  <div class="narrative">${escapeHtml(narrative)}</div>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char)
}
