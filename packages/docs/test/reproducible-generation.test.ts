import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { generateCommand } from '../src/cli/commands/generate'
import { getGeneratedAt } from '../src/cli/version'

const temporaryDirectories: string[] = []
const originalCwd = process.cwd()
const originalSourceDateEpoch = process.env.SOURCE_DATE_EPOCH

async function makeFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'dewey-reproducible-generation-'))
  temporaryDirectories.push(root)

  await mkdir(join(root, 'docs'), { recursive: true })
  await writeFile(
    join(root, 'dewey.config.json'),
    JSON.stringify({
      project: {
        name: 'fixture',
        version: '2.3.4',
        tagline: 'A reproducible fixture',
      },
      agent: { sections: [] },
      docs: { path: './docs', output: './' },
    }),
  )
  await writeFile(
    join(root, 'docs', 'overview.md'),
    '---\ntitle: Overview\norder: 1\n---\n\n# Overview\n\nStable content.\n',
  )

  return root
}

const generatedFiles = [
  'AGENTS.md',
  'docs.json',
  'agent/manifest.json',
  'agent/docs.json',
  'agent/prompts.json',
  'agent/context.json',
] as const

async function readGeneratedFiles(root: string, output: string): Promise<Record<string, string>> {
  return Object.fromEntries(await Promise.all(
    generatedFiles.map(async file => [
      file,
      await readFile(join(root, output, file), 'utf-8'),
    ]),
  ))
}

afterEach(async () => {
  process.chdir(originalCwd)
  if (originalSourceDateEpoch === undefined) {
    delete process.env.SOURCE_DATE_EPOCH
  } else {
    process.env.SOURCE_DATE_EPOCH = originalSourceDateEpoch
  }

  await Promise.all(
    temporaryDirectories.splice(0).map(directory =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('reproducible generation metadata', () => {
  test('generates byte-stable, schema-versioned artifacts without timestamps by default', async () => {
    const root = await makeFixture()
    delete process.env.SOURCE_DATE_EPOCH
    process.chdir(root)

    await generateCommand({ output: 'generated' })
    const first = await readGeneratedFiles(root, 'generated')

    await generateCommand({ output: 'generated' })
    const second = await readGeneratedFiles(root, 'generated')

    expect(second).toEqual(first)
    expect(first['AGENTS.md']).not.toContain('Last updated:')
    expect(first['AGENTS.md']).toContain('<!-- dewey:generated owner=dewey -->')

    const docsManifest = JSON.parse(first['docs.json']) as Record<string, unknown>
    expect(docsManifest).toMatchObject({ schemaVersion: 1, version: '2.3.4' })
    expect(docsManifest).not.toHaveProperty('generatedAt')

    for (const file of [
      'agent/manifest.json',
      'agent/docs.json',
      'agent/prompts.json',
      'agent/context.json',
    ]) {
      const manifest = JSON.parse(first[file]) as Record<string, unknown>
      expect(manifest).toMatchObject({ schemaVersion: 1, version: 1 })
      expect(manifest).toMatchObject({ ownership: { owner: 'dewey', lifecycle: 'regenerate' } })
      expect(manifest).not.toHaveProperty('generatedAt')
    }
  })

  test('uses SOURCE_DATE_EPOCH for every requested timestamp', async () => {
    const root = await makeFixture()
    process.env.SOURCE_DATE_EPOCH = '1735689600'
    process.chdir(root)

    await generateCommand({ output: 'generated' })
    const generated = await readGeneratedFiles(root, 'generated')
    const expectedTimestamp = '2025-01-01T00:00:00.000Z'

    expect(generated['AGENTS.md']).toContain('Last updated: 2025-01-01')
    for (const file of generatedFiles.filter(file => file.endsWith('.json'))) {
      const manifest = JSON.parse(generated[file]) as Record<string, unknown>
      expect(manifest.generatedAt).toBe(expectedTimestamp)
    }
  })

  test('rejects malformed SOURCE_DATE_EPOCH values', () => {
    expect(() => getGeneratedAt('tomorrow')).toThrow(
      'SOURCE_DATE_EPOCH must be an integer number of seconds since the Unix epoch',
    )
  })
})
