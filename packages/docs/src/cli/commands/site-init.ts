import chalk from 'chalk'
import { mkdir, writeFile, readFile, readdir, access } from 'fs/promises'
import { join, dirname, basename, relative } from 'path'
import matter from 'gray-matter'
import {
  SUBPATH_TEMPLATES,
  SUBPATH_OWNED_FILES,
  SUBPATH_CONSUMER_OWNED_FILES,
  generateDocsJson,
  type SubpathTemplateArgs,
} from '../templates/subpath.js'
import { hashContent, writeManifest, type DeweyManifest } from '../manifest.js'
import { DEWEY_VERSION } from '../version.js'

interface SiteInitOptions {
  source?: string
  name?: string
  basePath?: string
}

interface ScannedDoc {
  slug: string
  title: string
  description?: string
  group: string
  order: number
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function scanDocs(docsDir: string): Promise<ScannedDoc[]> {
  const docs: ScannedDoc[] = []

  async function scan(dir: string) {
    if (!await fileExists(dir)) return
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await scan(join(dir, entry.name))
      } else if (entry.name.endsWith('.md') && !entry.name.endsWith('.agent.md') && entry.name !== 'README.md') {
        const filePath = join(dir, entry.name)
        const raw = await readFile(filePath, 'utf-8')
        const { data } = matter(raw)
        const slug = basename(entry.name, '.md')

        docs.push({
          slug,
          title: (data.title as string) || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
          description: data.description as string | undefined,
          group: (data.group as string) || (data.section as string) || 'Documentation',
          order: (data.order as number) ?? 999,
        })
      }
    }
  }

  await scan(docsDir)
  return docs.sort((a, b) => a.order - b.order)
}

