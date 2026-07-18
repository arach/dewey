import { describe, expect, test } from 'bun:test'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { THEME_TOKENS } from '../src/cli/templates/astro'
import {
  PUBLISHED_CSS_THEMES,
  THEME_REGISTRY,
  VALID_THEMES,
  isThemeName,
  resolveTheme,
} from '../src/themes'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

describe('theme registry', () => {
  test('drives runtime names, generated-site tokens, and published CSS files', async () => {
    const registryThemes = Object.keys(THEME_REGISTRY).sort()
    const cssThemes = (await readdir(resolve(packageRoot, 'src/css/colors')))
      .filter(file => file.endsWith('.css'))
      .map(file => file.replace(/\.css$/, ''))
      .sort()

    expect([...PUBLISHED_CSS_THEMES].sort()).toEqual(registryThemes)
    expect(cssThemes).toEqual(registryThemes)
    expect([...VALID_THEMES].sort()).toEqual(registryThemes)
    expect(Object.keys(THEME_TOKENS).sort()).toEqual(registryThemes)

    for (const theme of VALID_THEMES) {
      expect(THEME_TOKENS[theme]).toContain('--color-bg:')
      expect(resolveTheme(theme)).toBe(theme)
      expect(isThemeName(theme)).toBe(true)
    }
  })

  test('falls back safely for missing, unknown, or case-mismatched themes', () => {
    expect(resolveTheme()).toBe('neutral')
    expect(resolveTheme('')).toBe('neutral')
    expect(resolveTheme('unknown')).toBe('neutral')
    expect(resolveTheme('Ocean')).toBe('neutral')
    expect(isThemeName('unknown')).toBe(false)
  })

  test('matches every published package CSS theme export', async () => {
    const packageJson = JSON.parse(
      await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
    ) as { exports: Record<string, unknown> }

    const publishedThemeExports = Object.keys(packageJson.exports)
      .filter(path => path.startsWith('./css/colors/'))
      .map(path => path.slice('./css/colors/'.length).replace(/\.css$/, ''))
      .sort()

    expect(publishedThemeExports).toEqual([...PUBLISHED_CSS_THEMES].sort())
  })
})
