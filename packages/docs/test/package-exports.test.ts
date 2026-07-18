import { describe, expect, test } from 'bun:test'
import { access, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { VALID_THEMES, THEME_TOKENS } from '../src/cli/templates/astro'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

describe('published package contract', () => {
  test('every exported CSS file has a source file', async () => {
    const packageJson = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8')) as {
      exports: Record<string, { default?: string }>
    }

    const cssExports = Object.values(packageJson.exports)
      .map(entry => entry.default)
      .filter((target): target is string => Boolean(target?.startsWith('./dist/css/')))

    for (const target of cssExports) {
      const sourcePath = target.replace('./dist/css/', 'src/css/')
      await access(resolve(packageRoot, sourcePath))
    }

    expect(cssExports).not.toHaveLength(0)
  })

  test('editorial is available to generated sites', () => {
    expect(VALID_THEMES).toContain('editorial')
    expect(THEME_TOKENS.editorial).toContain('--color-accent: #9b2f3f')
  })
})
