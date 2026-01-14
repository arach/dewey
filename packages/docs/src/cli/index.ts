#!/usr/bin/env node
import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { auditCommand } from './commands/audit.js'
import { generateCommand } from './commands/generate.js'

const program = new Command()

program
  .name('dewey')
  .description('Documentation scaffolding, auditing, and agent file generation')
  .version('0.1.0')

program
  .command('init')
  .description('Initialize docs structure and dewey.config.ts')
  .option('-t, --type <type>', 'Project type (macos-app, npm-package, cli-tool, react-library, monorepo)', 'generic')
  .option('-f, --force', 'Overwrite existing files')
  .action(initCommand)

program
  .command('audit')
  .description('Validate documentation completeness')
  .option('-v, --verbose', 'Show detailed output')
  .option('--json', 'Output as JSON')
  .action(auditCommand)

program
  .command('generate')
  .description('Generate agent-ready files (AGENTS.md, llms.txt, docs.json)')
  .option('-o, --output <dir>', 'Output directory')
  .option('--agents-md', 'Generate only AGENTS.md')
  .option('--llms-txt', 'Generate only llms.txt')
  .option('--docs-json', 'Generate only docs.json')
  .action(generateCommand)

program.parse()

// Export for programmatic use
export { defineConfig } from './schema.js'
export type { DeweyConfig, ProjectType, AgentRule } from './schema.js'
export { loadConfig, configExists } from './config.js'
