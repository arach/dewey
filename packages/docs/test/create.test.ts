import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { loadMarkdownDocs } from '../src/cli/commands/create'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(directory =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('site source loading', () => {
  test('preserves nested document IDs and ignores agent variants', async () => {
    const docsPath = await mkdtemp(join(tmpdir(), 'dewey-create-'))
    temporaryDirectories.push(docsPath)
    await mkdir(join(docsPath, 'guides'), { recursive: true })
    await writeFile(join(docsPath, 'overview.md'), '# Overview\n')
    await writeFile(join(docsPath, 'guides', 'install.md'), '# Install\n')
    await writeFile(join(docsPath, 'guides', 'install.agent.md'), '# Agent install\n')

    const docs = await loadMarkdownDocs(docsPath)

    expect(docs.map(doc => doc.id)).toEqual(['guides/install', 'overview'])
    expect(docs.find(doc => doc.id === 'guides/install')?.sourcePath).toBe(
      'guides/install.md',
    )
  })
})
