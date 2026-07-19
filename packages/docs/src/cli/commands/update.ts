import chalk from 'chalk'
import { readFile, writeFile, mkdir, access, readdir, rm } from 'fs/promises'
import { join, dirname, resolve } from 'path'
import { execSync } from 'child_process'
import {
  ASTRO_TEMPLATES,
  DEWEY_OWNED_FILES,
} from '../templates/astro.js'
import {
  NEXTJS_TEMPLATES,
  NEXTJS_OWNED_FILES,
} from '../templates/nextjs.js'
import {
  hashContent,
  readManifest,
  writeManifest,
  type DeweyManifest,
} from '../manifest.js'
import { DEWEY_VERSION } from '../version.js'
import { resolveCliTheme } from '../input-contracts.js'

interface UpdateOptions {
  dryRun?: boolean
  force?: boolean
}

type FileStatus =
  | 'UNCHANGED'    // disk hash matches manifest hash → safe to overwrite
  | 'MODIFIED'     // user edited it
  | 'MISSING'      // deleted from disk
  | 'NEW'          // in current templates but not in manifest
  | 'ALREADY_CURRENT' // new template content is identical to disk

interface FileClassification {
  filePath: string
  status: FileStatus
  diskHash?: string
  manifestHash?: string
  newContent: string
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function safeReadFile(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8')
  } catch {
    return null
  }
}

