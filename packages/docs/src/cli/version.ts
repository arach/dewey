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
