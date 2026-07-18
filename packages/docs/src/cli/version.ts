import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

function loadVersion(): string {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url))
    // Walk up from dist/cli/ or src/cli/ to find package.json
    let dir = __dirname
    for (let i = 0; i < 5; i++) {
      try {
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'))
        if (pkg.name === '@arach/dewey') return pkg.version
      } catch {}
      dir = dirname(dir)
    }
  } catch {}
  return '0.0.0'
}

export const DEWEY_VERSION = loadVersion()

export const DEWEY_SCHEMA_VERSION = 1 as const

/**
 * Return the reproducible generation timestamp requested by SOURCE_DATE_EPOCH.
 * Generation is intentionally timestamp-free when the variable is absent so
 * repeated runs produce byte-identical artifacts.
 */
export function getGeneratedAt(sourceDateEpoch = process.env.SOURCE_DATE_EPOCH): string | undefined {
  if (sourceDateEpoch === undefined || sourceDateEpoch.trim() === '') {
    return undefined
  }

  const value = sourceDateEpoch.trim()
  if (!/^-?\d+$/.test(value)) {
    throw new Error('SOURCE_DATE_EPOCH must be an integer number of seconds since the Unix epoch')
  }

  const seconds = Number(value)
  const date = new Date(seconds * 1000)

  if (!Number.isSafeInteger(seconds) || Number.isNaN(date.getTime())) {
    throw new Error('SOURCE_DATE_EPOCH is outside the supported date range')
  }

  return date.toISOString()
}
