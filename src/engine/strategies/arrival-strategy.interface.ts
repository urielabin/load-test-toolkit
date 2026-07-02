import type { Stage } from '../../config/scenario-schema.js'

/**
 * An ArrivalStrategy answers a single question: at a given point in time
 * within a stage, how many new virtual users should be arriving per second?
 * The engine integrates this rate over time to decide when to spawn VUs.
 */
export interface ArrivalStrategy {
  arrivalRateAt(elapsedSeconds: number, stage: Stage): number
}
