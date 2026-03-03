import chalk from 'chalk'
import { readdir, readFile, access } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'
import ora from 'ora'
import { loadConfig } from '../config.js'

interface AuditOptions {
  verbose?: boolean
  json?: boolean
  strict?: boolean
}

interface AuditResult {
  score: number
  maxScore: number
  percentage: number
  sections: SectionResult[]
  recommendations: string[]
}

interface SectionResult {
  name: string
  status: 'complete' | 'incomplete' | 'missing'
  score: number
  maxScore: number
  issues: string[]
}

const SECTION_CHECKS = {
  hasTitle: { points: 5, check: (content: string, fm: Record<string, unknown>) => !!fm.title || /^#\s+.+$/m.test(content) },
  hasDescription: { points: 5, check: (_content: string, fm: Record<string, unknown>) => !!fm.description },
  hasCodeExample: { points: 10, check: (content: string) => /```\w+/.test(content) },
  hasHeadings: { points: 5, check: (content: string) => /^##\s+.+$/m.test(content) },
  minWordCount: { points: 10, check: (content: string) => content.split(/\s+/).length >= 100 },
  hasLinks: { points: 5, check: (content: string) => /\[.+\]\(.+\)/.test(content) },
  noDuplicateH1: { points: -5, check: (content: string, fm: Record<string, unknown>) => !(!!fm.title && /^#\s+.+$/m.test(content)) },
  hasErrorExample: { points: 5, check: (content: string, fm: Record<string, unknown>) => {
    const isApiDoc = /api/i.test(String(fm.title || ''))
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
  const { data: frontmatter, content: body } = matter(content)

  for (const [checkName, { points, check }] of Object.entries(SECTION_CHECKS)) {
    maxScore += points
    if (check(body, frontmatter)) {
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

  const configSpinner = ora('Loading configuration...').start()
  const config = await loadConfig(cwd)

  if (!config) {
    configSpinner.fail('No dewey.config.ts found. Run `dewey init` first.')
    process.exit(1)
  }

  const docsPath = join(cwd, config.docs.path)
  if (!await fileExists(docsPath)) {
    configSpinner.fail(`Docs directory not found: ${config.docs.path}`)
    process.exit(1)
  }
  configSpinner.succeed('Configuration loaded')

  const auditSpinner = ora(`Auditing ${config.project.name} documentation...`).start()

  const files = await readdir(docsPath)
  const mdFiles = files.filter(f => f.endsWith('.md'))

  const requiredSections = config.docs.required
  const optionalSections = ['api', 'configuration', 'architecture', 'troubleshooting', 'changelog']
    .filter(s => !requiredSections.includes(s))

  const results: SectionResult[] = []
  const recommendations: string[] = []

  for (const section of requiredSections) {
    auditSpinner.text = `Auditing ${section}.md...`
    const filePath = join(docsPath, `${section}.md`)
    const result = await auditSection(section, filePath)
    results.push(result)

    if (result.status === 'missing') {
      recommendations.push(`Create required ${section}.md`)
    }
  }

  for (const section of optionalSections) {
    const filePath = join(docsPath, `${section}.md`)
    if (await fileExists(filePath)) {
      auditSpinner.text = `Auditing ${section}.md...`
      const result = await auditSection(section, filePath)
      results.push(result)
    }
  }

  for (const file of mdFiles) {
    const sectionName = file.replace('.md', '')
    if (!results.find(r => r.name === sectionName)) {
      auditSpinner.text = `Auditing ${file}...`
      const result = await auditSection(sectionName, join(docsPath, file))
      results.push(result)
    }
  }

  const totalScore = results.reduce((sum, r) => sum + r.score, 0)
  const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0)
  const percentage = Math.round((totalScore / maxScore) * 100)

  if (config.agent.criticalContext.length === 0) {
    recommendations.push('Add criticalContext rules in dewey.config.ts for better agent documentation')
  }
  if (Object.keys(config.agent.entryPoints).length === 0) {
    recommendations.push('Add entryPoints in dewey.config.ts to help agents navigate the codebase')
  }

  auditSpinner.succeed(`Audited ${results.length} sections (${percentage}/100)`)

  const auditResult: AuditResult = {
    score: totalScore,
    maxScore,
    percentage,
    sections: results,
    recommendations,
  }

  if (options.json) {
    console.log(JSON.stringify(auditResult, null, 2))
    return
  }

  for (const result of results) {
    const icon = result.status === 'complete' ? chalk.green('✓')
      : result.status === 'incomplete' ? chalk.yellow('⚠')
        : chalk.red('✗')

    const statusText = result.status === 'complete' ? chalk.green('complete')
      : result.status === 'incomplete' ? chalk.yellow('incomplete')
        : chalk.red('missing')

    console.log(`${icon} ${result.name}.md - ${statusText} (${result.score}/${result.maxScore})`)

    if (options.verbose && result.issues.length > 0) {
      for (const issue of result.issues) {
        console.log(chalk.gray(`    - ${issue}`))
      }
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

  if (options.strict) {
    const hasErrors = results.some(r => r.status === 'missing')
    const hasMissingRequired = results
      .filter(r => requiredSections.includes(r.name))
      .some(r => r.status === 'missing' || r.issues.length > 0)

    if (hasErrors || hasMissingRequired) {
      const missing = results.filter(r => r.status === 'missing').map(r => r.name)
      const withIssues = results
        .filter(r => requiredSections.includes(r.name) && r.issues.length > 0 && r.status !== 'missing')
        .map(r => r.name)

      const parts: string[] = []
      if (missing.length > 0) parts.push(`missing sections: ${missing.join(', ')}`)
      if (withIssues.length > 0) parts.push(`sections with issues: ${withIssues.join(', ')}`)

      console.error(chalk.red(`✗ Strict mode: audit failed — ${parts.join('; ')}.\n`))
      process.exit(1)
    }
  }
}
