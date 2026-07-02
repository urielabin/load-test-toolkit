#!/usr/bin/env node
import { Command } from 'commander'
import { loadScenario } from '../config/load-scenario.js'
import { ConsoleReporter } from '../reporters/console-reporter.js'
import { HtmlReporter } from '../reporters/html-reporter.js'
import { JsonReporter } from '../reporters/json-reporter.js'
import type { Reporter } from '../reporters/reporter.interface.js'
import { runScenario } from '../run-scenario.js'

const program = new Command()

program
  .name('loadtest')
  .description('Run a declarative load test scenario against an HTTP target.')
  .version('1.0.0')

program
  .command('run')
  .description('Run a scenario file')
  .argument('<scenario>', 'path to a scenario YAML file')
  .option('--json <path>', 'write a JSON report to this path')
  .option('--html <path>', 'write an HTML report to this path')
  .action(async (scenarioPath: string, options: { json?: string; html?: string }) => {
    const scenario = await loadScenario(scenarioPath)

    const reporters: Reporter[] = [new ConsoleReporter()]
    if (options.json) reporters.push(new JsonReporter(options.json))
    if (options.html) reporters.push(new HtmlReporter(options.html))

    const { passed } = await runScenario(scenario, reporters)
    process.exitCode = passed ? 0 : 1
  })

program.parseAsync(process.argv)
