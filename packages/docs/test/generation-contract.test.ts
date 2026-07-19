import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  buildAgentArtifactFiles,
  buildAgentManifest,
  collectMarkdownArtifacts,
  type MarkdownArtifact,
} from '../src/cli/agent-artifacts'
import { createCommand, loadMarkdownDocs } from '../src/cli/commands/create'
import { extractLlmsSummary, generateCommand, loadDocs } from '../src/cli/commands/generate'
import { ASTRO_TEMPLATES } from '../src/cli/templates/astro'

const temporaryDirectories: string[] = []

async function makeTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'dewey-generation-contract-'))
  temporaryDirectories.push(directory)
  return directory
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory =>
    rm(directory, { recursive: true, force: true }),
  ))
})

describe('canonical document pipeline', () => {
  test('create, generate, and agent artifacts share parsed metadata', async () => {
    const root = await makeTemporaryDirectory()
    const docsDir = join(root, 'docs')
    await mkdir(join(docsDir, 'guides'), { recursive: true })
    await writeFile(join(docsDir, 'guides', 'setup.md'), [
      '---',
      'description: Install safely',
      'order: 7',
      'group: Guides',
      '---',
      '',
      '# Setup **Guide**',
      '',
      'Follow the steps.',
      '',
    ].join('\n'))

    const createDocs = await loadMarkdownDocs(docsDir)
    const generateDocs = await loadDocs(root, docsDir, 'docs', ['guides/setup'])
    const artifacts = await collectMarkdownArtifacts({ rootDir: root, docsDir })

    expect(createDocs[0]).toMatchObject({
      id: 'guides/setup',
      title: 'Setup Guide',
      description: 'Install safely',
      order: 7,
      groupTitle: 'Guides',
      content: '# Setup **Guide**\n\nFollow the steps.',
    })
    expect(generateDocs[0]).toMatchObject({
      id: createDocs[0].id,
      title: createDocs[0].title,
      description: createDocs[0].description,
      content: createDocs[0].content,
    })
    expect(artifacts[0]).toMatchObject({
      slug: createDocs[0].id,
      title: createDocs[0].title,
      description: createDocs[0].description,
      content: createDocs[0].content,
    })
  })
})

describe('agent artifact composition', () => {
  test('derives retrieval indexes from one manifest and materializes JSON content once', async () => {
    const root = await makeTemporaryDirectory()
    const docsDir = join(root, 'docs')
    await mkdir(join(docsDir, 'prompts'), { recursive: true })
    await writeFile(join(docsDir, 'overview.md'), '# Overview\n\nUNIQUE_OVERVIEW_BODY\n')
    await writeFile(join(docsDir, 'prompts', 'review.md'), '# Review\n\nUNIQUE_PROMPT_BODY\n')

    const built = await buildAgentArtifactFiles({ rootDir: root, docsDir, project: { name: 'fixture' } })
    const files = new Map(built.files.map(file => [file.path, file.content]))
    const manifest = JSON.parse(files.get('agent/manifest.json')!) as {
      artifacts: Record<string, string | Record<string, string>>
      docs: Array<Record<string, unknown>>
      prompts: Array<Record<string, unknown>>
    }
    const docsJson = JSON.parse(files.get('agent/docs.json')!) as typeof manifest
    const promptsJson = JSON.parse(files.get('agent/prompts.json')!) as typeof manifest
    const contextJson = JSON.parse(files.get('agent/context.json')!) as typeof manifest

    expect(files.get('agent/context.md')).toContain(manifest.artifacts.manifest as string)
    expect(files.get('agent/context.md')).toContain(manifest.artifacts.allMarkdown as string)
    expect(files.get('agent/context.md')).not.toContain('UNIQUE_OVERVIEW_BODY')
    expect(files.get('agent/bundles/all.md')).toContain('UNIQUE_OVERVIEW_BODY')

    expect(docsJson.docs.find(doc => doc.slug === 'overview')?.markdown).toContain('UNIQUE_OVERVIEW_BODY')
    expect(docsJson.docs.find(doc => doc.slug === 'prompts/review')?.markdown).toBeUndefined()
    expect(docsJson.prompts[0]?.markdown).toBeUndefined()
    expect(promptsJson.prompts[0]?.markdown).toContain('UNIQUE_PROMPT_BODY')
    expect(contextJson.docs.every(doc => doc.markdown === undefined && doc.content === undefined)).toBe(true)
    expect(contextJson.prompts.every(doc => doc.markdown === undefined && doc.content === undefined)).toBe(true)
    expect(manifest.prompts[0]?.promptUrl).toBe('/agent/prompts/review.md')
  })

  test('normalizes a fallback prompt URL without duplicating prompts/', () => {
    const prompt = {
      id: 'prompts/review',
      slug: 'prompts/review',
      kind: 'prompt',
      promptId: undefined,
      title: 'Review',
      description: '',
      sourcePath: 'docs/prompts/review.md',
      url: '/agent/raw/docs/prompts/review.md',
      rawUrl: '/agent/raw/docs/prompts/review.md',
      promptUrl: undefined,
      frontmatter: {},
      headings: [],
      tokensEstimate: 1,
      rawMarkdown: '# Review\n',
      content: '# Review',
    } satisfies MarkdownArtifact

    expect(buildAgentManifest([prompt]).prompts[0].promptUrl).toBe('/agent/prompts/review.md')
  })
})

