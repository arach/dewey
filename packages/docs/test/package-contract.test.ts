import { describe, expect, test } from 'bun:test'
import manifest from '../package.json'
import { guardTopLevelDocumentAccess } from '../vite.config'

describe('published dependency contract', () => {
  test('keeps runtime rendering dependencies in the core package', () => {
    for (const dependency of [
      'gray-matter',
      'highlight.js',
      'lucide-react',
      'react-markdown',
      'rehype-slug',
      'remark-gfm',
    ]) {
      expect(dependency in manifest.dependencies).toBe(true)
    }
  })

  test('ships config-loading TypeScript support but keeps Playwright development-only', () => {
    expect(manifest.dependencies).toHaveProperty('typescript')
    expect(manifest.devDependencies).not.toHaveProperty('typescript')
    expect(manifest.dependencies).not.toHaveProperty('@playwright/test')
    expect(manifest.devDependencies).toHaveProperty('@playwright/test')
  })

  test('does not require a router now that DocsLayout accepts injected links', () => {
    expect(manifest.peerDependencies).not.toHaveProperty('react-router-dom')
    expect(manifest.dependencies).not.toHaveProperty('react-router-dom')
  })
})

describe('server-safe package bundle', () => {
  test('guards optimized top-level DOM initialization for every declaration form', () => {
    for (const declaration of ['const', 'let', 'var']) {
      const guarded = guardTopLevelDocumentAccess(
        `${declaration} element = document.createElement("i");`,
      )
      expect(guarded).toContain('typeof document !== "undefined"')
      expect(guarded).not.toContain(`${declaration} element = document.createElement`)
    }
  })
})
