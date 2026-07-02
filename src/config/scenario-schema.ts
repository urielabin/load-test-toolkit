import { z } from 'zod'

const requestStepSchema = z.object({
  name: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
  path: z.string(),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
})

const stageSchema = z.object({
  name: z.string().optional(),
  strategy: z.enum(['constant', 'ramp', 'spike']),
  durationSeconds: z.number().positive(),
  arrivalRate: z.number().positive(),
  targetArrivalRate: z.number().positive().optional(),
})

const thresholdsSchema = z.object({
  p95LatencyMs: z.number().positive().optional(),
  p99LatencyMs: z.number().positive().optional(),
  maxErrorRate: z.number().min(0).max(1).optional(),
})

export const scenarioSchema = z.object({
  name: z.string(),
  baseUrl: z.string().url(),
  requests: z.array(requestStepSchema).min(1),
  stages: z.array(stageSchema).min(1),
  thresholds: thresholdsSchema.optional(),
})

export type RequestStep = z.infer<typeof requestStepSchema>
export type Stage = z.infer<typeof stageSchema>
export type Thresholds = z.infer<typeof thresholdsSchema>
export type Scenario = z.infer<typeof scenarioSchema>
