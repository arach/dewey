import { mkdir, cp, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(new URL('.', import.meta.url).pathname, '..')
const distDir = resolve(root, 'dist', 'pagefind')
const publicDir = resolve(root, 'public', 'pagefind')

try {
  await stat(distDir)
  await mkdir(publicDir, { recursive: true })
  await cp(distDir, publicDir, { recursive: true })
  console.log('Synced pagefind index to public/pagefind')
} catch (error) {
  if (error?.code === 'ENOENT') {
    console.log('No dist/pagefind to sync (run build first).')
    process.exit(0)
  }
  throw error
}
