import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createFixtureApp } from '../fixtures/app.js'
import { runScenario } from '../../src/run-scenario.js'
import type { Scenario } from '../../src/config/scenario-schema.js'
import type { ReportContext } from '../../src/reporters/report-context.js'
import type { Reporter } from '../../src/reporters/reporter.interface.js'

class CapturingReporter implements Reporter {
  context: ReportContext | undefined
  report(context: ReportContext): void {
    this.context = context
  }
}

describe('runScenario (real HTTP, no mocking)', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    server = createFixtureApp().listen(0)
    await new Promise<void>((resolve) => server.once('listening', resolve))
    const { port } = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterAll(() => {
    server.close()
  })

  it('drives real load against a healthy endpoint and passes thresholds', async () => {
    const scenario: Scenario = {
      name: 'health check load',
      baseUrl,
      requests: [{ method: 'GET', path: '/health' }],
      stages: [{ strategy: 'constant', durationSeconds: 2, arrivalRate: 15 }],
      thresholds: { p95LatencyMs: 500, maxErrorRate: 0.01 },
    }

    const reporter = new CapturingReporter()
    const { passed } = await runScenario(scenario, [reporter])

    expect(passed).toBe(true)
    expect(reporter.context?.summary.totalRequests).toBeGreaterThan(10)
    expect(reporter.context?.summary.totalErrors).toBe(0)
    expect(reporter.context?.narrative).toBeTruthy()
  }, 15000)

  it('fails the threshold gate against a flaky endpoint with a strict error budget', async () => {
    const scenario: Scenario = {
      name: 'flaky endpoint load',
      baseUrl,
      requests: [{ method: 'GET', path: '/flaky' }],
      stages: [{ strategy: 'constant', durationSeconds: 2, arrivalRate: 15 }],
      thresholds: { maxErrorRate: 0.001 },
    }

    const reporter = new CapturingReporter()
    const { passed } = await runScenario(scenario, [reporter])

    expect(passed).toBe(false)
    expect(reporter.context?.thresholdResult.violations[0]?.metric).toBe('maxErrorRate')
  }, 15000)

  it('captures a ramp stage as an increasing-then-steady throughput timeline', async () => {
    const scenario: Scenario = {
      name: 'ramp load',
      baseUrl,
      requests: [{ method: 'GET', path: '/slow' }],
      stages: [{ strategy: 'ramp', durationSeconds: 3, arrivalRate: 2, targetArrivalRate: 20 }],
    }

    const reporter = new CapturingReporter()
    await runScenario(scenario, [reporter])

    const timeline = reporter.context?.summary.timeline ?? []
    expect(timeline.length).toBeGreaterThan(0)
    const firstSecond = timeline[0]?.requestCount ?? 0
    const lastSecond = timeline.at(-1)?.requestCount ?? 0
    expect(lastSecond).toBeGreaterThanOrEqual(firstSecond)
  }, 15000)
})
