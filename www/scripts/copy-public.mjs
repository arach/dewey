import { mkdir, copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(new URL('.', import.meta.url).pathname, '..')
const repoRoot = resolve(root, '..')
const publicDir = resolve(root, 'public')

const files = [
  { src: resolve(repoRoot, 'AGENTS.md'), dest: resolve(publicDir, 'AGENTS.md') },
  { src: resolve(repoRoot, 'llms.txt'), dest: resolve(publicDir, 'llms.txt') },
  { src: resolve(repoRoot, 'install.md'), dest: resolve(publicDir, 'install.md') },
  { src: resolve(repoRoot, 'llms.txt'), dest: resolve(publicDir, 'lm.txt') },
]

await mkdir(publicDir, { recursive: true })

await Promise.all(
  files.map(async ({ src, dest }) => {
    await copyFile(src, dest)
  }),
)
