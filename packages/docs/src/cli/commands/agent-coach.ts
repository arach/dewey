import chalk from 'chalk'
import { readdir, readFile, access } from 'fs/promises'
import { join, relative, sep } from 'path'
import matter from 'gray-matter'
import { loadConfigWithRoot } from '../config.js'
import { analyzeDocumentationDrift, type DriftReport } from '../drift.js'
import {
  checkProjectTypeDocumentation,
  type ProjectTypeDocumentationCheck,
} from '../project-types.js'
import type { DeweyConfig } from '../schema.js'

interface CoachOptions {
  verbose?: boolean
  json?: boolean
}

interface AgentReadinessReport {
  kind: 'readiness-coaching'
  score: number
  maxScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  categories: CategoryResult[]
  projectType: ProjectTypeDocumentationCheck
  drift: DriftReport
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

interface MarkdownDocument {
  path: string
  absolutePath: string
  body: string
  frontmatter: Record<string, unknown>
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
      { id: 'has-install-md', points: 5, description: 'Has install.md with executable setup instructions' },
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

async function discoverMarkdownDocuments(docsPath: string): Promise<MarkdownDocument[]> {
  if (!await fileExists(docsPath)) return []

  const documents: MarkdownDocument[] = []
  async function walk(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const absolutePath = join(directory, entry.name)
      if (entry.isDirectory()) {
        await walk(absolutePath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const raw = await readFile(absolutePath, 'utf-8')
        let body = raw
        let frontmatter: Record<string, unknown> = {}
        try {
          const parsed = matter(raw)
          body = parsed.content
          frontmatter = parsed.data
        } catch {
          // Structural parse errors belong to `dewey audit`; coaching can still
          // extract useful signals from the readable source text.
        }
        documents.push({
          path: relative(docsPath, absolutePath).split(sep).join('/'),
          absolutePath,
          body,
          frontmatter,
        })
      }
    }
  }

  await walk(docsPath)
  return documents.sort((a, b) => a.path.localeCompare(b.path))
}

function documentSignals(document: MarkdownDocument): string {
  const title = typeof document.frontmatter.title === 'string' ? document.frontmatter.title : ''
  const headings = document.body.match(/^#{1,3}\s+.+$/gm)?.join('\n') ?? ''
  return `${document.path}\n${title}\n${headings}`
}

function isHumanPageDocument(document: MarkdownDocument): boolean {
  const segments = document.path.split('/')
  const filename = segments[segments.length - 1] ?? ''
  return filename.endsWith('.md')
    && !filename.endsWith('.agent.md')
    && filename.toLowerCase() !== 'agents.md'
    && !segments.slice(0, -1).some(segment => ['agent', 'prompts'].includes(segment.toLowerCase()))
}

function agentCounterpartPaths(path: string): string[] {
  const id = path.replace(/\.md$/, '')
  return [`${id}.agent.md`, `agent/${id}.agent.md`]
}

function hasCompleteCodeExample(document: MarkdownDocument): boolean {
  return [...document.body.matchAll(/```[^\n]*\n([\s\S]*?)```/g)]
    .some(match => /(^|\n)\s*import\s+/m.test(match[1]))
}

function findDocumentByEvidence(
  documents: MarkdownDocument[],
  evidence: RegExp,
): MarkdownDocument | null {
  return documents.find(document => evidence.test(documentSignals(document))) ?? null
}

function extractReferencedPaths(content: string): string[] {
  return [...content.matchAll(/`((?:src|lib|packages|apps)\/[\w./-]+)`/g)].map(match => match[1])
}

async function hasExistingCodeReference(projectRoot: string, documents: MarkdownDocument[]): Promise<boolean> {
  for (const document of documents) {
    for (const path of extractReferencedPaths(document.body)) {
      if (await fileExists(join(projectRoot, path))) return true
    }
  }
  return false
}

// ============================================
// Perform Checks
// ============================================

async function performReadinessChecks(projectRoot: string, config: DeweyConfig | null): Promise<{
  categories: CategoryResult[]
  projectType: ProjectTypeDocumentationCheck
  drift: DriftReport
}> {
  const docsPath = config?.docs.path ? join(projectRoot, config.docs.path) : join(projectRoot, 'docs')
  const documents = await discoverMarkdownDocuments(docsPath)
  const humanDocuments = documents.filter(isHumanPageDocument)
  const projectType = checkProjectTypeDocumentation(config?.project.type ?? 'generic', humanDocuments)
  const drift = await analyzeDocumentationDrift({
    projectRoot,
    documents,
    configuredSourcePaths: Object.values(config?.agent.entryPoints ?? {}),
  })
  const results: CategoryResult[] = []

  // Project Context checks
  const contextChecks: CheckResult[] = []

  // Has overview
  const overviewFile = findDocumentByEvidence(humanDocuments, /\b(overview|introduction|about)\b/i)
  contextChecks.push({
    name: 'Has overview documentation',
    passed: !!overviewFile,
    points: overviewFile ? 5 : 0,
    maxPoints: 5,
    hint: overviewFile ? undefined : 'Add an overview or introduction document',
  })

  // Has quickstart
  const quickstartFile = humanDocuments.find(document =>
    /\b(quick[ -]?start|getting started|installation)\b/i.test(documentSignals(document))
      && /```\w+/.test(document.body),
  )
  const quickstartHasCode = !!quickstartFile
  contextChecks.push({
    name: 'Has quickstart with code examples',
    passed: quickstartHasCode,
    points: quickstartHasCode ? 5 : 0,
    maxPoints: 5,
    hint: quickstartHasCode ? undefined : 'Add getting-started documentation with working code examples',
  })

  // Project types replace generic architecture/API assumptions with two
  // explicit evidence requirements for the selected product shape.
  for (const evidence of projectType.evidence) {
    contextChecks.push({
      name: evidence.requirement,
      passed: evidence.passed,
      points: evidence.passed ? 5 : 0,
      maxPoints: 5,
      hint: evidence.passed
        ? undefined
        : `Add ${projectType.label.toLowerCase()} evidence: ${evidence.requirement}`,
    })
  }

  // Has config
  const hasConfig = !!config
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
  const agentsMd = await findFile(projectRoot, ['AGENTS.md', 'docs/AGENTS.md'])
  agentChecks.push({
    name: 'Has AGENTS.md',
    passed: !!agentsMd,
    points: agentsMd ? 10 : 0,
    maxPoints: 10,
    hint: agentsMd ? undefined : 'Run `dewey generate --agents-md` to create AGENTS.md',
  })

  // Has llm.txt
  const llmTxt = await findFile(projectRoot, ['llm.txt', 'llms.txt', 'public/llm.txt', 'public/llms.txt', 'docs/llm.txt', 'docs/llms.txt'])
  agentChecks.push({
    name: 'Has llms.txt',
    passed: !!llmTxt,
    points: llmTxt ? 10 : 0,
    maxPoints: 10,
    hint: llmTxt ? undefined : 'Run `dewey generate --llms-txt` or create public/llm.txt',
  })

  // Has install.md
  const installMd = await findFile(projectRoot, ['install.md', 'public/install.md', 'docs/install.md'])
  agentChecks.push({
    name: 'Has install.md',
    passed: !!installMd,
    points: installMd ? 5 : 0,
    maxPoints: 5,
    hint: installMd ? undefined : 'Run `dewey generate --install-md` to create install.md',
  })

  // Has agent content folder
  const documentPaths = new Set(documents.map(document => document.path))
  const pairedDocuments = humanDocuments.filter(document =>
    agentCounterpartPaths(document.path).some(path => documentPaths.has(path)),
  )
  const hasCompleteAgentCoverage = humanDocuments.length > 0 && pairedDocuments.length === humanDocuments.length
  agentChecks.push({
    name: 'Has .agent.md counterpart coverage',
    passed: hasCompleteAgentCoverage,
    points: hasCompleteAgentCoverage ? 5 : 0,
    maxPoints: 5,
    hint: hasCompleteAgentCoverage
      ? undefined
      : `Create dense .agent.md counterparts for every human page (${pairedDocuments.length}/${humanDocuments.length} paired)`,
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
  const promptsFolder = documents.some(document => document.path.split('/').includes('prompts'))
  handoffChecks.push({
    name: 'Has prompt templates',
    passed: promptsFolder,
    points: promptsFolder ? 10 : 0,
    maxPoints: 10,
    hint: promptsFolder ? undefined : 'Create docs/prompts/ with task templates for common operations',
  })

  // Has skills
  const skillsMd = documents.find(document => /(^|\/)skills?\.md$/.test(document.path))
    ?? await findFile(projectRoot, ['.agents/skills/SKILL.md'])
  handoffChecks.push({
    name: 'Has documented agent skills',
    passed: !!skillsMd,
    points: skillsMd ? 10 : 0,
    maxPoints: 10,
    hint: skillsMd ? undefined : 'Create docs/skill.md with pre-built skill definitions',
  })

  // Has copy instructions (check if any doc mentions copying for agents)
  const hasCopyInstructions = humanDocuments.some(document =>
    /copy.*agent|agent.*copy|brief.*agent|llm|ai assistant/i.test(document.body),
  )
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
  const hasCompleteExamples = humanDocuments.some(hasCompleteCodeExample)
  qualityChecks.push({
    name: 'Code examples are complete',
    passed: hasCompleteExamples,
    points: hasCompleteExamples ? 5 : 0,
    maxPoints: 5,
    hint: hasCompleteExamples ? undefined : 'Include full, runnable code examples with imports',
  })

  // Check for type definitions
  const hasTypeDefinitions = humanDocuments.some(document => /interface\s+\w+\s*\{|type\s+\w+\s*=/.test(document.body))
  qualityChecks.push({
    name: 'Type definitions documented',
    passed: hasTypeDefinitions,
    points: hasTypeDefinitions ? 5 : 0,
    maxPoints: 5,
    hint: hasTypeDefinitions ? undefined : 'Document TypeScript interfaces and types',
  })

  // Check for file path references
  const hasFilePaths = await hasExistingCodeReference(projectRoot, humanDocuments)
  qualityChecks.push({
    name: 'File paths reference actual code',
    passed: hasFilePaths,
    points: hasFilePaths ? 5 : 0,
    maxPoints: 5,
    hint: hasFilePaths ? undefined : 'Reference actual file paths like `src/components/Button.tsx`',
  })

  // Check for valid values lists
  const hasValidValues = humanDocuments.some(document =>
    /valid\s+(values|options)|one\s+of|enum|'[^']+'\s*\|\s*'[^']+'/i.test(document.body),
  )
  const contractsAligned = drift.status === 'clean'
  const validValuesAligned = hasValidValues && contractsAligned
  qualityChecks.push({
    name: 'Valid values are listed and aligned across source and paired docs',
    passed: validValuesAligned,
    points: validValuesAligned ? 5 : 0,
    maxPoints: 5,
    hint: !hasValidValues
      ? 'List valid values for props/options (e.g., "size: \'s\' | \'m\' | \'l\'")'
      : !contractsAligned
        ? `Resolve ${drift.issues.length} source/human/agent drift issue${drift.issues.length === 1 ? '' : 's'}`
        : undefined,
  })

  const qualityScore = qualityChecks.reduce((s, c) => s + c.points, 0)
  results.push({
    name: AGENT_CHECKLIST.contentQuality.name,
    score: qualityScore,
    maxScore: AGENT_CHECKLIST.contentQuality.maxScore,
    status: getStatus(qualityScore, AGENT_CHECKLIST.contentQuality.maxScore),
    checks: qualityChecks,
  })

  return { categories: results, projectType, drift }
}

/** Run the score categories without rendering a report. */
export async function performChecks(
  projectRoot: string,
  config: DeweyConfig | null,
): Promise<CategoryResult[]> {
  return (await performReadinessChecks(projectRoot, config)).categories
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

function getQuickWins(recommendations: Recommendation[]): string[] {
  return recommendations.slice(0, 3).map(recommendation => recommendation.action)
}

// ============================================
// Output Formatting
// ============================================

function printReport(report: AgentReadinessReport, verbose: boolean) {
  console.log(chalk.blue('\n' + '='.repeat(50)))
  console.log(chalk.blue.bold('  Agent Readiness Coaching'))
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

  const projectTypeStatus = report.projectType.passed ? chalk.green('complete') : chalk.yellow('incomplete')
  console.log(`\n  Project type: ${report.projectType.label} (${projectTypeStatus})`)
  const driftStatus = report.drift.status === 'clean' ? chalk.green('clean')
    : report.drift.status === 'issues' ? chalk.yellow('issues')
      : chalk.gray('not applicable')
  console.log(`  Drift: ${driftStatus} (${report.drift.checkedPairs} pairs, ${report.drift.checkedSourceFiles} source files)`)
  if (verbose) {
    for (const issue of report.drift.issues) {
      console.log(chalk.gray(`    - [${issue.code}] ${issue.message}`))
    }
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

  if (report.quickWins.length > 0) {
    console.log(chalk.bold('\n  Quick Wins:\n'))
    for (const win of report.quickWins) {
      console.log(`  ${chalk.cyan('→')} ${win}`)
    }
  }

  console.log()
}

// ============================================
// Main Command
// ============================================

export async function agentCoachCommand(options: CoachOptions) {
  const cwd = process.cwd()
  const loaded = await loadConfigWithRoot(cwd)
  const projectRoot = loaded?.projectRoot ?? cwd
  const config = loaded?.config ?? null

  if (!options.json) {
    console.log(chalk.blue('\n🤖 dewey agent'))
    console.log(chalk.gray('   Evaluating documented agent-readiness signals...\n'))
  }

  // Perform all checks
  const { categories, projectType, drift } = await performReadinessChecks(projectRoot, config)

  // Calculate totals
  const totalScore = categories.reduce((s, c) => s + c.score, 0)
  const maxScore = categories.reduce((s, c) => s + c.maxScore, 0)

  // Generate recommendations
  const recommendations = generateRecommendations(categories)
  const quickWins = getQuickWins(recommendations)

  const report: AgentReadinessReport = {
    kind: 'readiness-coaching',
    score: totalScore,
    maxScore,
    grade: getGrade(totalScore, maxScore),
    categories,
    projectType,
    drift,
    recommendations,
    quickWins,
  }

  // Output
  if (options.json) {
    console.log(JSON.stringify(report, null, 2))
    return
  }

  printReport(report, options.verbose || false)

}
