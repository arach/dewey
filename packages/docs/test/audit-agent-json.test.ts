import { afterEach, describe, expect, spyOn, test } from 'bun:test'
import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { agentCoachCommand } from '../src/cli/commands/agent-coach'
import { auditCommand } from '../src/cli/commands/audit'

const temporaryDirectories: string[] = []
const originalCwd = process.cwd()

async function makeTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'dewey-audit-'))
  temporaryDirectories.push(directory)
  return directory
}

afterEach(async () => {
  process.chdir(originalCwd)
  await Promise.all(
    temporaryDirectories.splice(0).map(directory =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

function completeDocument(title: string, heading = ''): string {
  const words = Array.from({ length: 100 }, (_, index) => `word${index}`).join(' ')

  return `---
title: ${title}
description: A complete test document
---

${heading}
## Details

\`\`\`bash
# CI-friendly
echo ready
\`\`\`

${words}

[Related documentation](./related.md)
`
}

async function writeConfig(root: string, required: string[] = []): Promise<void> {
  await writeFile(
    join(root, 'dewey.config.json'),
    JSON.stringify({
      project: { name: 'fixture' },
      docs: { path: './docs', required },
    }),
  )
}

async function captureJson(run: () => Promise<void>): Promise<Record<string, unknown>> {
  const output: string[] = []
  const consoleLog = spyOn(console, 'log').mockImplementation((value?: unknown) => {
    output.push(String(value))
  })
  try {
    await run()
  } finally {
    consoleLog.mockRestore()
  }
  expect(output).toHaveLength(1)
  return JSON.parse(output[0]) as Record<string, unknown>
}

describe('audit scoring and JSON output', () => {
  test('emits a structured JSON error when configuration is missing', async () => {
    const root = await makeTemporaryDirectory()
    const cliPath = join(import.meta.dir, '..', 'src', 'cli', 'index.ts')
    const process = Bun.spawn(['bun', cliPath, 'audit', '--json'], {
      cwd: root,
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(process.stdout).text(),
      new Response(process.stderr).text(),
      process.exited,
    ])

    expect(exitCode).toBe(1)
    expect(stderr).toBe('')
    expect(JSON.parse(stdout)).toMatchObject({
      kind: 'structural-validation',
      error: { code: 'CONFIG_NOT_FOUND' },
    })
  })

  test('scores duplicate H1 as a failed positive check and emits only JSON', async () => {
    const root = await makeTemporaryDirectory()
    const docsPath = join(root, 'docs')
    await mkdir(docsPath)
    await writeFile(
      join(root, 'dewey.config.json'),
      JSON.stringify({
        project: { name: 'fixture' },
        docs: { path: './docs', required: ['clean', 'duplicate'] },
      }),
    )
    await writeFile(join(docsPath, 'clean.md'), completeDocument('Clean'))
    await writeFile(
      join(docsPath, 'duplicate.md'),
      completeDocument('Duplicate', '# Duplicate\n'),
    )

    const output: string[] = []
    const consoleLog = spyOn(console, 'log').mockImplementation((value?: unknown) => {
      output.push(String(value))
    })

    try {
      process.chdir(root)
      await auditCommand({ json: true })
    } finally {
      consoleLog.mockRestore()
    }

    expect(output).toHaveLength(1)
    const report = JSON.parse(output[0]) as {
      score: number
      maxScore: number
      percentage: number
      sections: Array<{
        name: string
        score: number
        maxScore: number
        issues: string[]
      }>
    }
    const clean = report.sections.find(section => section.name === 'clean')
    const duplicate = report.sections.find(section => section.name === 'duplicate')

    expect(clean).toMatchObject({ score: 50, maxScore: 50, issues: [] })
    expect(duplicate).toMatchObject({ score: 45, maxScore: 50 })
    expect(duplicate?.issues).toContain(
      'Duplicate h1: frontmatter title and markdown # heading both present (layout renders frontmatter title as h1)',
    )
    expect(report).toMatchObject({ score: 95, maxScore: 100, percentage: 95 })
    expect(report).toMatchObject({ kind: 'structural-validation' })
    expect(report.sections.every(section => section.score <= section.maxScore)).toBe(true)
  })

  test('reports malformed frontmatter as structural evidence without crashing', async () => {
    const root = await makeTemporaryDirectory()
    const docsPath = join(root, 'docs')
    await mkdir(docsPath)
    await writeConfig(root, ['broken'])
    await writeFile(join(docsPath, 'broken.md'), '---\ntitle: [unterminated\n---\n# Broken')

    process.chdir(root)
    const report = await captureJson(() => auditCommand({ json: true })) as {
      sections: Array<{ name: string; status: string; score: number; issues: string[] }>
    }

    expect(report.sections).toHaveLength(1)
    expect(report.sections[0]).toMatchObject({ name: 'broken', status: 'incomplete', score: 0 })
    expect(report.sections[0].issues[0]).toStartWith('Malformed frontmatter:')
  })

  test('resolves the project root and audits nested documents recursively', async () => {
    const root = await makeTemporaryDirectory()
    const docsPath = join(root, 'docs')
    const nestedInvocation = join(root, 'packages', 'app')
    await mkdir(join(docsPath, 'guides'), { recursive: true })
    await mkdir(nestedInvocation, { recursive: true })
    await writeConfig(root, ['guides/setup'])
    await writeFile(join(docsPath, 'guides', 'setup.md'), completeDocument('Setup'))
    await writeFile(join(docsPath, 'guides', 'extra.md'), completeDocument('Extra'))

    process.chdir(nestedInvocation)
    const report = await captureJson(() => auditCommand({ json: true })) as {
      sections: Array<{ name: string }>
    }

    expect(report.sections.map(section => section.name)).toEqual(['guides/setup', 'guides/extra'])
  })

  test('excludes agent instructions and prompt templates from the human page rubric', async () => {
    const root = await makeTemporaryDirectory()
    const docsPath = join(root, 'docs')
    await mkdir(join(docsPath, 'prompts'), { recursive: true })
    await writeConfig(root)
    await writeFile(join(docsPath, 'overview.md'), completeDocument('Overview'))
    await writeFile(join(docsPath, 'AGENTS.md'), '# Local agent rules')
    await writeFile(join(docsPath, 'prompts', 'review.md'), '# Review prompt')

    process.chdir(root)
    const report = await captureJson(() => auditCommand({ json: true })) as {
      sections: Array<{ name: string }>
    }

    expect(report.sections.map(section => section.name)).toEqual(['overview'])
  })
})

describe('agent JSON output', () => {
  test('emits exactly one parseable JSON value with no banner', async () => {
    const root = await makeTemporaryDirectory()
    const output: string[] = []
    const consoleLog = spyOn(console, 'log').mockImplementation((value?: unknown) => {
      output.push(String(value))
    })

    try {
      process.chdir(root)
      await agentCoachCommand({ json: true })
    } finally {
      consoleLog.mockRestore()
    }

    expect(output).toHaveLength(1)
    const report = JSON.parse(output[0]) as {
      score: number
      maxScore: number
      categories: unknown[]
    }
    expect(report.maxScore).toBe(100)
    expect(report).toMatchObject({ kind: 'readiness-coaching' })
    expect(report.score).toBeGreaterThanOrEqual(0)
    expect(report.categories).toHaveLength(4)
  })

  test('derives sparse-project quick wins from failed checks', async () => {
    const root = await makeTemporaryDirectory()
    process.chdir(root)

    const report = await captureJson(() => agentCoachCommand({ json: true })) as {
      recommendations: Array<{ action: string }>
      quickWins: string[]
    }

    expect(report.quickWins).toEqual(report.recommendations.slice(0, 3).map(item => item.action))
    expect(report.quickWins).toEqual([
      'Run `dewey generate --agents-md` to create AGENTS.md',
      'Run `dewey generate --llms-txt` or create public/llm.txt',
      'Create docs/prompts/ with task templates for common operations',
    ])
  })

  test('uses nested content evidence rather than conventional filenames', async () => {
    const root = await makeTemporaryDirectory()
    const docsPath = join(root, 'docs')
    const invocationPath = join(root, 'packages', 'widget')
    await mkdir(join(docsPath, 'onboarding'), { recursive: true })
    await mkdir(join(docsPath, 'internals'), { recursive: true })
    await mkdir(join(docsPath, 'packages'), { recursive: true })
    await mkdir(join(docsPath, 'prompts'), { recursive: true })
    await mkdir(join(docsPath, 'agent', 'internals'), { recursive: true })
    await mkdir(join(docsPath, 'agent', 'onboarding'), { recursive: true })
    await mkdir(join(docsPath, 'agent', 'packages'), { recursive: true })
    await mkdir(join(root, 'src'), { recursive: true })
    await mkdir(invocationPath, { recursive: true })
    await writeConfig(root)
    await writeFile(join(root, 'AGENTS.md'), '# Agent context')
    await writeFile(join(root, 'llms.txt'), '# LLM context')
    await writeFile(join(root, 'CLAUDE.md'), '# Project rules')
    await writeFile(join(root, 'src', 'index.ts'), 'export const ready = true')
    await writeFile(join(docsPath, 'product.agent.md'), '# Dense agent context')
    await writeFile(join(docsPath, 'product.md'), '# Product Overview\n\nAbout this project.')
    await writeFile(join(docsPath, 'internals', 'system.md'), '# System Architecture\n\nProject structure.')
    await writeFile(join(docsPath, 'agent', 'internals', 'system.agent.md'), '# Architecture agent context')
    await writeFile(
      join(docsPath, 'onboarding', 'first-run.md'),
      `# Getting Started

Copy this context when you brief an AI assistant. See \`src/index.ts\`.

Valid options are 'safe' | 'fast'.

\`\`\`ts
import { ready } from '../../src/index'
console.log(ready)
\`\`\`
`,
    )
    await writeFile(
      join(docsPath, 'packages', 'public-contract.md'),
      `# SDK Reference

\`\`\`ts
export interface ClientOptions { mode: 'safe' | 'fast' }
\`\`\`
`,
    )
    await writeFile(join(docsPath, 'prompts', 'general.md'), '# Prompt\n\nBrief an agent.')
    await writeFile(join(docsPath, 'skills.md'), '# Skills')
    await writeFile(join(docsPath, 'agent', 'onboarding', 'first-run.agent.md'), '# Onboarding agent context')
    await writeFile(join(docsPath, 'agent', 'packages', 'public-contract.agent.md'), '# API agent context')
    await writeFile(join(docsPath, 'agent', 'skills.agent.md'), '# Skills agent context')

    process.chdir(invocationPath)
    const report = await captureJson(() => agentCoachCommand({ json: true })) as {
      score: number
      maxScore: number
      grade: string
      quickWins: string[]
      categories: Array<{ checks: Array<{ name: string; passed: boolean }> }>
    }

    expect(report).toMatchObject({ score: 100, maxScore: 100, grade: 'A', quickWins: [] })
    expect(report.categories.flatMap(category => category.checks).every(check => check.passed)).toBe(true)
  })

  test('does not advertise the removed --fix contract', async () => {
    const cliPath = join(import.meta.dir, '..', 'src', 'cli', 'index.ts')
    const process = Bun.spawn(['bun', cliPath, 'agent', '--help'], { stdout: 'pipe', stderr: 'pipe' })
    const [stdout, exitCode] = await Promise.all([new Response(process.stdout).text(), process.exited])

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('--fix')
  })
})
