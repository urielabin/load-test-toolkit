import { describe, expect, it } from 'vitest'
import { scenarioSchema } from '../../src/config/scenario-schema.js'

describe('scenarioSchema', () => {
  it('accepts a minimal valid scenario', () => {
    const result = scenarioSchema.safeParse({
      name: 'smoke',
      baseUrl: 'http://localhost:3000',
      requests: [{ path: '/health' }],
      stages: [{ strategy: 'constant', durationSeconds: 10, arrivalRate: 5 }],
    })
    expect(result.success).toBe(true)
  })

  it('defaults request method to GET', () => {
    const result = scenarioSchema.parse({
      name: 'smoke',
      baseUrl: 'http://localhost:3000',
      requests: [{ path: '/health' }],
      stages: [{ strategy: 'constant', durationSeconds: 10, arrivalRate: 5 }],
    })
    expect(result.requests[0]?.method).toBe('GET')
  })

  it('rejects a non-URL baseUrl', () => {
    const result = scenarioSchema.safeParse({
      name: 'smoke',
      baseUrl: 'not-a-url',
      requests: [{ path: '/health' }],
      stages: [{ strategy: 'constant', durationSeconds: 10, arrivalRate: 5 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty requests array', () => {
    const result = scenarioSchema.safeParse({
      name: 'smoke',
      baseUrl: 'http://localhost:3000',
      requests: [],
      stages: [{ strategy: 'constant', durationSeconds: 10, arrivalRate: 5 }],
    })
    expect(result.success).toBe(false)
  })
})
