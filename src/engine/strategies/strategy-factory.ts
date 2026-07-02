import type { Stage } from '../../config/scenario-schema.js'
import type { ArrivalStrategy } from './arrival-strategy.interface.js'
import { ConstantArrivalStrategy } from './constant-strategy.js'
import { RampArrivalStrategy } from './ramp-strategy.js'
import { SpikeArrivalStrategy } from './spike-strategy.js'

export function createArrivalStrategy(stage: Stage): ArrivalStrategy {
  switch (stage.strategy) {
    case 'constant':
      return new ConstantArrivalStrategy()
    case 'ramp':
      return new RampArrivalStrategy()
    case 'spike':
      return new SpikeArrivalStrategy()
  }
}
