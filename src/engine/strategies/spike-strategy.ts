import type { Stage } from '../../config/scenario-schema.js'
import type { ArrivalStrategy } from './arrival-strategy.interface.js'

/** Holds baseline arrivalRate, spikes to targetArrivalRate for the middle third of the stage, then returns to baseline. */
export class SpikeArrivalStrategy implements ArrivalStrategy {
  arrivalRateAt(elapsedSeconds: number, stage: Stage): number {
    const target = stage.targetArrivalRate ?? stage.arrivalRate * 4
    const third = stage.durationSeconds / 3
    const isDuringSpike = elapsedSeconds >= third && elapsedSeconds < third * 2
    return isDuringSpike ? target : stage.arrivalRate
  }
}
