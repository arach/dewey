import chalk from 'chalk'
import { readdir, readFile, writeFile, access, mkdir } from 'fs/promises'
import { join } from 'path'
import { loadConfig, configExists } from '../config.js'
import type { DeweyConfig } from '../schema.js'

interface CoachOptions {
  verbose?: boolean
  json?: boolean
  fix?: boolean
  interactive?: boolean
}

interface AgentReadinessReport {
  score: number
  maxScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  categories: CategoryResult[]
  recommendations: Recommendation[]
  quickWins: string[]
}

interface CategoryResult {
  name: string
  score: number
  maxScore: number
  status: 'excellent' | 'good' | 'needs-work' | 'missing'
  checks: CheckResult[]
}

interface CheckResult {
  name: string
  passed: boolean
  points: number
  maxPoints: number
  hint?: string
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  category: string
  action: string
  reason: string
  example?: string
}

// ============================================
// Agent Readiness Checklist
// ============================================

const AGENT_CHECKLIST = {
  // What agents need to understand the project
  projectContext: {
    name: 'Project Context',
    maxScore: 25,
    checks: [
      { id: 'has-overview', points: 5, description: 'Has overview.md or intro.md' },
      { id: 'has-quickstart', points: 5, description: 'Has quickstart.md with working examples' },
      { id: 'has-architecture', points: 5, description: 'Has architecture.md or structure docs' },
      { id: 'has-api-reference', points: 5, description: 'Has API reference with types' },
      { id: 'has-config', points: 5, description: 'Has dewey.config.ts with project info' },
    ],
  },

  // Agent-specific files
  agentFiles: {
    name: 'Agent-Optimized Files',
    maxScore: 30,
    checks: [
      { id: 'has-agents-md', points: 10, description: 'Has AGENTS.md with dense context' },
      { id: 'has-llm-txt', points: 10, description: 'Has llm.txt or llms.txt' },
      { id: 'has-claude-md', points: 5, description: 'Has CLAUDE.md for project rules' },
      { id: 'has-agent-content', points: 5, description: 'Has agent/ folder with .agent.md files' },
    ],
  },

  // Prompts and skills for humans briefing agents
  humanToAgent: {
    name: 'Human-to-Agent Handoff',
    maxScore: 25,
    checks: [
      { id: 'has-prompts', points: 10, description: 'Has prompts/ folder with task templates' },
      { id: 'has-skills', points: 10, description: 'Has skill.md with skill definitions' },
      { id: 'has-copy-instructions', points: 5, description: 'Docs explain how to brief agents' },
    ],
  },

  // Content quality for agent consumption
  contentQuality: {
    name: 'Content Quality',
    maxScore: 20,
    checks: [
      { id: 'has-code-examples', points: 5, description: 'Code examples are complete and runnable' },
      { id: 'has-type-definitions', points: 5, description: 'Type definitions are documented' },
      { id: 'has-file-paths', points: 5, description: 'File paths reference actual code' },
      { id: 'has-valid-values', points: 5, description: 'Valid values/options are listed' },
    ],
  },
}

// ============================================
// File Checks
// ============================================

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function findFile(basePath: string, names: string[]): Promise<string | null> {
  for (const name of names) {
    const path = join(basePath, name)
    if (await fileExists(path)) return path
  }
  return null
}

async function checkFileHasContent(filePath: string, pattern: RegExp): Promise<boolean> {
  if (!await fileExists(filePath)) return false
  const content = await readFile(filePath, 'utf-8')
  return pattern.test(content)
}

// ============================================
// Perform Checks
// ============================================

