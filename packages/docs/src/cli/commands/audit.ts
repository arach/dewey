import chalk from 'chalk'
import { readdir, readFile, access } from 'fs/promises'
import { basename, join, relative, sep } from 'path'
import matter from 'gray-matter'
import { loadConfigWithRoot } from '../config.js'
import { analyzeDocumentationDrift, type DriftDocument, type DriftReport } from '../drift.js'
import {
  checkProjectTypeDocumentation,
  type ProjectTypeDocumentationCheck,
} from '../project-types.js'

interface AuditOptions {
  verbose?: boolean
  json?: boolean
}

interface AuditResult {
  kind: 'structural-validation'
  score: number
  maxScore: number
  percentage: number
  sections: SectionResult[]
  projectType: ProjectTypeDocumentationCheck
  drift: DriftReport
  recommendations: string[]
}

interface SectionResult {
  name: string
  status: 'complete' | 'incomplete' | 'missing'
  score: number
  maxScore: number
  issues: string[]
}

interface MarkdownFile {
  id: string
  path: string
}

interface AuditErrorResult {
  kind: 'structural-validation'
  error: {
    code: 'CONFIG_NOT_FOUND' | 'DOCS_NOT_FOUND'
    message: string
  }
}

function hasMarkdownH1(content: string): boolean {
  const prose = content.replace(/```[\s\S]*?```/g, '')
  return /^#\s+.+$/m.test(prose)
}

