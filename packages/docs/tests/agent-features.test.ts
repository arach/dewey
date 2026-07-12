import { afterEach, describe, expect, spyOn, test } from 'bun:test'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { buildAgentManifest, collectMarkdownArtifacts, writeAgentArtifacts } from '../src/cli/agent-artifacts'
import { agentCoachCommand, performChecks } from '../src/cli/commands/agent-coach'
import { loadDocs } from '../src/cli/commands/generate'
import { defineConfig } from '../src/cli/schema'

const temporaryDirectories: string[] = []

async function temporaryProject() {
  const directory = await mkdtemp(join(tmpdir(), 'dewey-agent-features-'))
  temporaryDirectories.push(directory)
  await mkdir(join(directory, 'docs'), { recursive: true })
  return directory
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('agent-facing documentation', () => {
  test('agent outputs prefer the .agent.md counterpart content', async () => {
    const root = await temporaryProject()
    await writeFile(join(root, 'docs/overview.md'), '# Human Overview\n\nNarrative for people.\n')
    await writeFile(join(root, 'docs/overview.agent.md'), '---\ntitle: Agent Overview\n---\n# Agent Overview\n\n| Key | Value |\n|---|---|\n| mode | dense |\n')

    const [doc] = await loadDocs(root, join(root, 'docs'), 'docs', ['overview'])

    expect(doc.title).toBe('Agent Overview')
    expect(doc.content).toContain('| mode | dense |')
    expect(doc.content).not.toContain('Narrative for people')
    expect(doc.agentSourcePath).toBe('docs/overview.agent.md')
  })

  test('manifest keeps prompts out of the docs collection', async () => {
    const root = await temporaryProject()
    await mkdir(join(root, 'docs/prompts'), { recursive: true })
    await writeFile(join(root, 'docs/overview.md'), '# Overview\n')
    await writeFile(join(root, 'docs/prompts/review.md'), '# Review Prompt\n')

    const artifacts = await collectMarkdownArtifacts({ rootDir: root, docsDir: join(root, 'docs') })
    const manifest = buildAgentManifest(artifacts)

    expect(manifest.docs.map((doc) => doc.slug)).toEqual(['overview'])
    expect(manifest.prompts.map((prompt) => prompt.slug)).toEqual(['prompts/review'])
  })

  test('generation removes raw artifacts whose sources were deleted', async () => {
    const root = await temporaryProject()
    const source = join(root, 'docs/obsolete.md')
    await writeFile(source, '# Obsolete\n')
    await writeAgentArtifacts({ rootDir: root, docsDir: join(root, 'docs'), outputDir: root })
    await rm(source)

    await writeAgentArtifacts({ rootDir: root, docsDir: join(root, 'docs'), outputDir: root })

    expect(await readFile(join(root, 'agent/manifest.json'), 'utf8')).not.toContain('obsolete')
    await expect(readFile(join(root, 'agent/raw/docs/obsolete.md'), 'utf8')).rejects.toThrow()
  })

  test('readiness requires real prompts and a counterpart for every doc page', async () => {
    const root = await temporaryProject()
    await mkdir(join(root, 'docs/agent'), { recursive: true })
    await mkdir(join(root, 'docs/prompts'), { recursive: true })
    await writeFile(join(root, 'docs/overview.md'), '# Overview\n')
    const config = defineConfig({ project: { name: 'test' } })

    const categories = await performChecks(root, config)
    const agentFiles = categories.find((category) => category.name === 'Agent-Optimized Files')
    const handoff = categories.find((category) => category.name === 'Human-to-Agent Handoff')

    expect(agentFiles?.checks.find((check) => check.name.includes('counterpart'))?.passed).toBe(false)
    expect(handoff?.checks.find((check) => check.name === 'Has prompt templates')?.passed).toBe(false)
  })

  test('--json emits one parseable JSON document without a banner', async () => {
    const output: string[] = []
    const log = spyOn(console, 'log').mockImplementation((value = '') => output.push(String(value)))

    try {
      await agentCoachCommand({ json: true })
    } finally {
      log.mockRestore()
    }

    const report = JSON.parse(output.join('\n'))
    expect(report).toHaveProperty('score')
    expect(output.join('\n')).not.toContain('dewey agent')
  })
})