async function performChecks(cwd: string, config: DeweyConfig | null): Promise<CategoryResult[]> {
  const docsPath = config?.docs.path ? join(cwd, config.docs.path) : join(cwd, 'docs')
  const results: CategoryResult[] = []

  // Project Context checks
  const contextChecks: CheckResult[] = []

  // Has overview
  const overviewFile = await findFile(docsPath, ['overview.md', 'intro.md', 'introduction.md', 'README.md'])
  contextChecks.push({
    name: 'Has overview documentation',
    passed: !!overviewFile,
    points: overviewFile ? 5 : 0,
    maxPoints: 5,
    hint: overviewFile ? undefined : 'Create docs/overview.md with project introduction',
  })

  // Has quickstart
  const quickstartFile = await findFile(docsPath, ['quickstart.md', 'getting-started.md', 'quick-start.md'])
  const quickstartHasCode = quickstartFile ? await checkFileHasContent(quickstartFile, /```\w+/) : false
  contextChecks.push({
    name: 'Has quickstart with code examples',
    passed: quickstartHasCode,
    points: quickstartHasCode ? 5 : 0,
    maxPoints: 5,
    hint: quickstartHasCode ? undefined : 'Create docs/quickstart.md with working code examples',
  })

  // Has architecture
  const archFile = await findFile(docsPath, ['architecture.md', 'structure.md', 'design.md'])
  contextChecks.push({
    name: 'Has architecture documentation',
    passed: !!archFile,
    points: archFile ? 5 : 0,
    maxPoints: 5,
    hint: archFile ? undefined : 'Create docs/architecture.md explaining project structure',
  })

  // Has API reference
  const apiFile = await findFile(docsPath, ['api.md', 'api-reference.md', 'reference.md'])
  const apiHasTypes = apiFile ? await checkFileHasContent(apiFile, /interface|type\s+\w+/) : false
  contextChecks.push({
    name: 'Has API reference with types',
    passed: apiHasTypes,
    points: apiHasTypes ? 5 : 0,
    maxPoints: 5,
    hint: apiHasTypes ? undefined : 'Create docs/api.md with TypeScript interfaces',
  })

  // Has config
  const hasConfig = await configExists(cwd)
  contextChecks.push({
    name: 'Has dewey.config.ts',
    passed: hasConfig,
    points: hasConfig ? 5 : 0,
    maxPoints: 5,
    hint: hasConfig ? undefined : 'Run `dewey init` to create configuration',
  })

  const contextScore = contextChecks.reduce((s, c) => s + c.points, 0)
  results.push({
    name: AGENT_CHECKLIST.projectContext.name,
    score: contextScore,
    maxScore: AGENT_CHECKLIST.projectContext.maxScore,
    status: getStatus(contextScore, AGENT_CHECKLIST.projectContext.maxScore),
    checks: contextChecks,
  })

  // Agent Files checks
  const agentChecks: CheckResult[] = []

  // Has AGENTS.md
  const agentsMd = await findFile(cwd, ['AGENTS.md', 'docs/AGENTS.md'])
  agentChecks.push({
    name: 'Has AGENTS.md',
    passed: !!agentsMd,
    points: agentsMd ? 10 : 0,
    maxPoints: 10,
    hint: agentsMd ? undefined : 'Run `dewey generate --agents-md` to create AGENTS.md',
  })

  // Has llm.txt
  const llmTxt = await findFile(cwd, ['llm.txt', 'llms.txt', 'public/llm.txt', 'docs/llm.txt'])
  agentChecks.push({
    name: 'Has llm.txt',
    passed: !!llmTxt,
    points: llmTxt ? 10 : 0,
    maxPoints: 10,
    hint: llmTxt ? undefined : 'Run `dewey generate --llms-txt` or create public/llm.txt',
  })

  // Has CLAUDE.md
  const claudeMd = await findFile(cwd, ['CLAUDE.md', '.claude/CLAUDE.md'])
  agentChecks.push({
    name: 'Has CLAUDE.md',
    passed: !!claudeMd,
    points: claudeMd ? 5 : 0,
    maxPoints: 5,
    hint: claudeMd ? undefined : 'Create CLAUDE.md with project-specific agent rules',
  })

  // Has agent content folder
  const agentFolder = await fileExists(join(docsPath, 'agent'))
  agentChecks.push({
    name: 'Has agent/ folder with .agent.md files',
    passed: agentFolder,
    points: agentFolder ? 5 : 0,
    maxPoints: 5,
    hint: agentFolder ? undefined : 'Create docs/agent/ with dense, structured versions of docs',
  })

  const agentScore = agentChecks.reduce((s, c) => s + c.points, 0)
  results.push({
    name: AGENT_CHECKLIST.agentFiles.name,
    score: agentScore,
    maxScore: AGENT_CHECKLIST.agentFiles.maxScore,
    status: getStatus(agentScore, AGENT_CHECKLIST.agentFiles.maxScore),
    checks: agentChecks,
  })

  // Human-to-Agent checks
  const handoffChecks: CheckResult[] = []

  // Has prompts folder
  const promptsFolder = await fileExists(join(docsPath, 'prompts'))
  handoffChecks.push({
    name: 'Has prompts/ folder',
    passed: promptsFolder,
    points: promptsFolder ? 10 : 0,
    maxPoints: 10,
    hint: promptsFolder ? undefined : 'Create docs/prompts/ with task templates for common operations',
  })

  // Has skills
  const skillsMd = await findFile(docsPath, ['skill.md', 'skills.md'])
  handoffChecks.push({
    name: 'Has skill.md',
    passed: !!skillsMd,
    points: skillsMd ? 10 : 0,
    maxPoints: 10,
    hint: skillsMd ? undefined : 'Create docs/skill.md with pre-built skill definitions',
  })

  // Has copy instructions (check if any doc mentions copying for agents)
  let hasCopyInstructions = false
  const allDocs = await readdir(docsPath).catch(() => [])
  for (const file of allDocs) {
    if (file.endsWith('.md')) {
      const hasInstructions = await checkFileHasContent(
        join(docsPath, file),
        /copy.*agent|agent.*copy|brief.*agent|llm|ai assistant/i
      )
      if (hasInstructions) {
        hasCopyInstructions = true
        break
      }
    }
  }
  handoffChecks.push({
    name: 'Docs explain how to brief agents',
    passed: hasCopyInstructions,
    points: hasCopyInstructions ? 5 : 0,
    maxPoints: 5,
    hint: hasCopyInstructions ? undefined : 'Add a section explaining how to use docs with AI assistants',
  })

  const handoffScore = handoffChecks.reduce((s, c) => s + c.points, 0)
  results.push({
    name: AGENT_CHECKLIST.humanToAgent.name,
    score: handoffScore,
    maxScore: AGENT_CHECKLIST.humanToAgent.maxScore,
    status: getStatus(handoffScore, AGENT_CHECKLIST.humanToAgent.maxScore),
    checks: handoffChecks,
  })

  // Content Quality checks
  const qualityChecks: CheckResult[] = []

  // Check for complete code examples
  let hasCompleteExamples = false
  for (const file of allDocs) {
    if (file.endsWith('.md')) {
      // Look for code blocks with import statements (indicates complete examples)
      const hasComplete = await checkFileHasContent(
        join(docsPath, file),
        /```\w+\n.*import\s+/s
      )
      if (hasComplete) {
        hasCompleteExamples = true
        break
      }
    }
  }
  qualityChecks.push({
    name: 'Code examples are complete',
    passed: hasCompleteExamples,
    points: hasCompleteExamples ? 5 : 0,
    maxPoints: 5,
    hint: hasCompleteExamples ? undefined : 'Include full, runnable code examples with imports',
  })

  // Check for type definitions
  let hasTypeDefinitions = false
  for (const file of allDocs) {
    if (file.endsWith('.md')) {
      const hasTypes = await checkFileHasContent(
        join(docsPath, file),
        /interface\s+\w+\s*\{|type\s+\w+\s*=/
      )
      if (hasTypes) {
        hasTypeDefinitions = true
        break
      }
    }
  }
  qualityChecks.push({
    name: 'Type definitions documented',
    passed: hasTypeDefinitions,
    points: hasTypeDefinitions ? 5 : 0,
    maxPoints: 5,
    hint: hasTypeDefinitions ? undefined : 'Document TypeScript interfaces and types',
  })

  // Check for file path references
  let hasFilePaths = false
  for (const file of allDocs) {
    if (file.endsWith('.md')) {
      const hasPaths = await checkFileHasContent(
        join(docsPath, file),
        /`src\/|`\.\/|`lib\/|`packages\//
      )
      if (hasPaths) {
        hasFilePaths = true
        break
      }
    }
  }
  qualityChecks.push({
    name: 'File paths reference actual code',
    passed: hasFilePaths,
    points: hasFilePaths ? 5 : 0,
    maxPoints: 5,
    hint: hasFilePaths ? undefined : 'Reference actual file paths like `src/components/Button.tsx`',
  })

  // Check for valid values lists
  let hasValidValues = false
  for (const file of allDocs) {
    if (file.endsWith('.md')) {
      const hasValues = await checkFileHasContent(
        join(docsPath, file),
        /valid\s+(values|options)|one\s+of|enum|'[^']+'\s*\|\s*'[^']+'/i
      )
      if (hasValues) {
        hasValidValues = true
        break
      }
    }
  }
  qualityChecks.push({
    name: 'Valid values are listed',
    passed: hasValidValues,
    points: hasValidValues ? 5 : 0,
    maxPoints: 5,
    hint: hasValidValues ? undefined : 'List valid values for props/options (e.g., "size: \'s\' | \'m\' | \'l\'")',
  })

  const qualityScore = qualityChecks.reduce((s, c) => s + c.points, 0)
  results.push({
    name: AGENT_CHECKLIST.contentQuality.name,
    score: qualityScore,
    maxScore: AGENT_CHECKLIST.contentQuality.maxScore,
    status: getStatus(qualityScore, AGENT_CHECKLIST.contentQuality.maxScore),
    checks: qualityChecks,
  })

  return results
}

