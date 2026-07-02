import { createNarrativeGenerator } from './ai/narrative-factory.js'
import type { Scenario } from './config/scenario-schema.js'
import { LoadEngine } from './engine/load-engine.js'
import { MetricsCollector } from './metrics/metrics-collector.js'
import type { ReportContext } from './reporters/report-context.js'
import type { Reporter } from './reporters/reporter.interface.js'
import { evaluateThresholds } from './thresholds/threshold-evaluator.js'

export interface RunResult {
  readonly context: ReportContext
  readonly passed: boolean
}

/** Wires the engine, metrics, thresholds and narrative layer together, then hands the result to every reporter. */
export async function runScenario(scenario: Scenario, reporters: readonly Reporter[]): Promise<RunResult> {
  const collector = new MetricsCollector()
  const engine = new LoadEngine()

  await engine.run(scenario, collector)

  const summary = collector.summarize()
  const thresholdResult = evaluateThresholds(summary, scenario.thresholds)
  const narrative = await createNarrativeGenerator().generate({
    scenarioName: scenario.name,
    summary,
    thresholdResult,
  })

  const context: ReportContext = { scenarioName: scenario.name, summary, thresholdResult, narrative }

  for (const reporter of reporters) {
    await reporter.report(context)
  }

  return { context, passed: thresholdResult.passed }
}
