#!/usr/bin/env node
import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { auditCommand } from './commands/audit.js'
import { generateCommand } from './commands/generate.js'
import { agentCoachCommand } from './commands/agent-coach.js'
import { createCommand } from './commands/create.js'

const program = new Command()

program
  .name('dewey')
  .description('Documentation scaffolding, auditing, and agent file generation')
  .version('0.2.0')

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
  .description('Generate agent-ready files (AGENTS.md, llms.txt, docs.json, install.md)')
  .option('-o, --output <dir>', 'Output directory')
  .option('--agents-md', 'Generate only AGENTS.md')
  .option('--llms-txt', 'Generate only llms.txt')
  .option('--docs-json', 'Generate only docs.json')
  .option('--install-md', 'Generate only install.md (installmd.org standard)')
  .action(generateCommand)

program
  .command('agent')
  .description('Check agent-readiness and get recommendations')
  .option('-v, --verbose', 'Show detailed check results')
  .option('--json', 'Output as JSON')
  .option('--fix', 'Auto-create missing files and folders')
  .action(agentCoachCommand)

program
  .command('create <project-dir>')
  .description('Create a new docs site from markdown sources')
  .option('-s, --source <path>', 'Path to markdown docs directory', './docs')
  .option('-n, --name <name>', 'Project name (defaults to directory name)')
  .option('-t, --template <template>', 'Template to use (vite, nextjs)', 'vite')
  .option('--theme <theme>', 'Color theme (neutral, ocean, emerald, purple, dusk, rose, github, warm)', 'neutral')
  .action(createCommand)

program.parse()

// Export for programmatic use
export { defineConfig } from './schema.js'
export type { DeweyConfig, ProjectType, AgentRule, InstallConfig } from './schema.js'
export { loadConfig, configExists } from './config.js'
