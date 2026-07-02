import type { Stage } from '../../config/scenario-schema.js'
import type { ArrivalStrategy } from './arrival-strategy.interface.js'

export class ConstantArrivalStrategy implements ArrivalStrategy {
  arrivalRateAt(_elapsedSeconds: number, stage: Stage): number {
    return stage.arrivalRate
  }
}
