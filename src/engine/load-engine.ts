import type { Scenario, Stage } from '../config/scenario-schema.js'
import type { MetricsCollector } from '../metrics/metrics-collector.js'
import { executeRequestStep } from './http-client.js'
import { createArrivalStrategy } from './strategies/strategy-factory.js'

const SCHEDULER_TICK_MS = 200

export interface LoadEngineOptions {
  onStageStart?: (stage: Stage, index: number) => void
}

/** Runs a virtual user through the scenario's request steps once, sequentially. */
async function runVirtualUserIteration(scenario: Scenario, collector: MetricsCollector): Promise<void> {
  for (const step of scenario.requests) {
    const result = await executeRequestStep(scenario.baseUrl, step)
    collector.record(result)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Drives a scenario stage-by-stage: an ArrivalStrategy (Strategy pattern)
 * says how many virtual users/sec should be arriving at a given moment; the
 * engine integrates that rate over a fixed tick interval and spawns VUs
 * accordingly, tracking in-flight iterations so the run can drain cleanly.
 */
export class LoadEngine {
  private readonly inFlight = new Set<Promise<void>>()

  async run(scenario: Scenario, collector: MetricsCollector, options: LoadEngineOptions = {}): Promise<void> {
    for (const [index, stage] of scenario.stages.entries()) {
      options.onStageStart?.(stage, index)
      await this.runStage(scenario, stage, collector)
    }
    await Promise.all(this.inFlight)
  }

  private async runStage(scenario: Scenario, stage: Stage, collector: MetricsCollector): Promise<void> {
    const strategy = createArrivalStrategy(stage)
    const stageStartMs = Date.now()
    const durationMs = stage.durationSeconds * 1000
    let arrivalAccumulator = 0

    while (Date.now() - stageStartMs < durationMs) {
      const elapsedSeconds = (Date.now() - stageStartMs) / 1000
      const rate = strategy.arrivalRateAt(elapsedSeconds, stage)
      arrivalAccumulator += rate * (SCHEDULER_TICK_MS / 1000)

      const toSpawn = Math.floor(arrivalAccumulator)
      arrivalAccumulator -= toSpawn

      for (let i = 0; i < toSpawn; i++) {
        this.spawnVirtualUser(scenario, collector)
      }

      await sleep(SCHEDULER_TICK_MS)
    }
  }

  private spawnVirtualUser(scenario: Scenario, collector: MetricsCollector): void {
    const iteration = runVirtualUserIteration(scenario, collector).finally(() => {
      this.inFlight.delete(iteration)
    })
    this.inFlight.add(iteration)
  }
}
