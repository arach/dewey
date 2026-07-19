import { expect, test } from 'bun:test'
import { lstat, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repositoryRoot = resolve(import.meta.dir, '../../..')

// Encode forbidden names so this guard does not create its own text matches.
const forbiddenNames = [
  [97, 110, 116, 104, 114, 111, 112, 105, 99],
  [98, 108, 117, 109, 101],
  [99, 104, 97, 116, 103, 112, 116],
  [99, 108, 97, 117, 100, 101],
  [99, 111, 100, 101, 120],
  [99, 111, 104, 101, 114, 101],
  [99, 111, 112, 105, 108, 111, 116],
  [100, 101, 101, 112, 115, 101, 101, 107],
  [100, 111, 99, 117, 115, 97, 117, 114, 117, 115],
  [102, 101, 114, 110],
  [102, 117, 109, 97, 100, 111, 99, 115],
  [103, 101, 109, 105, 110, 105],
  [103, 105, 116, 98, 111, 111, 107],
  [103, 114, 111, 107],
  [108, 108, 97, 109, 97],
  [109, 105, 110, 116, 108, 105, 102, 121],
  [109, 105, 115, 116, 114, 97, 108],
  [109, 107, 100, 111, 99, 115],
  [110, 101, 120, 116, 114, 97],
  [111, 112, 101, 110, 97, 105],
  [112, 101, 114, 112, 108, 101, 120, 105, 116, 121],
  [115, 99, 97, 108, 97, 114],
  [115, 112, 104, 105, 110, 120],
  [115, 116, 97, 114, 108, 105, 103, 104, 116],
  [118, 105, 116, 101, 112, 114, 101, 115, 115],
  [120, 97, 105],
].map(points => String.fromCharCode(...points))

test('tracked content stays vendor-neutral', async () => {
  const tracked = Bun.spawnSync(['git', 'ls-files', '-z'], { cwd: repositoryRoot })
  expect(tracked.exitCode).toBe(0)

  const paths = tracked.stdout.toString().split('\0').filter(Boolean)
  const violations: string[] = []

  for (const path of paths) {
    const absolutePath = resolve(repositoryRoot, path)
    if (!(await lstat(absolutePath)).isFile()) continue

    const content = await readFile(absolutePath)
    if (content.includes(0)) continue

    const text = content.toString('utf8')
    for (const name of forbiddenNames) {
      const pattern = new RegExp(`(^|[^a-z0-9_])${name}([^a-z0-9_]|$)`, 'i')
      if (pattern.test(text)) violations.push(`${path}: ${name}`)
    }
  }

  expect(violations).toEqual([])
})