export async function siteInitCommand(options: SiteInitOptions) {
  const cwd = process.cwd()

  // Verify we're in an existing Next.js project
  const hasPackageJson = await fileExists(join(cwd, 'package.json'))
  const hasNextConfig = await fileExists(join(cwd, 'next.config.ts')) || await fileExists(join(cwd, 'next.config.js')) || await fileExists(join(cwd, 'next.config.mjs'))

  if (!hasPackageJson) {
    console.log(chalk.red('\n❌ No package.json found. Run this inside an existing project.\n'))
    process.exit(1)
  }

  if (!hasNextConfig) {
    console.log(chalk.yellow('\n⚠️  No next.config found. This command is designed for Next.js App Router projects.'))
    console.log(chalk.gray('   Proceeding anyway...\n'))
  }

  // Check if docs route already exists
  if (await fileExists(join(cwd, 'src/app/docs'))) {
    console.log(chalk.red('\n❌ src/app/docs/ already exists.'))
    console.log(chalk.gray('   Remove it first, or use `dewey update` to refresh an existing setup.\n'))
    process.exit(1)
  }

  // Resolve project name
  let projectName: string = options.name || ''
  if (!projectName) {
    try {
      const pkg = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf-8'))
      projectName = pkg.name?.replace(/^@[^/]+\//, '') || basename(cwd)
    } catch {
      projectName = basename(cwd)
    }
  }

  const basePath = options.basePath || '/docs'
  const sourceDir = options.source ? join(cwd, options.source) : join(cwd, 'docs')
  const docsDir = relative(cwd, sourceDir) || './docs'

  console.log(chalk.blue(`\n📚 Initializing Dewey docs at ${basePath}\n`))
  console.log(chalk.gray(`   Project:  ${projectName}`))
  console.log(chalk.gray(`   Docs:     ${docsDir}`))
  console.log(chalk.gray(`   Base:     ${basePath}\n`))

  // Scan docs
  const docs = await scanDocs(sourceDir)

  if (docs.length === 0) {
    console.log(chalk.yellow(`⚠️  No markdown files found in ${docsDir}`))
    console.log(chalk.gray('   Create docs/*.md files with frontmatter (title, description, group, order).'))
    console.log(chalk.gray('   Generating with empty docs.json — add entries manually.\n'))
  } else {
    console.log(chalk.green(`✓ Found ${docs.length} doc${docs.length === 1 ? '' : 's'}`))
  }

  const defaultPage = docs[0]?.slug || 'overview'

  // Generate template args
  const templateArgs: SubpathTemplateArgs = {
    projectName,
    basePath,
    docsDir,
    defaultPage,
  }

  // Generate and write template files
  console.log(chalk.gray('\n📁 Generating docs route...\n'))

  const writtenFiles: [string, string][] = []

  for (const [filePath, templateFn] of Object.entries(SUBPATH_TEMPLATES)) {
    const content = templateFn(templateArgs)
    const fullPath = join(cwd, filePath)
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, content)
    writtenFiles.push([filePath, content])
    console.log(chalk.green('✓') + ` ${filePath}`)
  }

  // Generate docs.json (consumer-owned)
  if (!await fileExists(join(cwd, 'docs.json'))) {
    const docsJsonContent = generateDocsJson(projectName, docs)
    await writeFile(join(cwd, 'docs.json'), docsJsonContent)
    console.log(chalk.green('✓') + ' docs.json')
  } else {
    console.log(chalk.gray('⊘') + ' docs.json (already exists, skipped)')
  }

  // Write manifest
  const now = new Date().toISOString()
  const manifestFiles: DeweyManifest['files'] = {}

  for (const [filePath, content] of writtenFiles) {
    const isDeweyOwned = (SUBPATH_OWNED_FILES as readonly string[]).includes(filePath)
    manifestFiles[filePath] = {
      owner: isDeweyOwned ? 'dewey' : 'consumer',
      ...(isDeweyOwned ? { hash: hashContent(content), version: DEWEY_VERSION } : {}),
    }
  }

  for (const filePath of SUBPATH_CONSUMER_OWNED_FILES) {
    manifestFiles[filePath] = { owner: 'consumer' }
  }

  const manifest: DeweyManifest = {
    deweyVersion: DEWEY_VERSION,
    createdAt: now,
    updatedAt: now,
    scaffold: 'subpath',
    templateId: 'hudson',
    themeId: 'neutral',
    template: 'subpath',
    theme: 'neutral',
    projectName,
    defaultPage,
    docsDir,
    basePath,
    files: manifestFiles,
  }

  await writeManifest(cwd, manifest)
  console.log(chalk.green('✓') + ' .dewey-manifest.json')

  // Summary
  console.log(chalk.blue('\n✨ Docs route initialized!\n'))

  // Check for missing deps
  let pkgJson: Record<string, any> = {}
  try {
    pkgJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf-8'))
  } catch {}
  const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies }
  const missing: string[] = []
  if (!allDeps['@arach/dewey']) missing.push('@arach/dewey')
  if (!allDeps['gray-matter']) missing.push('gray-matter')
  if (!allDeps['lucide-react']) missing.push('lucide-react')

  if (missing.length > 0) {
    console.log(chalk.yellow('Install missing dependencies:'))
    console.log(chalk.cyan(`  bun add ${missing.join(' ')}\n`))
  }

  console.log('Files generated:')
  console.log(chalk.gray('  Dewey-owned (updated by `dewey update`):'))
  for (const f of SUBPATH_OWNED_FILES) {
    console.log(chalk.gray(`    ${f}`))
  }
  console.log(chalk.gray('  Consumer-owned (yours to edit):'))
  console.log(chalk.gray('    docs.json'))
  console.log('')

  console.log('Customize:')
  console.log(chalk.gray(`  Fonts        → load a display font (e.g. Newsreader) and set --font-newsreader`))
  console.log(chalk.gray(`  Colors/fonts → override --dewey-* vars in your globals.css`))
  console.log(chalk.gray(`  Navigation   → edit docs.json`))
  console.log(chalk.gray(`  Docs content → add .md files to ${docsDir}/`))
  console.log('')

  console.log('Start dev server and open:')
  console.log(chalk.cyan(`  http://localhost:3000${basePath}`))
  console.log('')
}