function getStatus(score: number, max: number): 'excellent' | 'good' | 'needs-work' | 'missing' {
  const pct = score / max
  if (pct >= 0.9) return 'excellent'
  if (pct >= 0.6) return 'good'
  if (pct > 0) return 'needs-work'
  return 'missing'
}

function getGrade(score: number, max: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  const pct = score / max
  if (pct >= 0.9) return 'A'
  if (pct >= 0.8) return 'B'
  if (pct >= 0.7) return 'C'
  if (pct >= 0.6) return 'D'
  return 'F'
}

function generateRecommendations(categories: CategoryResult[]): Recommendation[] {
  const recommendations: Recommendation[] = []

  for (const category of categories) {
    for (const check of category.checks) {
      if (!check.passed && check.hint) {
        recommendations.push({
          priority: check.maxPoints >= 10 ? 'high' : check.maxPoints >= 5 ? 'medium' : 'low',
          category: category.name,
          action: check.hint,
          reason: `Adds ${check.maxPoints} points to your agent-readiness score`,
        })
      }
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations
}

function getQuickWins(_recommendations: Recommendation[]): string[] {
  // Quick wins are things that can be done with dewey commands
  // TODO: Could filter based on recommendations to make these more relevant
  return [
    '`dewey init` - Create dewey.config.ts',
    '`dewey generate` - Generate AGENTS.md and llm.txt',
    'Create docs/agent/ folder with dense .agent.md versions',
    'Create docs/prompts/ with task templates',
  ].filter((_, i) => i < 3) // Top 3 quick wins
}

// ============================================
// Output Formatting
// ============================================

function printReport(report: AgentReadinessReport, verbose: boolean) {
  console.log(chalk.blue('\n' + '='.repeat(50)))
  console.log(chalk.blue.bold('  Agent Readiness Report'))
  console.log(chalk.blue('='.repeat(50) + '\n'))

  // Overall score
  const scoreColor = report.grade === 'A' ? chalk.green
    : report.grade === 'B' ? chalk.cyan
      : report.grade === 'C' ? chalk.yellow
        : chalk.red

  console.log(`  Overall Score: ${scoreColor.bold(`${report.score}/${report.maxScore}`)} (Grade: ${scoreColor.bold(report.grade)})`)
  console.log()

  // Progress bar
  const pct = report.score / report.maxScore
  const filled = Math.round(pct * 30)
  const empty = 30 - filled
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  console.log(`  ${bar} ${Math.round(pct * 100)}%`)
  console.log()

  // Category breakdown
  console.log(chalk.bold('  Categories:\n'))
  for (const category of report.categories) {
    const statusIcon = category.status === 'excellent' ? chalk.green('★')
      : category.status === 'good' ? chalk.cyan('●')
        : category.status === 'needs-work' ? chalk.yellow('○')
          : chalk.red('✗')

    const statusColor = category.status === 'excellent' ? chalk.green
      : category.status === 'good' ? chalk.cyan
        : category.status === 'needs-work' ? chalk.yellow
          : chalk.red

    console.log(`  ${statusIcon} ${category.name}: ${statusColor(`${category.score}/${category.maxScore}`)}`)

    if (verbose) {
      for (const check of category.checks) {
        const icon = check.passed ? chalk.green('  ✓') : chalk.red('  ✗')
        console.log(`  ${icon} ${check.name}`)
      }
      console.log()
    }
  }

  if (!verbose) {
    console.log(chalk.gray('\n  Run with --verbose to see individual checks'))
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log(chalk.bold('\n  Top Recommendations:\n'))
    const topRecs = report.recommendations.slice(0, 5)
    for (const rec of topRecs) {
      const priorityIcon = rec.priority === 'high' ? chalk.red('!')
        : rec.priority === 'medium' ? chalk.yellow('→')
          : chalk.gray('·')
      console.log(`  ${priorityIcon} ${rec.action}`)
      console.log(chalk.gray(`    ${rec.reason}`))
    }
  }

  // Quick wins
  console.log(chalk.bold('\n  Quick Wins:\n'))
  for (const win of report.quickWins) {
    console.log(`  ${chalk.cyan('→')} ${win}`)
  }

  console.log()
}

// ============================================
// Fix Command
// ============================================

async function applyFixes(cwd: string, config: DeweyConfig | null) {
  const docsPath = config?.docs.path ? join(cwd, config.docs.path) : join(cwd, 'docs')

  console.log(chalk.blue('\n🔧 Applying fixes...\n'))

  // Create docs folder if missing
  if (!await fileExists(docsPath)) {
    await mkdir(docsPath, { recursive: true })
    console.log(chalk.green('✓') + ` Created ${docsPath}`)
  }

  // Create agent folder
  const agentPath = join(docsPath, 'agent')
  if (!await fileExists(agentPath)) {
    await mkdir(agentPath, { recursive: true })
    console.log(chalk.green('✓') + ` Created ${agentPath}`)
  }

  // Create prompts folder
  const promptsPath = join(docsPath, 'prompts')
  if (!await fileExists(promptsPath)) {
    await mkdir(promptsPath, { recursive: true })
    console.log(chalk.green('✓') + ` Created ${promptsPath}`)
  }

  // Create starter skill.md
  const skillPath = join(docsPath, 'skill.md')
  if (!await fileExists(skillPath)) {
    const skillContent = `# Skills

> Pre-built skills for AI coding assistants

## Available Skills

### project-dev

Develop and debug this project.

**Trigger**: When working on this codebase

**Context to provide**:
\`\`\`
[Add project-specific context here]
- Key files and their purposes
- Common commands
- Important patterns
\`\`\`

## Installing Skills

### Claude Code

Add to your project's \`CLAUDE.md\`:

\`\`\`markdown
## Project Context

[Paste skill context here]
\`\`\`

## Prompt Templates

### General Task
\`\`\`
Help me [TASK] in this project.
Key files: [LIST FILES]
\`\`\`
`
    await writeFile(skillPath, skillContent)
    console.log(chalk.green('✓') + ` Created ${skillPath}`)
  }

  // Create starter prompt template
  const promptPath = join(promptsPath, 'general.md')
  if (!await fileExists(promptPath)) {
    const promptContent = `# General Task

## Prompt Template

\`\`\`
Help me [DESCRIBE TASK] in this project.

Context:
- This is a [PROJECT TYPE] project
- Key files: [LIST RELEVANT FILES]
- I want to [SPECIFIC GOAL]
\`\`\`

## Example

\`\`\`
Help me add a new feature to this project.

Context:
- This is a React component library
- Key files: src/components/, src/hooks/
- I want to add a new Button variant
\`\`\`
`
    await writeFile(promptPath, promptContent)
    console.log(chalk.green('✓') + ` Created ${promptPath}`)
  }

  console.log(chalk.green('\n✨ Fixes applied! Run `dewey agent-coach` again to see your new score.\n'))
}

// ============================================
// Main Command
// ============================================

export async function agentCoachCommand(options: CoachOptions) {
  const cwd = process.cwd()
  const config = await loadConfig(cwd)

  console.log(chalk.blue('\n🤖 dewey agent'))
  console.log(chalk.gray('   Checking agent-readiness...\n'))

  // Perform all checks
  const categories = await performChecks(cwd, config)

  // Calculate totals
  const totalScore = categories.reduce((s, c) => s + c.score, 0)
  const maxScore = categories.reduce((s, c) => s + c.maxScore, 0)

  // Generate recommendations
  const recommendations = generateRecommendations(categories)
  const quickWins = getQuickWins(recommendations)

  const report: AgentReadinessReport = {
    score: totalScore,
    maxScore,
    grade: getGrade(totalScore, maxScore),
    categories,
    recommendations,
    quickWins,
  }

  // Output
  if (options.json) {
    console.log(JSON.stringify(report, null, 2))
    return
  }

  printReport(report, options.verbose || false)

  // Apply fixes if requested
  if (options.fix) {
    await applyFixes(cwd, config)
  } else if (report.score < maxScore) {
    console.log(chalk.gray(`  Tip: Run ${chalk.cyan('dewey agent-coach --fix')} to auto-create missing files\n`))
  }
}
