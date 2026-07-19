import { afterEach, describe, expect, spyOn, test } from 'bun:test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { agentCoachCommand } from '../src/cli/commands/agent-coach'
import { auditCommand } from '../src/cli/commands/audit'
import { initCommand } from '../src/cli/commands/init'
import { PROJECT_TYPE_PROFILES, checkProjectTypeDocumentation } from '../src/cli/project-types'
import { ProjectType, type ProjectType as ProjectTypeName } from '../src/cli/schema'
import { improveAIPrompts, improveAIPromptsSkill } from '../src/index'

const temporaryDirectories: string[] = []
const originalCwd = process.cwd()

async function makeTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'dewey-project-type-'))
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

async function runInitSilently(type: ProjectTypeName): Promise<string> {
  const root = await makeTemporaryDirectory()
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({ name: 'fixture', description: 'A fixture project' }),
  )
  process.chdir(root)
  const consoleLog = spyOn(console, 'log').mockImplementation(() => {})
  try {
    await initCommand({ type })
  } finally {
    consoleLog.mockRestore()
  }
  return root
}

describe('project type validation and scaffolds', () => {
  for (const type of ProjectType.options) {
    test(`${type} creates a distinct, evidence-complete human and agent scaffold`, async () => {
      const root = await runInitSilently(type)
      const profile = PROJECT_TYPE_PROFILES[type]
      const config = await readFile(join(root, 'dewey.config.ts'), 'utf8')
      const documents = await Promise.all(profile.requiredDocuments.map(async path => ({
        path: `${path}.md`,
        body: await readFile(join(root, 'docs', `${path}.md`), 'utf8'),
      })))

      expect(config).toContain(`type: '${type}'`)
      expect(config).toContain(`required: ${JSON.stringify(profile.requiredDocuments)}`)
      expect(checkProjectTypeDocumentation(type, documents)).toMatchObject({
        projectType: type,
        label: profile.label,
        passed: true,
      })

      for (const path of profile.requiredDocuments) {
        expect(await readFile(join(root, 'docs', 'agent', `${path}.agent.md`), 'utf8')).toContain('# fixture')
      }
    })
  }

  test('rejects an unknown project type before writing files', async () => {
    const root = await makeTemporaryDirectory()
    process.chdir(root)

    await expect(initCommand({ type: 'website' })).rejects.toThrow(
      'Invalid project type "website". Expected one of:',
    )
  })
})

describe('deterministic drift evidence', () => {
  test('reports source path, human-agent, and source-contract drift with exact evidence', async () => {
    const root = await makeTemporaryDirectory()
    await mkdir(join(root, 'docs', 'agent'), { recursive: true })
    await mkdir(join(root, 'src'), { recursive: true })
    await writeFile(join(root, 'dewey.config.json'), JSON.stringify({
      project: { name: 'fixture', type: 'npm-package' },
      docs: { path: './docs', required: [] },
      agent: { entryPoints: { main: 'src/index.ts' } },
    }))
    await writeFile(join(root, 'src', 'index.ts'), "export type Mode = 'safe' | 'fast'\n")
    await writeFile(join(root, 'docs', 'api.md'), `# API reference

Install with \`bun add fixture\`. The public contract is:

\`\`\`ts
export type Mode = 'safe' | 'fast'
export function run(mode: Mode): void
\`\`\`

Implementation: \`src/missing.ts\`.
`)
    await writeFile(join(root, 'docs', 'agent', 'api.agent.md'), `# API contract

\`\`\`ts
export type Mode = 'safe' | 'slow'
\`\`\`
`)

    process.chdir(root)
    const audit = await captureJson(() => auditCommand({ json: true })) as {
      drift: { status: string; issues: Array<Record<string, unknown>> }
    }
    const codes = audit.drift.issues.map(issue => issue.code)

    expect(audit.drift.status).toBe('issues')
    expect(codes).toContain('MISSING_SOURCE_REFERENCE')
    expect(codes).toContain('HUMAN_AGENT_CONTRACT_MISMATCH')
    expect(codes).toContain('DOC_SOURCE_CONTRACT_MISMATCH')
    expect(audit.drift.issues).toContainEqual(expect.objectContaining({
      code: 'HUMAN_AGENT_CONTRACT_MISMATCH',
      symbol: 'Mode',
      expected: ['fast', 'safe'],
      actual: ['safe', 'slow'],
    }))

    const coach = await captureJson(() => agentCoachCommand({ json: true })) as {
      drift: { status: string }
      categories: Array<{ checks: Array<{ name: string; passed: boolean }> }>
    }
    expect(coach.drift.status).toBe('issues')
    expect(coach.categories.flatMap(category => category.checks)).toContainEqual(expect.objectContaining({
      name: 'Valid values are listed and aligned across source and paired docs',
      passed: false,
    }))
  })

  test('reports clean drift when source, human docs, and the paired agent contract agree', async () => {
    const root = await makeTemporaryDirectory()
    await mkdir(join(root, 'docs', 'agent'), { recursive: true })
    await mkdir(join(root, 'src'), { recursive: true })
    await writeFile(join(root, 'dewey.config.json'), JSON.stringify({
      project: { name: 'fixture', type: 'npm-package' },
      docs: { path: './docs', required: [] },
    }))
    await writeFile(join(root, 'src', 'index.ts'), "export type Mode = 'safe' | 'fast'\n")
    const contract = "export type Mode = 'safe' | 'fast'"
    await writeFile(join(root, 'docs', 'api.md'), `# API\n\nInstall with \`bun add fixture\`.\n\n\`\`\`ts\n${contract}\n\`\`\``)
    await writeFile(join(root, 'docs', 'agent', 'api.agent.md'), `# API\n\n\`\`\`ts\n${contract}\n\`\`\``)

    process.chdir(root)
    const audit = await captureJson(() => auditCommand({ json: true })) as {
      projectType: { passed: boolean }
      drift: { status: string; checkedPairs: number; checkedSourceFiles: number; issues: unknown[] }
    }

    expect(audit.projectType.passed).toBe(true)
    expect(audit.drift).toMatchObject({
      status: 'clean',
      checkedPairs: 1,
      checkedSourceFiles: 1,
      issues: [],
    })
  })
})

test('improveAIPrompts is a public skill with a compatibility alias', () => {
  expect(improveAIPrompts).toBe(improveAIPromptsSkill)
  expect(improveAIPrompts.passes.discovery.prompt).toContain('What does this system output?')
  expect(improveAIPrompts.criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0)).toBe(25)
})
