import type { Stage } from '../../config/scenario-schema.js'
import type { ArrivalStrategy } from './arrival-strategy.interface.js'

/** Linearly interpolates from arrivalRate to targetArrivalRate over the stage duration. */
export class RampArrivalStrategy implements ArrivalStrategy {
  arrivalRateAt(elapsedSeconds: number, stage: Stage): number {
    const target = stage.targetArrivalRate ?? stage.arrivalRate
    const progress = Math.min(1, Math.max(0, elapsedSeconds / stage.durationSeconds))
    return stage.arrivalRate + (target - stage.arrivalRate) * progress
  }
}
