#!/usr/bin/env bun

import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { verifyPackedPackage } from './verify-package'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = resolve(packageRoot, '../..')

interface CommandResult {
  stdout: string
  stderr: string
}

function run(
  command: string,
  args: string[],
  cwd: string,
  environment: Record<string, string> = {},
): CommandResult {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
    env: { ...process.env, ...environment },
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed (${result.status}) in ${cwd}\n${result.stdout}${result.stderr}`,
    )
  }
  return { stdout: result.stdout, stderr: result.stderr }
}

export function assertCleanCheckout(status: string): void {
  if (status.trim()) {
    throw new Error(`Release smoke tests require a clean checkout:\n${status.trim()}`)
  }
}

async function smokeRelease(): Promise<void> {
  assertCleanCheckout(run('git', ['status', '--porcelain', '--untracked-files=all'], repositoryRoot).stdout)

  const workDir = await mkdtemp(join(tmpdir(), 'dewey-release-smoke-'))
  const npmCache = join(workDir, 'npm-cache')
  const bunCache = join(workDir, 'bun-cache')
  const environment = {
    npm_config_cache: npmCache,
    BUN_INSTALL_CACHE_DIR: bunCache,
  }

  try {
    const packedOutput = run(
      'npm',
      ['pack', '--json', '--ignore-scripts', '--pack-destination', workDir],
      packageRoot,
      environment,
    ).stdout
    const packedResults = JSON.parse(packedOutput) as Array<{
      filename: string
      id?: string
      name?: string
      version?: string
      entryCount?: number
      files?: Array<{ path: string; mode?: number }>
    }>
    if (packedResults.length !== 1) throw new Error(`Expected one packed package, received ${packedResults.length}`)

    const manifest = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'))
    const summary = verifyPackedPackage(manifest, packedResults[0])
    const tarball = join(workDir, packedResults[0].filename)

    const consumerDir = join(workDir, 'consumer')
    await mkdir(consumerDir)
    await writeFile(join(consumerDir, 'package.json'), JSON.stringify({
      private: true,
      type: 'module',
      dependencies: {
        '@arach/dewey': `file:${tarball}`,
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
    }, null, 2))
    run('bun', ['install'], consumerDir, environment)
    run('bun', ['-e', "import('@arach/dewey').then(m => { if (!m.defineConfig) process.exit(1) })"], consumerDir, environment)

    const cli = join(consumerDir, 'node_modules/.bin/dewey')
    run(cli, ['--help'], consumerDir, environment)

    const fixtureDir = join(workDir, 'fixture')
    await mkdir(fixtureDir)
    await writeFile(join(fixtureDir, 'package.json'), JSON.stringify({ name: 'release-smoke-fixture' }))
    run(cli, ['init'], fixtureDir, environment)
    run(cli, ['generate'], fixtureDir, environment)
    for (const output of ['AGENTS.md', 'llms.txt', 'docs.json', 'install.md', 'agent/manifest.json']) {
      await readFile(join(fixtureDir, output))
    }

    run(cli, ['create', 'site', '--source', 'docs', '--template', 'nextjs'], fixtureDir, environment)
    const siteDir = join(fixtureDir, 'site')
    const siteManifest = JSON.parse(await readFile(join(siteDir, 'package.json'), 'utf8'))
    siteManifest.dependencies['@arach/dewey'] = `file:${tarball}`
    await writeFile(join(siteDir, 'package.json'), `${JSON.stringify(siteManifest, null, 2)}\n`)
    run('bun', ['install'], siteDir, environment)
    run('bun', ['run', 'build'], siteDir, environment)

    console.log(`✓ Release smoke passed for ${summary.name}@${summary.version}`)
    console.log('  clean checkout, pack inspection, install/import, CLI generation, generated Next.js build')
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

if (import.meta.main) {
  try {
    await smokeRelease()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
