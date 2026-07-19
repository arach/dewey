import { describe, expect, test } from 'bun:test'
import { assertCleanCheckout } from '../scripts/release-smoke'

describe('release smoke preconditions', () => {
  test('accepts a clean checkout', () => {
    expect(() => assertCleanCheckout('')).not.toThrow()
  })

  test('reports every dirty path before packaging', () => {
    expect(() => assertCleanCheckout(' M packages/docs/package.json\n?? scratch.txt\n')).toThrow(
      /package\.json[\s\S]*scratch\.txt/,
    )
  })
})
