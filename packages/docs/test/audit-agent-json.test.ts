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

\`\`\`ts
const ready = true
\`\`\`

${words}

[Related documentation](./related.md)
`
}

describe('audit scoring and JSON output', () => {
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
    expect(report.sections.every(section => section.score <= section.maxScore)).toBe(true)
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
    expect(report.score).toBeGreaterThanOrEqual(0)
    expect(report.categories).toHaveLength(4)
  })
})
