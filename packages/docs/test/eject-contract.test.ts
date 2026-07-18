import { describe, expect, test } from 'bun:test'
import { readFile } from 'fs/promises'
import { join } from 'path'
import {
  generateFullComponent,
  generateWrapComponent,
} from '../src/cli/commands/eject'
import { EJECTIBLE_COMPONENTS } from '../src/cli/templates/nextjs'

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
})
