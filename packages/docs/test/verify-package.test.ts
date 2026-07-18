import { describe, expect, test } from 'bun:test'
import { verifyPackedPackage } from '../scripts/verify-package'

const manifest = {
  name: '@arach/dewey',
  version: '1.2.3',
  description: 'Test package',
  license: 'MIT',
  repository: { type: 'git', url: 'https://example.com/repo.git' },
  main: './dist/index.js',
  module: './dist/index.js',
  types: './dist/index.d.ts',
  bin: { dewey: './dist/cli/index.js' },
  exports: {
    '.': { import: './dist/index.js', types: './dist/index.d.ts' },
    './feature': './dist/feature.js',
  },
}

const packedFiles = [
  { path: 'package.json', mode: 0o644 },
  { path: 'README.md', mode: 0o644 },
  { path: 'LICENSE', mode: 0o644 },
  { path: 'dist/index.js', mode: 0o644 },
  { path: 'dist/index.d.ts', mode: 0o644 },
  { path: 'dist/feature.js', mode: 0o644 },
  { path: 'dist/cli/index.js', mode: 0o755 },
]

describe('packed package verification', () => {
  test('accepts complete metadata, exports, and an executable CLI', () => {
    expect(verifyPackedPackage(manifest, {
      id: '@arach/dewey@1.2.3',
      name: '@arach/dewey',
      version: '1.2.3',
      entryCount: packedFiles.length,
      files: packedFiles,
    })).toEqual({
      name: '@arach/dewey',
      version: '1.2.3',
      fileCount: packedFiles.length,
      exportTargetCount: 3,
      binaryCount: 1,
    })
  })

  test('reports every missing or unsafe package contract', () => {
    expect(() => verifyPackedPackage(manifest, {
      id: '@arach/dewey@1.2.3',
      name: '@arach/dewey',
      version: '1.2.3',
      entryCount: packedFiles.length - 2,
      files: packedFiles
        .filter(file => file.path !== 'LICENSE' && file.path !== 'dist/feature.js')
        .map(file => file.path === 'dist/cli/index.js' ? { ...file, mode: 0o644 } : file),
    })).toThrow(/missing LICENSE[\s\S]*missing export target dist\/feature\.js[\s\S]*not executable/)
  })
})
