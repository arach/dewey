import { execFile } from 'node:child_process'
import { copyFile, mkdir, rm, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const root = resolve(new URL('.', import.meta.url).pathname, '..')
const repoRoot = resolve(root, '..')
const publicDir = resolve(root, 'public')
const docsPackageDir = resolve(repoRoot, 'packages/docs')
const agentArtifactsModule = resolve(docsPackageDir, 'dist/cli/agent-artifacts.js')
const agentArtifactsSource = resolve(docsPackageDir, 'src/cli/agent-artifacts.ts')

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

await ensureAgentArtifactsModule()

const { writeAgentArtifacts } = await import(pathToFileURL(agentArtifactsModule).href)

await rm(resolve(publicDir, 'agent'), { recursive: true, force: true })
await writeAgentArtifacts({
  rootDir: repoRoot,
  docsDir: resolve(repoRoot, 'docs'),
  outputDir: publicDir,
  project: {
    name: 'dewey',
    tagline: 'Documentation toolkit for AI-agent-ready docs',
  },
})

async function ensureAgentArtifactsModule() {
  if (await isCurrent(agentArtifactsModule, agentArtifactsSource)) return

  await execFileAsync('bun', ['run', '--cwd', docsPackageDir, 'build'], {
    cwd: repoRoot,
    maxBuffer: 1024 * 1024 * 20,
  })
}

async function isCurrent(outputPath, sourcePath) {
  try {
    const [output, source] = await Promise.all([
      stat(outputPath),
      stat(sourcePath),
    ])
    return output.mtimeMs >= source.mtimeMs
  } catch {
    return false
  }
}
