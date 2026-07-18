import { describe, expect, test } from 'bun:test'
import { verifyReleaseVersion } from '../scripts/verify-release-version'

describe('release version contract', () => {
  test('accepts the package version alone or an exactly matching tag version', () => {
    expect(verifyReleaseVersion('0.3.7')).toBe('0.3.7')
    expect(verifyReleaseVersion('0.3.7', '0.3.7')).toBe('0.3.7')
  })

  test('rejects missing and mismatched versions', () => {
    expect(() => verifyReleaseVersion('')).toThrow('must declare a version')
    expect(() => verifyReleaseVersion('0.3.7', '0.3.8')).toThrow(
      'tag requests 0.3.8, but packages/docs/package.json declares 0.3.7',
    )
  })
})
