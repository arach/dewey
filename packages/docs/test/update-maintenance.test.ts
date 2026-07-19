import { afterEach, describe, expect, test } from 'bun:test'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { dirname, join } from 'path'
import { adoptExistingSite, pruneBackupSnapshots, updateCommand } from '../src/cli/commands/update'
import { hashContent, readManifest, writeManifest, type DeweyManifest } from '../src/cli/manifest'
import { NEXTJS_OWNED_FILES, NEXTJS_TEMPLATES } from '../src/cli/templates/nextjs'

const temporaryDirs: string[] = []

async function makeTemporaryDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'dewey-update-test-'))
  temporaryDirs.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(temporaryDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

describe('site manifest recovery', () => {
  test('adopts a Next.js site and preserves consumer-owned configuration', async () => {
    const dir = await makeTemporaryDir()
    await mkdir(join(dir, 'src/lib'), { recursive: true })
    await mkdir(join(dir, 'src/app'), { recursive: true })
    await writeFile(join(dir, 'next.config.js'), 'module.exports = {}\n')
    await writeFile(join(dir, 'src/app/layout.tsx'), 'export default function Layout() {}\n')
    await writeFile(join(dir, 'src/lib/dewey.tsx'), `export const siteConfig = {
  name: 'Recovered Docs',
  defaultPage: 'quickstart',
}
export const providerProps = { theme: 'ocean' }
`)

    const manifest = await adoptExistingSite(dir, 'nextjs')

    expect(manifest.template).toBe('nextjs')
    expect(manifest.projectName).toBe('Recovered Docs')
    expect(manifest.defaultPage).toBe('quickstart')
    expect(manifest.theme).toBe('ocean')
    expect(manifest.files['src/app/layout.tsx']?.owner).toBe('dewey')
    expect(manifest.files['src/lib/dewey.tsx']?.owner).toBe('consumer')
    expect(manifest.files['src/lib/dewey.tsx']?.hash).toBeTruthy()
  })
})

describe('forced-update backup rotation', () => {
  test('keeps the newest five snapshots and leaves unrelated files alone', async () => {
    const dir = await makeTemporaryDir()
    const names = Array.from({ length: 7 }, (_, index) => `2026-07-${String(index + 1).padStart(2, '0')}T12-00-00-000Z`)
    for (const name of names) await mkdir(join(dir, name), { recursive: true })
    await writeFile(join(dir, 'README.txt'), 'legacy backup note')

    const removed = await pruneBackupSnapshots(dir, 5)

    expect(removed).toEqual(names.slice(0, 2))
    expect(await readFile(join(dir, 'README.txt'), 'utf8')).toBe('legacy backup note')
    for (const name of names.slice(0, 2)) {
      expect(await access(join(dir, name)).then(() => true, () => false)).toBe(false)
    }
    for (const name of names.slice(2)) {
      expect(await access(join(dir, name)).then(() => true, () => false)).toBe(true)
    }
  })

  test('force never reclaims consumer or ejected ownership', async () => {
    const dir = await makeTemporaryDir()
    const args = { projectName: 'fixture', theme: 'neutral' as const, defaultPage: 'overview' }
    const files: DeweyManifest['files'] = {}

    for (const filePath of NEXTJS_OWNED_FILES) {
      const content = NEXTJS_TEMPLATES[filePath](args)
      await mkdir(dirname(join(dir, filePath)), { recursive: true })
      await writeFile(join(dir, filePath), content)
      files[filePath] = { owner: 'dewey', hash: hashContent(content), version: '0.3.7' }
    }

    const protectedPath = 'next.config.js'
    const protectedContent = '// consumer configuration\n'
    await writeFile(join(dir, protectedPath), protectedContent)
    files[protectedPath] = { owner: 'consumer', hash: hashContent(protectedContent) }
    await writeManifest(dir, {
      deweyVersion: '0.3.7',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      template: 'nextjs',
      theme: 'neutral',
      projectName: 'fixture',
      defaultPage: 'overview',
      files,
    })

    await updateCommand(dir, { force: true })

    expect(await readFile(join(dir, protectedPath), 'utf8')).toBe(protectedContent)
    expect((await readManifest(dir))?.files[protectedPath]?.owner).toBe('consumer')
  })
})
