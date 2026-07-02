import type { TimeBucket } from '../metrics/types.js'

interface Series {
  readonly label: string
  readonly color: string
  readonly values: readonly number[]
}

const WIDTH = 760
const HEIGHT = 220
const PADDING = 32

/** Renders a dependency-free SVG line chart, normalizing each series to its own 0..max range. */
export function renderTimelineChart(timeline: readonly TimeBucket[]): string {
  if (timeline.length === 0) {
    return '<p>No timeline data.</p>'
  }

  const series: Series[] = [
    { label: 'req/s', color: '#2997ff', values: timeline.map((b) => b.requestCount) },
    { label: 'avg latency (ms)', color: '#f5a623', values: timeline.map((b) => b.avgLatencyMs) },
  ]

  const plotWidth = WIDTH - PADDING * 2
  const plotHeight = HEIGHT - PADDING * 2
  const stepX = timeline.length > 1 ? plotWidth / (timeline.length - 1) : 0

  const paths = series.map((s) => {
    const max = Math.max(1, ...s.values)
    const points = s.values.map((value, i) => {
      const x = PADDING + i * stepX
      const y = PADDING + plotHeight - (value / max) * plotHeight
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    return `<polyline fill="none" stroke="${s.color}" stroke-width="2" points="${points.join(' ')}" />`
  })

  const legend = series
    .map((s, i) => `<circle cx="${PADDING + i * 160}" cy="${HEIGHT - 6}" r="4" fill="${s.color}" /><text x="${PADDING + i * 160 + 10}" y="${HEIGHT - 2}" font-size="11" fill="#86868b">${s.label}</text>`)
    .join('')

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" role="img" aria-label="Load test timeline">
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="#111111" rx="12" />
  ${paths.join('\n  ')}
  ${legend}
</svg>`
}