function isGitDirty(dir: string): boolean {
  try {
    const out = execSync('git status --porcelain', {
      cwd: dir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return out.trim().length > 0
  } catch {
    return false
  }
}

async function detectSiteTemplate(dir: string): Promise<'astro' | 'nextjs' | null> {
  const [hasAstroConfig, hasBaseLayout, nextConfigCandidates, hasDeweyTsx] = await Promise.all([
    fileExists(join(dir, 'astro.config.mjs')),
    fileExists(join(dir, 'src/layouts/BaseLayout.astro')),
    Promise.all(['next.config.js', 'next.config.mjs', 'next.config.ts'].map(file => fileExists(join(dir, file)))),
    fileExists(join(dir, 'src/lib/dewey.tsx')),
  ])

  const hasNextConfig = nextConfigCandidates.some(Boolean)
  if (hasNextConfig && hasDeweyTsx) return 'nextjs'
  if (hasAstroConfig && hasBaseLayout) return 'astro'
  return null
}

export async function adoptExistingSite(
  dir: string,
  template: 'astro' | 'nextjs',
): Promise<DeweyManifest> {
  const now = new Date().toISOString()
  const manifestFiles: DeweyManifest['files'] = {}

  // Try to detect theme from tokens.css
  let theme = 'neutral'
  const tokensPath = join(dir, 'src/styles/tokens.css')
  const tokensContent = await safeReadFile(tokensPath)
  if (tokensContent) {
    // Detect theme by checking accent color
    if (tokensContent.includes('#3b82f6') || tokensContent.includes('#60a5fa')) theme = 'ocean'
    else if (tokensContent.includes('#10b981') || tokensContent.includes('#34d399')) theme = 'emerald'
    else if (tokensContent.includes('#8b5cf6') || tokensContent.includes('#a78bfa')) theme = 'purple'
    else if (tokensContent.includes('#d97706') || tokensContent.includes('#fbbf24')) theme = 'dusk'
    else if (tokensContent.includes('#f43f5e') || tokensContent.includes('#fb7185')) theme = 'rose'
    else if (tokensContent.includes('#0969da') || tokensContent.includes('#58a6ff')) theme = 'github'
  }

  // Detect consumer-owned site settings without rewriting them.
  let projectName = 'docs'
  let defaultPage = 'overview'
  if (template === 'nextjs') {
    const deweyContent = await safeReadFile(join(dir, 'src/lib/dewey.tsx'))
    if (deweyContent) {
      projectName = deweyContent.match(/name:\s*['"]([^'"]+)['"]/)?.[1] ?? projectName
      defaultPage = deweyContent.match(/defaultPage:\s*['"]([^'"]+)['"]/)?.[1] ?? defaultPage
      theme = deweyContent.match(/theme:\s*['"]([^'"]+)['"]/)?.[1] ?? theme
    }
  } else {
    const baseLayoutContent = await safeReadFile(join(dir, 'src/layouts/BaseLayout.astro'))
    if (baseLayoutContent) {
      const match = baseLayoutContent.match(/<a class="text-lg font-semibold" href="\/">(.*?)<\/a>/)
      if (match) projectName = match[1]
    }

    const indexContent = await safeReadFile(join(dir, 'src/pages/index.astro'))
    if (indexContent) {
      const match = indexContent.match(/url=\/docs\/([^"]+)/)
      if (match) defaultPage = match[1]
    }
  }

  // Hash all existing dewey-owned files
  const ownedFiles: readonly string[] = template === 'nextjs' ? NEXTJS_OWNED_FILES : DEWEY_OWNED_FILES
  for (const filePath of ownedFiles) {
    const content = await safeReadFile(join(dir, filePath))
    if (content !== null) {
      manifestFiles[filePath] = {
        owner: 'dewey',
        hash: hashContent(content),
        version: DEWEY_VERSION,
      }
    }
  }

  // Mark consumer files
  manifestFiles['package.json'] = { owner: 'consumer' }
  manifestFiles['.gitignore'] = { owner: 'consumer' }
  if (template === 'nextjs') {
    for (const filePath of ['docs.json', 'src/lib/dewey.tsx']) {
      const content = await safeReadFile(join(dir, filePath))
      manifestFiles[filePath] = {
        owner: 'consumer',
        ...(content === null ? {} : { hash: hashContent(content) }),
      }
    }
  }

  return {
    deweyVersion: DEWEY_VERSION,
    createdAt: now,
    updatedAt: now,
    template,
    theme: resolveCliTheme(theme, message => console.warn(chalk.yellow(`⚠ ${message}`))),
    projectName,
    defaultPage,
    files: manifestFiles,
  }
}

export async function pruneBackupSnapshots(backupDir: string, keep = 5): Promise<string[]> {
  if (!await fileExists(backupDir)) return []
  const entries = await readdir(backupDir, { withFileTypes: true })
  const snapshots = entries
    .filter(entry => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}T/.test(entry.name))
    .map(entry => entry.name)
    .sort()
  const toRemove = snapshots.slice(0, Math.max(0, snapshots.length - keep))
  for (const name of toRemove) {
    await rm(join(backupDir, name), { recursive: true, force: true })
  }
  return toRemove
}

export async function updateCommand(dir: string | undefined, options: UpdateOptions) {
  const targetDir = dir ? resolve(process.cwd(), dir) : process.cwd()

  if (!await fileExists(targetDir)) {
    console.log(chalk.red(`\n❌ Directory not found: ${dir || '.'}\n`))
    process.exit(1)
  }

  // Phase 1 — Find manifest
  let manifest = await readManifest(targetDir)

  if (!manifest) {
    const detected = await detectSiteTemplate(targetDir)
    if (detected) {
      // Adoption flow for generated Astro and Next.js sites
      console.log(chalk.blue('\n📋 No manifest found, but this looks like a Dewey site.'))
      console.log(chalk.gray('   Creating .dewey-manifest.json from current file state...\n'))

      manifest = await adoptExistingSite(targetDir, detected)
      await writeManifest(targetDir, manifest)

      console.log(chalk.green('✓') + ' Created .dewey-manifest.json')
      console.log(chalk.gray(`   Detected theme: ${manifest.theme}`))
      console.log(chalk.gray(`   Detected project: ${manifest.projectName}`))
      console.log(chalk.gray(`   Detected default page: ${manifest.defaultPage}\n`))
      console.log(chalk.blue('Run `dewey update` again to apply the latest templates.\n'))
      return
    }

    console.log(chalk.red('\n❌ Not a Dewey site (no .dewey-manifest.json found).'))
    console.log(chalk.gray('   Run `dewey create <project-dir>` first.\n'))
    process.exit(1)
  }

  // Advisory: git dirty check
  if (isGitDirty(targetDir)) {
    console.log(chalk.yellow('\n💡 Tip: commit your changes before updating so you can review the diff.\n'))
  }

  // Phase 2 & 3 — Classify and generate
  const templateArgs = {
    projectName: manifest.projectName,
    theme: resolveCliTheme(manifest.theme, message => console.warn(chalk.yellow(`⚠ ${message}`))),
    defaultPage: manifest.defaultPage,
  }

  // Select template set based on manifest
  const isNextjs = manifest.template === 'nextjs'
  const templates = isNextjs ? NEXTJS_TEMPLATES : ASTRO_TEMPLATES
  const ownedFiles: readonly string[] = isNextjs ? NEXTJS_OWNED_FILES : DEWEY_OWNED_FILES

  const classifications: FileClassification[] = []

  for (const filePath of ownedFiles) {
    const templateFn = templates[filePath]
    if (!templateFn) continue

    const newContent = templateFn(templateArgs)
    const diskContent = await safeReadFile(join(targetDir, filePath))
    const manifestEntry = manifest.files[filePath]

    if (diskContent === null) {
      // File missing from disk
      classifications.push({ filePath, status: 'MISSING', newContent })
      continue
    }

    const diskHash = hashContent(diskContent)
    const newHash = hashContent(newContent)

    // If new content is same as disk → already current
    if (diskHash === newHash) {
      classifications.push({ filePath, status: 'ALREADY_CURRENT', diskHash, newContent })
      continue
    }

    if (manifestEntry && manifestEntry.owner !== 'dewey') {
      // Consumer-owned and ejected files are never silently reclaimed.
      classifications.push({
        filePath,
        status: 'MODIFIED',
        diskHash,
        manifestHash: manifestEntry.hash,
        newContent,
      })
      continue
    } else if (!manifestEntry) {
      // File exists on disk but not in manifest (new template file)
      classifications.push({ filePath, status: 'NEW', diskHash, newContent })
      continue
    }

    const manifestHash = manifestEntry.hash

    if (manifestHash && diskHash === manifestHash) {
      // Disk matches what Dewey last wrote → safe to overwrite
      classifications.push({ filePath, status: 'UNCHANGED', diskHash, manifestHash, newContent })
    } else {
      // User modified the file
      classifications.push({ filePath, status: 'MODIFIED', diskHash, manifestHash, newContent })
    }
  }

  // Check for files in manifest but no longer in current templates (removed templates)
  const removedFiles: string[] = []
  for (const filePath of Object.keys(manifest.files)) {
    if (manifest.files[filePath].owner !== 'dewey') continue
    if (ownedFiles.includes(filePath)) continue
    removedFiles.push(filePath)
  }

  // Phase 4 — Display summary
  const updated = classifications.filter(c => c.status === 'UNCHANGED' || c.status === 'MISSING' || c.status === 'NEW')
  const current = classifications.filter(c => c.status === 'ALREADY_CURRENT')
  const skipped = classifications.filter(c => c.status === 'MODIFIED')
  const forcedFiles = options.force
    ? skipped.filter(classification => manifest.files[classification.filePath]?.owner === 'dewey')
    : []
  const protectedFiles = skipped.filter(
    classification => manifest.files[classification.filePath]?.owner !== 'dewey',
  )

  const allToWrite = options.force ? [...updated, ...forcedFiles] : updated

  if (allToWrite.length === 0 && removedFiles.length === 0 && skipped.length === 0) {
    console.log(chalk.green('\n✓ All files up to date. Nothing to do.\n'))
    return
  }

  console.log(chalk.blue(`\nDewey Update: v${manifest.deweyVersion} → v${DEWEY_VERSION}\n`))

  if (updated.length > 0) {
    const names = updated.map(c => c.filePath).join(', ')
    console.log(chalk.green(`  Updated:     `) + `${names} (${updated.length} file${updated.length === 1 ? '' : 's'})`)
  }

  if (current.length > 0) {
    const names = current.map(c => c.filePath).join(', ')
    console.log(chalk.gray(`  Current:     `) + `${names} (${current.length} file${current.length === 1 ? '' : 's'})`)
  }

  if (skipped.length > 0 && !options.force) {
    const names = skipped.map(c => c.filePath).join(', ')
    console.log(chalk.yellow(`  Skipped:     `) + `${names} (modified by you — use --force)`)
  }

  if (protectedFiles.length > 0 && options.force) {
    const names = protectedFiles.map(c => c.filePath).join(', ')
    console.log(chalk.yellow(`  Protected:   `) + `${names} (consumer/ejected ownership is never reclaimed)`)
  }

  if (forcedFiles.length > 0) {
    const names = forcedFiles.map(c => c.filePath).join(', ')
    console.log(chalk.yellow(`  Forced:      `) + `${names} (backed up to .dewey-backup/)`)
  }

  if (removedFiles.length > 0) {
    for (const f of removedFiles) {
      console.log(chalk.gray(`  Notice:      You may safely remove ${f}`))
    }
  }

  console.log(chalk.gray(`  Untouched:   package.json, docs/*.md`))
  console.log('')

  if (options.dryRun) {
    console.log(chalk.yellow('  --dry-run: no files were written.\n'))
    return
  }

  // Phase 5 — Write
  const backupRoot = join(targetDir, '.dewey-backup')
  const backupSnapshot = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = join(backupRoot, backupSnapshot)

  for (const classification of allToWrite) {
    const fullPath = join(targetDir, classification.filePath)

    // If forcing a modified file, back it up first
    if (classification.status === 'MODIFIED' && options.force) {
      const backupPath = join(backupDir, classification.filePath)
      await mkdir(dirname(backupPath), { recursive: true })
      const existingContent = await safeReadFile(fullPath)
      if (existingContent !== null) {
        await writeFile(backupPath, existingContent)
      }
    }

    // Write the new content
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, classification.newContent)
  }

  // Update manifest
  const now = new Date().toISOString()
  const updatedManifest: DeweyManifest = {
    ...manifest,
    deweyVersion: DEWEY_VERSION,
    updatedAt: now,
  }

  // Update hashes for all files we wrote
  for (const classification of allToWrite) {
    updatedManifest.files[classification.filePath] = {
      owner: 'dewey',
      hash: hashContent(classification.newContent),
      version: DEWEY_VERSION,
    }
  }

  // Also update hashes for ALREADY_CURRENT files (they're at the right version)
  for (const classification of current) {
    updatedManifest.files[classification.filePath] = {
      owner: 'dewey',
      hash: hashContent(classification.newContent),
      version: DEWEY_VERSION,
    }
  }

  // Ensure all dewey-owned files are in the manifest
  for (const filePath of ownedFiles) {
    if (!updatedManifest.files[filePath]) {
      const diskContent = await safeReadFile(join(targetDir, filePath))
      if (diskContent !== null) {
        updatedManifest.files[filePath] = {
          owner: 'dewey',
          hash: hashContent(diskContent),
          version: DEWEY_VERSION,
        }
      }
    }
  }

  await writeManifest(targetDir, updatedManifest)

  if (forcedFiles.length > 0) {
    await pruneBackupSnapshots(backupRoot)
  }

  console.log(chalk.green(`✓ Updated ${allToWrite.length} file${allToWrite.length === 1 ? '' : 's'} to Dewey v${DEWEY_VERSION}\n`))
}
