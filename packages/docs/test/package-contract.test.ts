import { describe, expect, test } from 'bun:test'
import manifest from '../package.json'

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

  test('keeps build-only TypeScript and Playwright out of runtime dependencies', () => {
    expect(manifest.dependencies).not.toHaveProperty('typescript')
    expect(manifest.devDependencies).toHaveProperty('typescript')
    expect(manifest.dependencies).not.toHaveProperty('@playwright/test')
    expect(manifest.devDependencies).toHaveProperty('@playwright/test')
  })

  test('does not require a router now that DocsLayout accepts injected links', () => {
    expect(manifest.peerDependencies).not.toHaveProperty('react-router-dom')
    expect(manifest.dependencies).not.toHaveProperty('react-router-dom')
  })
})