describe('llms.txt summaries and installation identifiers', () => {
  test('summarizes metadata, prose, lists, and heading-only pages', () => {
    expect(extractLlmsSummary({ title: 'A', description: 'Use **metadata** first.', content: 'Ignored.' }))
      .toBe('Use metadata first.')
    expect(extractLlmsSummary({ title: 'B', content: '# Heading\n\nA useful [paragraph](https://example.com).' }))
      .toBe('A useful paragraph.')
    expect(extractLlmsSummary({ title: 'B2', content: '# Heading\nA short page summary.' }))
      .toBe('A short page summary.')
    expect(extractLlmsSummary({ title: 'C', content: '- First thing\n- Second thing\n- Third thing\n- Fourth thing' }))
      .toBe('First thing; Second thing; Third thing')
    expect(extractLlmsSummary({ title: 'D', content: '## Only Heading' })).toBe('Only Heading')
  })

  test('preserves scoped npm package names in install.md', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    await mkdir(join(root, 'docs'), { recursive: true })
    await writeFile(join(root, 'docs', 'overview.md'), '# Overview\n')
    await writeFile(join(root, 'dewey.config.json'), JSON.stringify({
      project: { name: '@scope/widget', type: 'npm-package' },
      agent: { sections: [] },
      docs: { path: './docs', output: './generated' },
    }))

    try {
      process.chdir(root)
      await generateCommand({ installMd: true })
    } finally {
      process.chdir(originalCwd)
    }

    const install = await readFile(join(root, 'generated', 'install.md'), 'utf-8')
    expect(install).toContain('# @scope/widget')
    expect(install).toContain('npm list @scope/widget')
    expect(install).toContain('bun add @scope/widget')
    expect(install).not.toContain('@scope-widget')
  })

  test('does not emit an empty Purpose column for project structure', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    await mkdir(join(root, 'docs'), { recursive: true })
    await writeFile(join(root, 'docs', 'overview.md'), '# Overview\n')
    await writeFile(join(root, 'dewey.config.json'), JSON.stringify({
      project: { name: 'fixture' },
      agent: { sections: [], entryPoints: { command: 'src/cli/' } },
      docs: { path: './docs', output: './generated' },
    }))

    try {
      process.chdir(root)
      await generateCommand({ agentsMd: true })
    } finally {
      process.chdir(originalCwd)
    }

    const agents = await readFile(join(root, 'generated', 'AGENTS.md'), 'utf-8')
    expect(agents).toContain('| Component | Path |')
    expect(agents).toContain('| Command | `src/cli/` |')
    expect(agents).not.toContain('| Purpose |')
    expect(agents).not.toContain('| |')
  })
})

describe('create composition and dependency compatibility', () => {
  test('pins every Astro scaffold dependency and the Pagefind executable', () => {
    const packageJson = JSON.parse(ASTRO_TEMPLATES['package.json']({
      projectName: 'fixture',
      theme: 'neutral',
      defaultPage: 'overview',
    })) as {
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
      scripts: Record<string, string>
    }

    expect(packageJson.dependencies).toEqual({
      astro: '5.18.2',
      '@tailwindcss/vite': '4.3.2',
      tailwindcss: '4.3.2',
    })
    expect(packageJson.devDependencies).toEqual({ pagefind: '1.5.2' })
    expect(packageJson.scripts.postbuild).toBe('pagefind --site dist')
  })

  test('creates the agent retrieval surface and pins scaffold dependencies', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    await mkdir(join(root, 'docs'), { recursive: true })
    await writeFile(join(root, 'docs', 'overview.md'), '# Overview\n\nCreated together.\n')

    try {
      process.chdir(root)
      await createCommand('site', { source: 'docs', template: 'nextjs', name: 'fixture-site' })
    } finally {
      process.chdir(originalCwd)
    }

    const packageJson = JSON.parse(await readFile(join(root, 'site', 'package.json'), 'utf-8')) as {
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
      scripts: Record<string, string>
    }
    expect(packageJson.dependencies).toMatchObject({
      '@arach/dewey': '0.3.7',
      'next': '14.2.35',
      'react': '18.3.1',
    })
    expect(packageJson.devDependencies.pagefind).toBe('1.5.2')
    expect([...Object.values(packageJson.dependencies), ...Object.values(packageJson.devDependencies)])
      .not.toContainEqual(expect.stringMatching(/^[~^]/))
    expect(packageJson.scripts.postbuild).toBe('pagefind --site out')
    expect(await readFile(join(root, 'site', 'agent', 'raw', 'docs', 'overview.md'), 'utf-8'))
      .toContain('Created together.')
    const ownership = JSON.parse(
      await readFile(join(root, 'site', '.dewey-generated.json'), 'utf-8'),
    ) as { files: Record<string, unknown> }
    expect(ownership.files['agent/manifest.json']).toBeDefined()
  })
})
