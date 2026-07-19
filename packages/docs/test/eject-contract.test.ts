import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  ejectCommand,
  generateFullComponent,
  generateWrapComponent,
  rewriteDeweyTsx,
} from '../src/cli/commands/eject'
import { EJECTIBLE_COMPONENTS } from '../src/cli/templates/nextjs'

const temporaryDirs: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

describe('eject component contract', () => {
  test('references prop types exported by the package entry point', async () => {
    const packageEntry = await readFile(
      join(import.meta.dir, '..', 'src', 'index.ts'),
      'utf-8',
    )

    for (const componentName of ['TableOfContents', 'MarkdownContent']) {
      const metadata = EJECTIBLE_COMPONENTS[componentName]
      expect(metadata).toBeDefined()
      expect(packageEntry).toContain(metadata.propsType)

      const wrapped = generateWrapComponent(componentName, metadata)
      expect(wrapped).toContain(`import type { ${metadata.propsType} } from '@arach/dewey'`)
      expect(wrapped).toContain(`props: ${metadata.propsType}`)
    }
  })

  test('uses only AutoTocProps fields in a full TableOfContents eject', () => {
    const generated = generateFullComponent(
      'TableOfContents',
      EJECTIBLE_COMPONENTS.TableOfContents,
    )

    expect(generated).toContain(
      '{ markdown, containerRef, title, className }: AutoTocProps',
    )
    expect(generated).not.toContain('{ items, title, markdown }')
  })

  test('verifies both the import and component-map rewrite', () => {
    const source = `import {
  Header as DefaultHeader,
} from '@arach/dewey'

export const components = {
  Header: DefaultHeader,
}
`
    const rewrite = rewriteDeweyTsx(source, 'Header')

    expect(rewrite.failures).toEqual([])
    expect(rewrite.importReady).toBe(true)
    expect(rewrite.mappingReady).toBe(true)
    expect(rewrite.content).toContain("import CustomHeader from '@/components/overrides/Header'")
    expect(rewrite.content).toContain('Header: CustomHeader')
  })

  test('reports a failed map rewrite without claiming success', () => {
    const rewrite = rewriteDeweyTsx("import { Header } from '@arach/dewey'\n", 'Header')

    expect(rewrite.importReady).toBe(true)
    expect(rewrite.mappingReady).toBe(false)
    expect(rewrite.failures).toEqual(['could not replace the Header component mapping'])
  })

  test('records successful ejection ownership and version', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dewey-eject-test-'))
    temporaryDirs.push(dir)
    await mkdir(join(dir, 'src/lib'), { recursive: true })
    await writeFile(join(dir, 'src/lib/dewey.tsx'), `import {
  Header as DefaultHeader,
} from '@arach/dewey'

export const components = { Header: DefaultHeader }
`)
    await writeFile(join(dir, '.dewey-manifest.json'), `${JSON.stringify({
      deweyVersion: '0.3.7',
      createdAt: '2026-07-19T00:00:00.000Z',
      updatedAt: '2026-07-19T00:00:00.000Z',
      template: 'nextjs',
      theme: 'neutral',
      projectName: 'Fixture',
      defaultPage: 'overview',
      files: { 'src/lib/dewey.tsx': { owner: 'consumer' } },
    }, null, 2)}\n`)

    await ejectCommand('Header', dir, {})

    const manifest = JSON.parse(await readFile(join(dir, '.dewey-manifest.json'), 'utf8'))
    expect(manifest.files['src/components/overrides/Header.tsx']).toMatchObject({
      owner: 'ejected',
      component: 'Header',
      mode: 'wrap',
    })
    expect(manifest.files['src/components/overrides/Header.tsx'].version).toBeTruthy()
    expect(await readFile(join(dir, 'src/lib/dewey.tsx'), 'utf8')).toContain('Header: CustomHeader')
  })
})
