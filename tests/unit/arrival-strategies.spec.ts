import { describe, expect, it } from 'vitest'
import { ConstantArrivalStrategy } from '../../src/engine/strategies/constant-strategy.js'
import { RampArrivalStrategy } from '../../src/engine/strategies/ramp-strategy.js'
import { SpikeArrivalStrategy } from '../../src/engine/strategies/spike-strategy.js'
import { createArrivalStrategy } from '../../src/engine/strategies/strategy-factory.js'
import type { Stage } from '../../src/config/scenario-schema.js'

function stage(overrides: Partial<Stage> = {}): Stage {
  return { strategy: 'constant', durationSeconds: 30, arrivalRate: 5, ...overrides }
}

describe('ConstantArrivalStrategy', () => {
  it('returns the same rate regardless of elapsed time', () => {
    const strategy = new ConstantArrivalStrategy()
    expect(strategy.arrivalRateAt(0, stage())).toBe(5)
    expect(strategy.arrivalRateAt(29, stage())).toBe(5)
  })
})

describe('RampArrivalStrategy', () => {
  it('starts at arrivalRate and ends at targetArrivalRate', () => {
    const strategy = new RampArrivalStrategy()
    const s = stage({ arrivalRate: 5, targetArrivalRate: 25, durationSeconds: 20 })
    expect(strategy.arrivalRateAt(0, s)).toBe(5)
    expect(strategy.arrivalRateAt(20, s)).toBe(25)
    expect(strategy.arrivalRateAt(10, s)).toBe(15)
  })

  it('clamps beyond the stage duration', () => {
    const strategy = new RampArrivalStrategy()
    const s = stage({ arrivalRate: 5, targetArrivalRate: 25, durationSeconds: 20 })
    expect(strategy.arrivalRateAt(999, s)).toBe(25)
  })
})

describe('SpikeArrivalStrategy', () => {
  it('holds baseline outside the middle third and spikes during it', () => {
    const strategy = new SpikeArrivalStrategy()
    const s = stage({ arrivalRate: 5, targetArrivalRate: 50, durationSeconds: 30 })
    expect(strategy.arrivalRateAt(5, s)).toBe(5)
    expect(strategy.arrivalRateAt(15, s)).toBe(50)
    expect(strategy.arrivalRateAt(25, s)).toBe(5)
  })
})

describe('createArrivalStrategy', () => {
  it('creates the strategy matching stage.strategy', () => {
    expect(createArrivalStrategy(stage({ strategy: 'constant' }))).toBeInstanceOf(ConstantArrivalStrategy)
    expect(createArrivalStrategy(stage({ strategy: 'ramp' }))).toBeInstanceOf(RampArrivalStrategy)
    expect(createArrivalStrategy(stage({ strategy: 'spike' }))).toBeInstanceOf(SpikeArrivalStrategy)
  })
})
