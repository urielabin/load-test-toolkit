import type { NarrativeGenerator, NarrativeInput } from './narrative-generator.interface.js'
import { TemplatedNarrativeGenerator } from './templated-narrative-generator.js'

/**
 * Optional enhancement layer: if ANTHROPIC_API_KEY is set, asks Claude to
 * interpret the run's metrics in plain English (call out bottlenecks,
 * relate error rate to the stage that produced it, etc). Falls back to the
 * templated generator on any failure, so a flaky/misconfigured key never
 * breaks a report.
 */
export class ClaudeNarrativeGenerator implements NarrativeGenerator {
  private readonly fallback = new TemplatedNarrativeGenerator()

  constructor(private readonly apiKey: string) {}

  async generate(input: NarrativeInput): Promise<string> {
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey: this.apiKey })

      const message = await client.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `You are analyzing a load test result. Write a 3-4 sentence plain-English summary for an engineer, calling out anything concerning (high latency, error spikes, threshold breaches). Be specific with the numbers given.\n\n${JSON.stringify(input, null, 2)}`,
          },
        ],
      })

      const textBlock = message.content.find((block) => block.type === 'text')
      return textBlock && 'text' in textBlock ? textBlock.text.trim() : await this.fallback.generate(input)
    } catch {
      return this.fallback.generate(input)
    }
  }
}
