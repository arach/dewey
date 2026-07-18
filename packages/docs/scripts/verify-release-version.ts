#!/usr/bin/env bun

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function verifyReleaseVersion(packageVersion: string, expectedVersion?: string): string {
  if (!packageVersion.trim()) {
    throw new Error('packages/docs/package.json must declare a version')
  }

  if (expectedVersion !== undefined && expectedVersion !== packageVersion) {
    throw new Error(
      `Release version mismatch: tag requests ${expectedVersion}, but packages/docs/package.json declares ${packageVersion}`,
    )
  }

  return packageVersion
}

if (import.meta.main) {
  try {
    const manifest = JSON.parse(
      await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
    ) as { version?: unknown }
    const packageVersion = typeof manifest.version === 'string' ? manifest.version : ''
    const verified = verifyReleaseVersion(packageVersion, process.argv[2])
    console.log(`✓ Release source of truth: @arach/dewey@${verified}`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