const SECTION_CHECKS = {
  hasTitle: { points: 5, check: (content: string, fm: Record<string, unknown>) => !!fm.title || hasMarkdownH1(content) },
  hasDescription: { points: 5, check: (_content: string, fm: Record<string, unknown>) => !!fm.description },
  hasCodeExample: { points: 10, check: (content: string) => /```\w+/.test(content) },
  hasHeadings: { points: 5, check: (content: string) => /^##\s+.+$/m.test(content) },
  minWordCount: { points: 10, check: (content: string) => content.split(/\s+/).length >= 100 },
  hasLinks: { points: 5, check: (content: string) => /\[.+\]\(.+\)/.test(content) },
  noDuplicateH1: { points: 5, check: (content: string, fm: Record<string, unknown>) => !(!!fm.title && hasMarkdownH1(content)) },
  hasErrorExample: { points: 5, check: (content: string, fm: Record<string, unknown>, name: string) => {
    const title = typeof fm.title === 'string' ? fm.title : ''
    const headings = content.match(/^#{1,3}\s+.+$/gm)?.join('\n') ?? ''
    const hasApiLabel = /\b(api|reference|sdk|endpoint|method|function)s?\b/i.test(`${name}\n${title}\n${headings}`)
    const hasApiSurface = /\b(GET|POST|PUT|PATCH|DELETE)\s+\//.test(content)
      || /\b(interface|type|class|function)\s+\w+/.test(content)
    const isApiDoc = hasApiLabel && hasApiSurface
    if (!isApiDoc) return true // only applies to API docs
    return /try\s*\{|catch\s*\(|\.catch\(|error|reject|throw/im.test(content)
  }},
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function findExistingFile(paths: string[]): Promise<string | null> {
  for (const path of paths) {
    if (await fileExists(path)) return path
  }
  return null
}

async function discoverMarkdownFiles(docsPath: string): Promise<MarkdownFile[]> {
  const files: MarkdownFile[] = []

  async function walk(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        await walk(path)
      } else if (entry.isFile() && isHumanPagePath(relative(docsPath, path))) {
        const relativePath = relative(docsPath, path).split(sep).join('/')
        files.push({ id: relativePath.slice(0, -3), path })
      }
    }
  }

  await walk(docsPath)
  return files.sort((a, b) => a.id.localeCompare(b.id))
}

async function discoverDriftDocuments(docsPath: string): Promise<DriftDocument[]> {
  const documents: DriftDocument[] = []

  async function walk(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        await walk(path)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const raw = await readFile(path, 'utf8')
        documents.push({
          path: relative(docsPath, path).split(sep).join('/'),
          body: raw,
        })
      }
    }
  }

  await walk(docsPath)
  return documents.sort((a, b) => a.path.localeCompare(b.path))
}

function isHumanPagePath(relativePath: string): boolean {
  const normalized = relativePath.split(sep).join('/')
  const segments = normalized.split('/')
  const filename = segments[segments.length - 1] ?? ''
  return filename.endsWith('.md')
    && !filename.endsWith('.agent.md')
    && filename.toLowerCase() !== 'agents.md'
    && !segments.slice(0, -1).some(segment => ['agent', 'prompts'].includes(segment.toLowerCase()))
}

function failAudit(options: AuditOptions, code: AuditErrorResult['error']['code'], message: string): never {
  if (options.json) {
    const result: AuditErrorResult = { kind: 'structural-validation', error: { code, message } }
    console.log(JSON.stringify(result))
  } else {
    console.error(chalk.red(`\n❌ ${message}\n`))
  }
  process.exit(1)
}

function requiredSectionCandidates(docsPath: string, section: string): string[] {
  const normalized = section.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\.md$/, '')
  return [join(docsPath, `${normalized}.md`), join(docsPath, normalized, 'index.md')]
}

async function auditSection(name: string, filePath: string): Promise<SectionResult> {
  const issues: string[] = []
  let score = 0
  let maxScore = 0

  if (!await fileExists(filePath)) {
    return {
      name,
      status: 'missing',
      score: 0,
      maxScore: Object.values(SECTION_CHECKS).reduce((sum, c) => sum + c.points, 0),
      issues: [`${name}.md not found`],
    }
  }

  const content = await readFile(filePath, 'utf-8')
  let frontmatter: Record<string, unknown>
  let body: string
  try {
    const parsed = matter(content)
    frontmatter = parsed.data
    body = parsed.content
  } catch (error) {
    const message = error instanceof Error ? error.message.split('\n')[0] : String(error)
    return {
      name,
      status: 'incomplete',
      score: 0,
      maxScore: Object.values(SECTION_CHECKS).reduce((sum, check) => sum + check.points, 0),
      issues: [`Malformed frontmatter: ${message}`],
    }
  }

  for (const [checkName, { points, check }] of Object.entries(SECTION_CHECKS)) {
    maxScore += points
    if (check(body, frontmatter, name)) {
      score += points
    } else {
      issues.push(formatIssue(checkName))
    }
  }

  return {
    name,
    status: issues.length === 0 ? 'complete' : 'incomplete',
    score,
    maxScore,
    issues,
  }
}

function formatIssue(checkName: string): string {
  const messages: Record<string, string> = {
    hasTitle: 'Missing title (add frontmatter title or # heading)',
    hasDescription: 'Missing description in frontmatter',
    hasCodeExample: 'No code examples found',
    hasHeadings: 'No section headings (## headers)',
    minWordCount: 'Content too short (aim for 100+ words)',
    hasLinks: 'No links to other docs or resources',
    noDuplicateH1: 'Duplicate h1: frontmatter title and markdown # heading both present (layout renders frontmatter title as h1)',
    hasErrorExample: 'API doc missing error handling example (add a try/catch or error response example)',
  }
  return messages[checkName] || checkName
}

export async function auditCommand(options: AuditOptions) {
  const cwd = process.cwd()
  const loaded = await loadConfigWithRoot(cwd)

  if (!loaded) {
    failAudit(options, 'CONFIG_NOT_FOUND', 'No Dewey configuration found. Run `dewey init` first.')
  }

  const { config, projectRoot } = loaded

  const docsPath = join(projectRoot, config.docs.path)
  if (!await fileExists(docsPath)) {
    failAudit(options, 'DOCS_NOT_FOUND', `Docs directory not found: ${config.docs.path}`)
  }

  if (!options.json) {
    console.log(chalk.blue(`\n📋 Validating ${config.project.name} documentation structure...\n`))
  }

  const markdownFiles = await discoverMarkdownFiles(docsPath)
  const driftDocuments = await discoverDriftDocuments(docsPath)
  const humanEvidenceDocuments = driftDocuments.filter(document => isHumanPagePath(document.path))
  const projectType = checkProjectTypeDocumentation(config.project.type, humanEvidenceDocuments)
  const drift = await analyzeDocumentationDrift({
    projectRoot,
    documents: driftDocuments,
    configuredSourcePaths: Object.values(config.agent.entryPoints),
  })

  // Audit each section
  const requiredSections = config.docs.required
  const results: SectionResult[] = []
  const recommendations: string[] = []
  const auditedPaths = new Set<string>()

  // Check required sections
  for (const section of requiredSections) {
    const candidates = requiredSectionCandidates(docsPath, section)
    const filePath = await findExistingFile(candidates) ?? candidates[0]
    const result = await auditSection(section, filePath)
    results.push(result)
    if (result.status !== 'missing') auditedPaths.add(filePath)

    if (result.status === 'missing') {
      recommendations.push(`Create required ${section}.md`)
    }
  }

  // Audit every discovered human-facing document, including nested pages.
  for (const file of markdownFiles) {
    if (!auditedPaths.has(file.path)) {
      const result = await auditSection(file.id, file.path)
      results.push(result)
    }
  }

  for (const evidence of projectType.evidence) {
    if (!evidence.passed) {
      recommendations.push(`Add ${projectType.label.toLowerCase()} evidence: ${evidence.requirement}`)
    }
  }
  if (drift.issues.length > 0) {
    recommendations.push(`Resolve ${drift.issues.length} documentation drift issue${drift.issues.length === 1 ? '' : 's'}`)
  }

  // Calculate total score
  const totalScore = results.reduce((sum, r) => sum + r.score, 0)
  const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0)
  const percentage = maxScore === 0 ? 0 : Math.round((totalScore / maxScore) * 100)

  const auditResult: AuditResult = {
    kind: 'structural-validation',
    score: totalScore,
    maxScore,
    percentage,
    sections: results,
    projectType,
    drift,
    recommendations,
  }

  // Output
  if (options.json) {
    console.log(JSON.stringify(auditResult, null, 2))
    return
  }

  // Print results
  for (const result of results) {
    const icon = result.status === 'complete' ? chalk.green('✓')
      : result.status === 'incomplete' ? chalk.yellow('⚠')
        : chalk.red('✗')

    const statusText = result.status === 'complete' ? chalk.green('complete')
      : result.status === 'incomplete' ? chalk.yellow('incomplete')
        : chalk.red('missing')

    const label = basename(result.name) === 'index' ? result.name : `${result.name}.md`
    console.log(`${icon} ${label} - ${statusText} (${result.score}/${result.maxScore})`)

    if (options.verbose && result.issues.length > 0) {
      for (const issue of result.issues) {
        console.log(chalk.gray(`    - ${issue}`))
      }
    }
  }

  const projectTypeIcon = projectType.passed ? chalk.green('✓') : chalk.yellow('⚠')
  console.log(`${projectTypeIcon} ${projectType.label} evidence - ${projectType.passed ? chalk.green('complete') : chalk.yellow('incomplete')}`)
  if (options.verbose) {
    for (const evidence of projectType.evidence) {
      const icon = evidence.passed ? chalk.green('✓') : chalk.red('✗')
      const source = evidence.document ? chalk.gray(` (${evidence.document})`) : ''
      console.log(`    ${icon} ${evidence.requirement}${source}`)
    }
  }

  const driftIcon = drift.status === 'clean' ? chalk.green('✓')
    : drift.status === 'issues' ? chalk.yellow('⚠')
      : chalk.gray('○')
  console.log(`${driftIcon} Documentation drift - ${drift.status} (${drift.checkedPairs} pairs, ${drift.checkedSourceFiles} source files)`)
  if (options.verbose) {
    for (const issue of drift.issues) {
      console.log(chalk.gray(`    - [${issue.code}] ${issue.message}`))
    }
  }

  // Print score
  const scoreColor = percentage >= 80 ? chalk.green : percentage >= 50 ? chalk.yellow : chalk.red
  console.log(`\n${chalk.bold('Score:')} ${scoreColor(`${percentage}/100`)} (${totalScore}/${maxScore} points)`)

  // Print recommendations
  if (recommendations.length > 0) {
    console.log(chalk.blue('\n📝 Recommendations:'))
    for (const rec of recommendations) {
      console.log(chalk.gray(`  - ${rec}`))
    }
  }

  console.log()
}
