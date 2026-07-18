#!/usr/bin/env bun

import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface PackageManifest {
  name?: unknown
  version?: unknown
  description?: unknown
  license?: unknown
  repository?: unknown
  main?: unknown
  module?: unknown
  types?: unknown
  bin?: unknown
  exports?: unknown
}

interface PackedFile {
  path: string
  mode?: number
}

interface PackResult {
  id?: string
  name?: string
  version?: string
  entryCount?: number
  files?: PackedFile[]
}

export interface PackageVerificationSummary {
  name: string
  version: string
  fileCount: number
  exportTargetCount: number
  binaryCount: number
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizePackageTarget(target: string, label: string, failures: string[]): string | null {
  if (!target.startsWith('./')) {
    failures.push(`${label} target must start with "./": ${target}`)
    return null
  }

  const normalized = target.slice(2).replaceAll('\\', '/')
  if (!normalized || normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) {
    failures.push(`${label} target escapes the package root: ${target}`)
    return null
  }

  return normalized
}

function collectExportTargets(
  value: unknown,
  failures: string[],
  targets: Set<string> = new Set(),
): Set<string> {
  if (typeof value === 'string') {
    const target = normalizePackageTarget(value, 'Export', failures)
    if (target) targets.add(target)
    return targets
  }

  if (Array.isArray(value)) {
    for (const entry of value) collectExportTargets(entry, failures, targets)
    return targets
  }

  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) collectExportTargets(entry, failures, targets)
    return targets
  }

  if (value !== null && value !== undefined) {
    failures.push(`Unsupported export target value: ${String(value)}`)
  }

  return targets
}

function matchesPackedTarget(target: string, packedPaths: Set<string>): boolean {
  if (!target.includes('*')) return packedPaths.has(target)

  const pattern = target
    .split('*')
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.+')
  const matcher = new RegExp(`^${pattern}$`)
  return [...packedPaths].some(path => matcher.test(path))
}

function collectBinaryTargets(manifest: PackageManifest, failures: string[]): Map<string, string> {
  const binaries = new Map<string, string>()

  if (typeof manifest.bin === 'string') {
    const target = normalizePackageTarget(manifest.bin, 'Binary', failures)
    if (target) binaries.set(String(manifest.name ?? 'bin'), target)
    return binaries
  }

  if (manifest.bin && typeof manifest.bin === 'object' && !Array.isArray(manifest.bin)) {
    for (const [name, value] of Object.entries(manifest.bin)) {
      if (!isNonEmptyString(value)) {
        failures.push(`Binary ${name} must declare a non-empty string target`)
        continue
      }
      const target = normalizePackageTarget(value, `Binary ${name}`, failures)
      if (target) binaries.set(name, target)
    }
    return binaries
  }

  failures.push('package.json must declare at least one CLI binary')
  return binaries
}

export function verifyPackedPackage(
  manifest: PackageManifest,
  packed: PackResult,
): PackageVerificationSummary {
  const failures: string[] = []

  for (const key of ['name', 'version', 'description', 'license'] as const) {
    if (!isNonEmptyString(manifest[key])) {
      failures.push(`package.json ${key} must be a non-empty string`)
    }
  }
  if (!manifest.repository || typeof manifest.repository !== 'object') {
    failures.push('package.json repository metadata must be present')
  }

  const name = isNonEmptyString(manifest.name) ? manifest.name : '<unknown>'
  const version = isNonEmptyString(manifest.version) ? manifest.version : '<unknown>'
  if (packed.name !== name) {
    failures.push(`Packed name ${String(packed.name)} does not match package.json name ${name}`)
  }
  if (packed.version !== version) {
    failures.push(`Packed version ${String(packed.version)} does not match package.json version ${version}`)
  }
  if (packed.id !== `${name}@${version}`) {
    failures.push(`Packed id ${String(packed.id)} does not match ${name}@${version}`)
  }

  const files = Array.isArray(packed.files) ? packed.files : []
  if (files.length === 0) failures.push('npm pack reported no files')
  if (packed.entryCount !== undefined && packed.entryCount !== files.length) {
    failures.push(`npm pack entryCount ${packed.entryCount} does not match its ${files.length} file records`)
  }

  const filesByPath = new Map(files.map(file => [file.path.replaceAll('\\', '/'), file]))
  const packedPaths = new Set(filesByPath.keys())
  for (const requiredFile of ['package.json', 'README.md', 'LICENSE']) {
    if (!packedPaths.has(requiredFile)) failures.push(`Packed package is missing ${requiredFile}`)
  }

  const exportTargets = collectExportTargets(manifest.exports, failures)
  if (exportTargets.size === 0) failures.push('package.json must declare at least one export target')
  for (const target of exportTargets) {
    if (!matchesPackedTarget(target, packedPaths)) {
      failures.push(`Packed package is missing export target ${target}`)
    }
  }

  for (const key of ['main', 'module', 'types'] as const) {
    const value = manifest[key]
    if (value === undefined) continue
    if (!isNonEmptyString(value)) {
      failures.push(`package.json ${key} must be a non-empty string when declared`)
      continue
    }
    const target = normalizePackageTarget(value, key, failures)
    if (target && !packedPaths.has(target)) {
      failures.push(`Packed package is missing ${key} target ${target}`)
    }
  }

  const binaries = collectBinaryTargets(manifest, failures)
  for (const [binaryName, target] of binaries) {
    const packedFile = filesByPath.get(target)
    if (!packedFile) {
      failures.push(`Packed package is missing binary ${binaryName} at ${target}`)
      continue
    }
    if (typeof packedFile.mode !== 'number' || (packedFile.mode & 0o111) === 0) {
      failures.push(`Packed binary ${binaryName} at ${target} is not executable`)
    }
  }

  if (failures.length > 0) {
    throw new Error(`Packed package verification failed:\n- ${failures.join('\n- ')}`)
  }

  return {
    name,
    version,
    fileCount: files.length,
    exportTargetCount: exportTargets.size,
    binaryCount: binaries.size,
  }
}

async function inspectPackage(): Promise<PackageVerificationSummary> {
  const manifest = JSON.parse(
    await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
  ) as PackageManifest
  const pack = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: packageRoot,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })

  if (pack.error) throw pack.error
  if (pack.status !== 0) {
    throw new Error(`npm pack --dry-run failed (${pack.status}):\n${pack.stderr.trim()}`)
  }

  let results: PackResult[]
  try {
    results = JSON.parse(pack.stdout) as PackResult[]
  } catch (error) {
    throw new Error(`npm pack returned invalid JSON:\n${pack.stdout.trim()}`, { cause: error })
  }
  if (!Array.isArray(results) || results.length !== 1) {
    throw new Error(`Expected one npm pack result, received ${Array.isArray(results) ? results.length : 'invalid output'}`)
  }

  return verifyPackedPackage(manifest, results[0])
}

if (import.meta.main) {
  try {
    const summary = await inspectPackage()
    console.log(`✓ Verified ${summary.name}@${summary.version} packed package`)
    console.log(`  ${summary.fileCount} files, ${summary.exportTargetCount} export targets, ${summary.binaryCount} CLI binary`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
