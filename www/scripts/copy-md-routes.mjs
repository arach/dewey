import { copyFile, mkdir, readdir, stat } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const repoRoot = resolve(root, '..')
const docsDir = resolve(repoRoot, 'docs')
const publicDir = resolve(root, 'public')

/** Mirror docs/*.md → public/docs/*.md and docs/agent/*.agent.md → public/agents/*.md */
async function copyMarkdownRoutes() {
  await mkdir(join(publicDir, 'docs'), { recursive: true })
  await mkdir(join(publicDir, 'agents'), { recursive: true })

  await walk(docsDir, async (filePath) => {
    const rel = relative(docsDir, filePath)

    if (rel.endsWith('.agent.md')) {
      const outName = rel.replace(/^agent\//, '').replace(/\.agent\.md$/, '.md')
      const dest = join(publicDir, 'agents', outName)
      await mkdir(resolve(dest, '..'), { recursive: true })
      await copyFile(filePath, dest)
      return
    }

    if (rel.endsWith('.md') && !rel.startsWith('agent/')) {
      const dest = join(publicDir, 'docs', rel)
      await mkdir(resolve(dest, '..'), { recursive: true })
      await copyFile(filePath, dest)
    }
  })
}

async function walk(dir, onFile) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full, onFile)
    } else if (entry.isFile()) {
      await onFile(full)
    }
  }
}

await copyMarkdownRoutes()