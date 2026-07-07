import chalk from 'chalk'
import { readFile, writeFile, mkdir, access } from 'fs/promises'
import { join, dirname, resolve } from 'path'
import { execSync } from 'child_process'
import { resolveTheme, type TemplateId } from '../templates/themes.js'
import {
  NEXTJS_TEMPLATES,
  NEXTJS_OWNED_FILES,
} from '../templates/nextjs.js'
import {
  SUBPATH_TEMPLATES,
  SUBPATH_OWNED_FILES,
  type SubpathTemplateArgs,
} from '../templates/subpath.js'
import {
  getManifestScaffold,
  getManifestTemplateId,
  getManifestThemeId,
  hashContent,
  readManifest,
  writeManifest,
  type DeweyManifest,
} from '../manifest.js'
import { DEWEY_VERSION } from '../version.js'

interface UpdateOptions {
  dryRun?: boolean
  force?: boolean
  refreshNav?: boolean
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
    const out = execSync('git status --porcelain', { cwd: dir, encoding: 'utf-8' })
    return out.trim().length > 0
  } catch {
    return false
  }
}

async function detectSiteTemplate(dir: string): Promise<'nextjs' | null> {
  const [hasNextConfig, hasDeweyTsx] = await Promise.all([
    fileExists(join(dir, 'next.config.js')),
    fileExists(join(dir, 'src/lib/dewey.tsx')),
  ])

  if (hasNextConfig && hasDeweyTsx) return 'nextjs'
  return null
}

async function adoptExistingSite(dir: string): Promise<DeweyManifest> {
  const now = new Date().toISOString()
  const manifestFiles: DeweyManifest['files'] = {}

  // Try to detect projectName and theme from dewey.tsx
  let projectName = 'docs'
  let theme = 'neutral'
  const deweyTsxContent = await safeReadFile(join(dir, 'src/lib/dewey.tsx'))
  if (deweyTsxContent) {
    const nameMatch = deweyTsxContent.match(/name:\s*'([^']+)'/)
    if (nameMatch) projectName = nameMatch[1]
    const themeMatch = deweyTsxContent.match(/theme:\s*'([^']+)'/)
    if (themeMatch) theme = themeMatch[1]
  }

  // Try to detect defaultPage from page.tsx
  let defaultPage = 'overview'
  const pageContent = await safeReadFile(join(dir, 'src/app/page.tsx'))
  if (pageContent) {
    const match = pageContent.match(/redirect\(['"]\/docs\/([^'"]+)['"]/)
    if (match) defaultPage = match[1]
  }

  // Hash all existing dewey-owned files
  for (const filePath of NEXTJS_OWNED_FILES) {
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
  manifestFiles['docs.json'] = { owner: 'consumer' }
  manifestFiles['src/lib/dewey.tsx'] = { owner: 'consumer' }

  const themeId = resolveTheme(theme)
  return {
    deweyVersion: DEWEY_VERSION,
    createdAt: now,
    updatedAt: now,
    scaffold: 'nextjs',
    templateId: 'hudson',
    themeId,
    template: 'nextjs',
    theme: themeId,
    projectName,
    defaultPage,
    files: manifestFiles,
  }
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
    if (detected === 'nextjs') {
      console.log(chalk.blue('\n📋 No manifest found, but this looks like a Dewey site.'))
      console.log(chalk.gray('   Creating .dewey-manifest.json from current file state...\n'))

      manifest = await adoptExistingSite(targetDir)
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
  // Resolve template set based on manifest
  const isSubpath = getManifestScaffold(manifest) === 'subpath'

  const templates: Record<string, (args: any) => string> = isSubpath
    ? SUBPATH_TEMPLATES
    : NEXTJS_TEMPLATES

  const ownedFiles: readonly string[] = isSubpath
    ? SUBPATH_OWNED_FILES
    : NEXTJS_OWNED_FILES

  const templateArgs = isSubpath
    ? {
        projectName: manifest.projectName,
        basePath: manifest.basePath ?? '/docs',
        docsDir: manifest.docsDir ?? './docs',
        defaultPage: manifest.defaultPage,
      } satisfies SubpathTemplateArgs
    : {
        projectName: manifest.projectName,
        theme: resolveTheme(getManifestThemeId(manifest)),
        templateId: getManifestTemplateId(manifest) as TemplateId,
        defaultPage: manifest.defaultPage,
      }

  const classifications: FileClassification[] = []

  for (const filePath of ownedFiles) {
    const templateFn = templates[filePath]
    if (!templateFn) continue

    const newContent = templateFn(templateArgs)
    const diskContent = await safeReadFile(join(targetDir, filePath))
    const manifestEntry = manifest.files[filePath]

    if (diskContent === null) {
      classifications.push({ filePath, status: 'MISSING', newContent })
      continue
    }

    const diskHash = hashContent(diskContent)
    const newHash = hashContent(newContent)

    if (diskHash === newHash) {
      classifications.push({ filePath, status: 'ALREADY_CURRENT', diskHash, newContent })
      continue
    }

    if (!manifestEntry) {
      classifications.push({ filePath, status: 'NEW', diskHash, newContent })
      continue
    }

    const manifestHash = manifestEntry.hash

    if (manifestHash && diskHash === manifestHash) {
      classifications.push({ filePath, status: 'UNCHANGED', diskHash, manifestHash, newContent })
    } else {
      classifications.push({ filePath, status: 'MODIFIED', diskHash, manifestHash, newContent })
    }
  }

  // Check for files in manifest but no longer in current templates
  const removedFiles: string[] = []
  for (const filePath of Object.keys(manifest.files)) {
    if (manifest.files[filePath].owner !== 'dewey') continue
    if ((ownedFiles as readonly string[]).includes(filePath)) continue
    removedFiles.push(filePath)
  }

  // Phase 4 — Display summary
  const updated = classifications.filter(c => c.status === 'UNCHANGED' || c.status === 'MISSING' || c.status === 'NEW')
  const current = classifications.filter(c => c.status === 'ALREADY_CURRENT')
  const skipped = classifications.filter(c => c.status === 'MODIFIED')
  const forcedFiles = options.force ? skipped : []

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
  const backupDir = join(targetDir, '.dewey-backup')

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

  for (const classification of allToWrite) {
    updatedManifest.files[classification.filePath] = {
      owner: 'dewey',
      hash: hashContent(classification.newContent),
      version: DEWEY_VERSION,
    }
  }

  for (const classification of current) {
    updatedManifest.files[classification.filePath] = {
      owner: 'dewey',
      hash: hashContent(classification.newContent),
      version: DEWEY_VERSION,
    }
  }

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

  console.log(chalk.green(`✓ Updated ${allToWrite.length} file${allToWrite.length === 1 ? '' : 's'} to Dewey v${DEWEY_VERSION}\n`))
}
