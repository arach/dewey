#!/usr/bin/env bun
// Packs Dewey, installs the tarball into a scratch consumer, and runs init, build and check
// there under Node and Bun. Proves the published package works without this checkout.
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const scratch = process.argv[2] ? resolve(process.argv[2]) : mkdtempSync(join(tmpdir(), 'dewey-install-'))

function run(command: string, args: string[], cwd: string, expectExit = 0): string {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, CI: '1' } })
  if (result.status !== expectExit) {
    throw new Error(`${command} ${args.join(' ')} exited ${result.status} (expected ${expectExit})\n${result.stdout}\n${result.stderr}`)
  }
  return result.stdout
}

function project(dir: string) {
  mkdirSync(join(dir, 'src'), { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'tally', private: true, description: 'Counts things.', type: 'module' }, null, 2))
  writeFileSync(join(dir, 'README.md'), '# Tally\n\nCounts things.\n')
  writeFileSync(join(dir, 'src/index.ts'), 'export function count(items: unknown[]) { return items.length }\n')
}

const packDir = join(scratch, 'pack')
mkdirSync(packDir, { recursive: true })
run('bun', ['run', 'build'], packageRoot)
run('bun', ['pm', 'pack', '--destination', packDir], packageRoot)
const tarball = readdirSync(packDir).find(name => name.endsWith('.tgz'))
if (!tarball) throw new Error('bun pm pack wrote no tarball')

const consumer = join(scratch, 'consumer')
mkdirSync(consumer, { recursive: true })
writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'consumer', private: true }))
run('bun', ['add', join(packDir, tarball)], consumer)
const bin = join(consumer, 'node_modules/@arach/dewey/dist/cli/index.js')
if (!existsSync(bin)) throw new Error(`installed package has no CLI at ${bin}`)

for (const runtime of ['node', 'bun']) {
  const dir = join(consumer, `project-${runtime}`)
  project(dir)
  run(runtime, [bin, 'init', '--no-rules'], dir)
  run(runtime, [bin, 'build'], dir)
  // A fresh scaffold is drafts awaiting review, so check fails with only those codes.
  const report = JSON.parse(run(runtime, [bin, 'check', '--json'], dir, 1)) as { issues: { code: string }[] }
  const unexpected = report.issues.map(issue => issue.code).filter(code => code !== 'DOC_DRAFT' && code !== 'REVIEW_REQUIRED')
  if (unexpected.length) throw new Error(`${runtime}: unexpected check issues ${[...new Set(unexpected)].join(', ')}`)
  for (const file of ['index.html', 'site.js', 'search.js', 'llms.txt']) {
    if (!existsSync(join(dir, '.dewey/site', file))) throw new Error(`${runtime}: .dewey/site/${file} missing`)
  }
  console.log(`✓ ${runtime}: init, build and check from the installed package`)
}
console.log(`  ${tarball} in ${scratch}`)
