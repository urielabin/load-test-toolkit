import type { NarrativeGenerator } from './narrative-generator.interface.js'
import { ClaudeNarrativeGenerator } from './claude-narrative-generator.js'
import { TemplatedNarrativeGenerator } from './templated-narrative-generator.js'

export function createNarrativeGenerator(): NarrativeGenerator {
  const apiKey = process.env['ANTHROPIC_API_KEY']
  return apiKey ? new ClaudeNarrativeGenerator(apiKey) : new TemplatedNarrativeGenerator()
}
