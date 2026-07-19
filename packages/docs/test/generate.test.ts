import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  discoverMarkdownSections,
  generateCommand,
  loadDocs,
} from '../src/cli/commands/generate'

const temporaryDirectories: string[] = []

async function makeTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'dewey-generate-'))
  temporaryDirectories.push(directory)
  return directory
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(directory =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('documentation discovery', () => {
  test('finds nested human docs and excludes agent variants', async () => {
    const root = await makeTemporaryDirectory()
    const docsPath = join(root, 'docs')
    await mkdir(join(docsPath, 'guides'), { recursive: true })
    await mkdir(join(docsPath, 'agent'), { recursive: true })
    await writeFile(join(docsPath, 'overview.md'), '# Overview\n')
    await writeFile(join(docsPath, 'guides', 'install.md'), '# Install\n')
    await writeFile(join(docsPath, 'overview.agent.md'), '# Agent overview\n')
    await writeFile(join(docsPath, 'agent', 'overview.agent.md'), '# Agent overview\n')

    await expect(discoverMarkdownSections(docsPath)).resolves.toEqual([
      'guides/install',
      'overview',
    ])
  })

  test('loads nested docs deterministically and associates agent content', async () => {
    const root = await makeTemporaryDirectory()
    const docsPath = join(root, 'docs')
    await mkdir(join(docsPath, 'guides'), { recursive: true })
    await mkdir(join(docsPath, 'agent', 'guides'), { recursive: true })
    await writeFile(
      join(docsPath, 'guides', 'install.md'),
      '---\ntitle: Install\norder: 2\n---\n\nInstall the package.\n',
    )
    await writeFile(
      join(docsPath, 'agent', 'guides', 'install.agent.md'),
      '# Install for agents\n',
    )

    const docs = await loadDocs(root, docsPath, 'docs', ['guides/install'])

    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({
      id: 'guides/install',
      sourcePath: 'docs/guides/install.md',
      agentSourcePath: 'docs/agent/guides/install.agent.md',
    })
  })

  test('identifies the document when frontmatter cannot be parsed', async () => {
    const root = await makeTemporaryDirectory()
    const docsPath = join(root, 'docs')
    await mkdir(join(docsPath, 'guides'), { recursive: true })
    await writeFile(
      join(docsPath, 'guides', 'broken.md'),
      '---\ntitle: [unfinished\n---\n\nBroken metadata.\n',
    )

    await expect(loadDocs(root, docsPath, 'docs', ['guides/broken'])).rejects.toThrow(
      'Failed to parse frontmatter in docs/guides/broken.md',
    )
  })
})

describe('generate command', () => {
  test('creates a missing output directory and honors a source override', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    await mkdir(join(root, 'content', 'guides'), { recursive: true })
    await writeFile(
      join(root, 'dewey.config.json'),
      JSON.stringify({
        project: { name: 'fixture' },
        agent: { sections: [] },
        docs: { path: './docs', output: './' },
      }),
    )
    await writeFile(
      join(root, 'content', 'guides', 'install.md'),
      '---\ntitle: Install\n---\n\nInstall it.\n',
    )

    try {
      process.chdir(root)
      await generateCommand({
        docsJson: true,
        output: 'generated',
        source: 'content',
      })
    } finally {
      process.chdir(originalCwd)
    }

    const manifest = JSON.parse(
      await readFile(join(root, 'generated', 'docs.json'), 'utf-8'),
    ) as { pages: Array<{ id: string }> }
    expect(manifest.pages.map(page => page.id)).toEqual(['guides/install'])

    const ownership = JSON.parse(
      await readFile(join(root, 'generated', '.dewey-generated.json'), 'utf-8'),
    ) as { generator: string; files: Record<string, { scope: string }> }
    expect(ownership.generator).toBe('dewey')
    expect(ownership.files['docs.json']?.scope).toBe('docsJson')
  })

  test('dry-run reports a plan without creating the output directory', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    await mkdir(join(root, 'docs'), { recursive: true })
    await writeFile(
      join(root, 'dewey.config.json'),
      JSON.stringify({
        project: { name: 'fixture' },
        agent: { sections: [] },
        docs: { path: './docs', output: './generated' },
      }),
    )
    await writeFile(join(root, 'docs', 'overview.md'), '# Overview\n')

    try {
      process.chdir(root)
      const plan = await generateCommand({ dryRun: true })

      expect(plan.operations.some(operation => operation.action === 'create')).toBe(true)
      await expect(readFile(join(root, 'generated', 'AGENTS.md'), 'utf-8')).rejects.toThrow()
      await expect(readFile(join(root, 'generated', '.dewey-generated.json'), 'utf-8')).rejects.toThrow()
    } finally {
      process.chdir(originalCwd)
    }
  })

  test('preserves unknown files at generated paths and inside the agent directory', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    await mkdir(join(root, 'docs'), { recursive: true })
    await mkdir(join(root, 'generated', 'agent'), { recursive: true })
    await writeFile(
      join(root, 'dewey.config.json'),
      JSON.stringify({
        project: { name: 'fixture' },
        agent: { sections: [] },
        docs: { path: './docs', output: './generated' },
      }),
    )
    await writeFile(join(root, 'docs', 'overview.md'), '# Overview\n')
    await writeFile(
      join(root, 'generated', 'AGENTS.md'),
      '# Hand-authored agent rules\n\nThis project uses files Generated by Dewey.\n',
    )
    await writeFile(join(root, 'generated', 'agent', 'notes.md'), '# User notes\n')

    try {
      process.chdir(root)
      const plan = await generateCommand({ dryRun: true })

      expect(plan.operations).toContainEqual(expect.objectContaining({
        action: 'preserve',
        path: 'AGENTS.md',
      }))
      await expect(generateCommand({})).rejects.toThrow('ownership conflicts')
    } finally {
      process.chdir(originalCwd)
    }

    expect(await readFile(join(root, 'generated', 'AGENTS.md'), 'utf-8')).toBe(
      '# Hand-authored agent rules\n\nThis project uses files Generated by Dewey.\n',
    )
    expect(await readFile(join(root, 'generated', 'agent', 'notes.md'), 'utf-8')).toBe('# User notes\n')
  })

  test('treats edits to a previously generated file as user ownership', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    const agentsPath = join(root, 'generated', 'AGENTS.md')
    await mkdir(join(root, 'docs'), { recursive: true })
    await writeFile(
      join(root, 'dewey.config.json'),
      JSON.stringify({
        project: { name: 'fixture' },
        agent: { sections: [] },
        docs: { path: './docs', output: './generated' },
      }),
    )
    await writeFile(join(root, 'docs', 'overview.md'), '# Overview\n')

    try {
      process.chdir(root)
      await generateCommand({ agentsMd: true })
      const customized = `${await readFile(agentsPath, 'utf-8')}\n## Local rule\n\nKeep this.\n`
      await writeFile(agentsPath, customized)

      const firstPlan = await generateCommand({ agentsMd: true, dryRun: true })
      const secondPlan = await generateCommand({ agentsMd: true, dryRun: true })

      expect(firstPlan.operations).toContainEqual(expect.objectContaining({
        action: 'preserve',
        path: 'AGENTS.md',
      }))
      expect(secondPlan.operations).toContainEqual(expect.objectContaining({
        action: 'preserve',
        path: 'AGENTS.md',
      }))
      await expect(generateCommand({ agentsMd: true })).rejects.toThrow('ownership conflicts')
      expect(await readFile(agentsPath, 'utf-8')).toBe(customized)
    } finally {
      process.chdir(originalCwd)
    }
  })

  test('requires explicit overwrite consent before adopting an unowned desired output', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    await mkdir(join(root, 'docs'), { recursive: true })
    await mkdir(join(root, 'generated'), { recursive: true })
    await writeFile(join(root, 'dewey.config.json'), JSON.stringify({
      project: { name: 'fixture' },
      agent: { sections: [] },
      docs: { path: './docs', output: './generated' },
    }))
    await writeFile(join(root, 'docs', 'overview.md'), '# Overview\n')
    await writeFile(join(root, 'generated', 'AGENTS.md'), '# Old generated output without a marker\n')

    try {
      process.chdir(root)
      await expect(generateCommand({ agentsMd: true })).rejects.toThrow('ownership conflicts')
      const plan = await generateCommand({ agentsMd: true, overwrite: true })
      expect(plan.operations).toContainEqual(expect.objectContaining({ action: 'update', path: 'AGENTS.md' }))
      expect(await readFile(join(root, 'generated', 'AGENTS.md'), 'utf-8')).toContain('dewey:generated owner=dewey')
    } finally {
      process.chdir(originalCwd)
    }
  })

  test('rejects generated paths that traverse an output-directory symlink', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    const outside = join(root, 'outside')
    await mkdir(join(root, 'docs'), { recursive: true })
    await mkdir(join(root, 'generated'), { recursive: true })
    await mkdir(outside, { recursive: true })
    await symlink(outside, join(root, 'generated', 'agent'))
    await writeFile(join(root, 'dewey.config.json'), JSON.stringify({
      project: { name: 'fixture' },
      agent: { sections: [] },
      docs: { path: './docs', output: './generated' },
    }))
    await writeFile(join(root, 'docs', 'overview.md'), '# Overview\n')

    try {
      process.chdir(root)
      await expect(generateCommand({ agentArtifacts: true, dryRun: true })).rejects.toThrow('symbolic link')
    } finally {
      process.chdir(originalCwd)
    }

    await expect(readFile(join(outside, 'manifest.json'), 'utf-8')).rejects.toThrow()
  })

  test('prunes only stale unmodified Dewey-owned agent artifacts', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    const docsPath = join(root, 'docs')
    const outputPath = join(root, 'generated')
    await mkdir(docsPath, { recursive: true })
    await writeFile(
      join(root, 'dewey.config.json'),
      JSON.stringify({
        project: { name: 'fixture' },
        agent: { sections: [] },
        docs: { path: './docs', output: './generated' },
      }),
    )
    await writeFile(join(docsPath, 'remove.md'), '# Remove\n')
    await writeFile(join(docsPath, 'customized.md'), '# Customized\n')

    try {
      process.chdir(root)
      await generateCommand({ agentArtifacts: true })
      await writeFile(join(outputPath, 'agent', 'raw', 'docs', 'customized.md'), '# User customization\n')
      await writeFile(join(outputPath, 'agent', 'notes.md'), '# User notes\n')
      await rm(join(docsPath, 'remove.md'))
      await rm(join(docsPath, 'customized.md'))
      await writeFile(join(docsPath, 'replacement.md'), '# Replacement\n')

      const preview = await generateCommand({ agentArtifacts: true, dryRun: true })
      expect(preview.operations).toContainEqual(expect.objectContaining({
        action: 'delete',
        path: 'agent/raw/docs/remove.md',
      }))
      expect(await readFile(join(outputPath, 'agent', 'raw', 'docs', 'remove.md'), 'utf-8')).toBe('# Remove\n')

      const plan = await generateCommand({ agentArtifacts: true })

      expect(plan.operations).toContainEqual(expect.objectContaining({
        action: 'delete',
        path: 'agent/raw/docs/remove.md',
      }))
      expect(plan.operations).toContainEqual(expect.objectContaining({
        action: 'preserve',
        path: 'agent/raw/docs/customized.md',
      }))
    } finally {
      process.chdir(originalCwd)
    }

    await expect(readFile(join(outputPath, 'agent', 'raw', 'docs', 'remove.md'), 'utf-8')).rejects.toThrow()
    expect(await readFile(join(outputPath, 'agent', 'raw', 'docs', 'customized.md'), 'utf-8')).toBe('# User customization\n')
    expect(await readFile(join(outputPath, 'agent', 'notes.md'), 'utf-8')).toBe('# User notes\n')
    expect(await readFile(join(outputPath, 'agent', 'raw', 'docs', 'replacement.md'), 'utf-8')).toBe('# Replacement\n')
  })

  test('limits pruning to the explicitly selected artifact scope', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    const docsPath = join(root, 'docs')
    const staleArtifact = join(root, 'generated', 'agent', 'raw', 'docs', 'overview.md')
    await mkdir(docsPath, { recursive: true })
    await writeFile(
      join(root, 'dewey.config.json'),
      JSON.stringify({
        project: { name: 'fixture' },
        agent: { sections: [] },
        docs: { path: './docs', output: './generated' },
      }),
    )
    await writeFile(join(docsPath, 'overview.md'), '# Overview\n')

    try {
      process.chdir(root)
      await generateCommand({})
      await rm(join(docsPath, 'overview.md'))

      const docsPlan = await generateCommand({ docsJson: true })
      expect(docsPlan.operations.some(operation => operation.path === 'agent/raw/docs/overview.md')).toBe(false)
      expect(await readFile(staleArtifact, 'utf-8')).toBe('# Overview\n')

      await generateCommand({ agentArtifacts: true })
      await expect(readFile(staleArtifact, 'utf-8')).rejects.toThrow()
    } finally {
      process.chdir(originalCwd)
    }
  })

  test('rejects output paths nested inside the docs source', async () => {
    const root = await makeTemporaryDirectory()
    const originalCwd = process.cwd()
    await mkdir(join(root, 'docs'), { recursive: true })
    await writeFile(
      join(root, 'dewey.config.json'),
      JSON.stringify({
        project: { name: 'fixture' },
        agent: { sections: [] },
        docs: { path: './docs', output: './docs/generated' },
      }),
    )
    await writeFile(join(root, 'docs', 'overview.md'), '# Overview\n')

    try {
      process.chdir(root)
      await expect(generateCommand({})).rejects.toThrow(
        'Output directory must not be the docs source or one of its descendants',
      )
    } finally {
      process.chdir(originalCwd)
    }
  })
})
