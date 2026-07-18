import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises'
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
  })
})
