import { describe, expect, test } from 'bun:test'
import { resolveCliTheme } from '../src/cli/input-contracts'
import { normalizeMarkdownHref } from '../src/components/MarkdownContent'

describe('CLI input contracts', () => {
  test('warns when an unknown theme falls back', () => {
    const warnings: string[] = []
    expect(resolveCliTheme('ultraviolet', message => warnings.push(message))).toBe('neutral')
    expect(warnings).toEqual(['Unknown theme "ultraviolet"; using "neutral".'])
  })

  test('accepts known themes without warning', () => {
    const warnings: string[] = []
    expect(resolveCliTheme('ocean', message => warnings.push(message))).toBe('ocean')
    expect(warnings).toEqual([])
  })
})

describe('Markdown link contracts', () => {
  test('removes only the final Markdown extension', () => {
    expect(normalizeMarkdownHref('guide.md/archive.md')).toBe('guide.md/archive')
    expect(normalizeMarkdownHref('guide.md/archive')).toBe('guide.md/archive')
    expect(normalizeMarkdownHref('https://example.com/guide.md')).toBe('https://example.com/guide.md')
  })
})
