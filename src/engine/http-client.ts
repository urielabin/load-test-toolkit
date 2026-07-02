import type { RequestStep } from '../config/scenario-schema.js'
import type { RequestResult } from '../metrics/types.js'

/** Executes one request step against baseUrl and turns the outcome into a RequestResult, never throwing. */
export async function executeRequestStep(baseUrl: string, step: RequestStep): Promise<RequestResult> {
  const startedAtMs = Date.now()
  const requestName = step.name ?? `${step.method} ${step.path}`

  try {
    const response = await fetch(new URL(step.path, baseUrl), {
      method: step.method,
      headers: step.headers,
      body: step.body === undefined ? undefined : JSON.stringify(step.body),
    })
    // Draining the body ensures the connection is freed before we report timing.
    await response.arrayBuffer()

    return {
      timestampMs: startedAtMs,
      latencyMs: Date.now() - startedAtMs,
      success: response.ok,
      statusCode: response.status,
      requestName,
    }
  } catch (error) {
    return {
      timestampMs: startedAtMs,
      latencyMs: Date.now() - startedAtMs,
      success: false,
      statusCode: null,
      requestName,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
