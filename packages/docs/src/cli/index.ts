#!/usr/bin/env node
import { Command } from 'commander'
import chalk from 'chalk'
import { ZodError } from 'zod'
// @ts-ignore - omelette doesn't have type definitions
import omelette from 'omelette'
import { initCommand } from './commands/init.js'
import { auditCommand } from './commands/audit.js'
import { generateCommand } from './commands/generate.js'
import { agentCoachCommand } from './commands/agent-coach.js'
import { createCommand } from './commands/create.js'
import { updateCommand } from './commands/update.js'
import { ejectCommand } from './commands/eject.js'
import { DEWEY_VERSION } from './version.js'

const program = new Command()

// Configure shell autocompletion
const completion = omelette('dewey|dewey-cli')
completion.on('complete', function(this: any, _fragment: any, data: any) {
  const commands = ['init', 'audit', 'generate', 'agent', 'create', 'update', 'eject', 'completion']
  if (data.fragment === 1) {
    this.reply(commands)
  }
})
completion.init()

program
  .name('dewey')
  .description('Documentation scaffolding, auditing, and agent file generation')
  .version(DEWEY_VERSION)

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
  .option('--strict', 'Exit with code 1 if any errors or missing required sections')
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
  .option('--strict', 'Exit with code 1 if agent-readiness score is below 80')
  .action(agentCoachCommand)

program
  .command('create <project-dir>')
  .description('Create a new docs site from markdown sources')
  .option('-s, --source <path>', 'Path to markdown docs directory', './docs')
  .option('-n, --name <name>', 'Project name (defaults to directory name)')
  .option('-t, --template <template>', 'Template to use (nextjs, astro)', 'nextjs')
  .option('--theme <theme>', 'Color theme (neutral, ocean, emerald, purple, dusk, rose, github, warm)', 'neutral')
  .action(createCommand)

program
  .command('update [dir]')
  .description('Update Dewey-owned site files to the latest version')
  .option('--dry-run', 'Preview changes without writing')
  .option('--force', 'Overwrite user-modified files (creates backups)')
  .option('--refresh-nav', 'Regenerate docs.json from current docs/')
  .action(updateCommand)

program
  .command('eject <component>')
  .description('Eject a component for customization (Header, Sidebar, TableOfContents, MarkdownContent)')
  .argument('[dir]', 'Target Dewey site directory', '.')
  .option('--full', 'Full eject (no default import, complete replacement)')
  .action(ejectCommand)

program
  .command('completion')
  .description('Generate shell autocompletion script')
  .action(() => {
    completion.setupShellInitFile()
    console.log('Autocompletion installed. Please restart your shell or run: source ~/.zshrc (or ~/.bashrc)')
  })

async function main() {
  try {
    await program.parseAsync()
  } catch (error) {
    // Config schema validation errors (Zod)
    if (error instanceof ZodError) {
      console.error(chalk.red('\n✗ Invalid dewey configuration\n'))
      for (const issue of error.issues) {
        const path = issue.path.length > 0 ? chalk.cyan(issue.path.join('.')) + ': ' : ''
        console.error(chalk.gray(`  • ${path}${issue.message}`))
      }
      console.error(chalk.gray('\n  Check your dewey.config.ts and fix the issues above.\n'))
      process.exit(1)
    }

    // Known errors (config loading, missing files, etc.)
    if (error instanceof Error) {
      console.error(chalk.red(`\n✗ ${error.message}\n`))
      if (process.env.DEBUG) {
        console.error(chalk.gray(error.stack ?? ''))
      }
      process.exit(1)
    }

    // Unknown / non-Error throws
    console.error(chalk.red('\n✗ An unexpected error occurred\n'))
    console.error(chalk.gray(`  ${String(error)}\n`))
    process.exit(1)
  }
}

main()

// Export for programmatic use
export { defineConfig } from './schema.js'
export type { DeweyConfig, ProjectType, AgentRule, InstallConfig } from './schema.js'
export { loadConfig, configExists } from './config.js'
