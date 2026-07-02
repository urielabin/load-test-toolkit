import { readFile } from 'node:fs/promises'
import { parse } from 'yaml'
import { scenarioSchema, type Scenario } from './scenario-schema.js'

export async function loadScenario(filePath: string): Promise<Scenario> {
  const raw = await readFile(filePath, 'utf-8')
  const parsed = parse(raw)
  return scenarioSchema.parse(parsed)
}
