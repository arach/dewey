import chalk from 'chalk'
import { mkdir, writeFile, readFile, readdir, access } from 'fs/promises'
import { dirname, join, basename, relative } from 'path'
import matter from 'gray-matter'
import { buildDocsManifest, resolveAgentDocPath } from '../docs-manifest.js'
import { resolveTheme } from '../templates/themes.js'
import {
  NEXTJS_TEMPLATES,
  NEXTJS_OWNED_FILES,
  NEXTJS_CONSUMER_OWNED_FILES,
  generateDeweyTsx,
  generateNextjsPackageJson,
  generateNextjsGitignore,
  type NextjsTemplateArgs,
} from '../templates/nextjs.js'
import { hashContent, writeManifest, type DeweyManifest } from '../manifest.js'
import { DEWEY_VERSION } from '../version.js'

interface CreateOptions {
  source?: string
  theme?: string
  name?: string
}

interface DocFile {
  id: string
  title: string
  description?: string
  content: string
  rawContent: string
  order: number
  groupId?: string
  groupTitle?: string
  sourcePath: string
  absoluteSourcePath: string
  agentSourcePath?: string
  absoluteAgentSourcePath?: string
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function loadMarkdownDocs(docsPath: string): Promise<DocFile[]> {
  const docs: DocFile[] = []

  if (!await fileExists(docsPath)) {
    return docs
  }

  const files = await readdir(docsPath, { recursive: true })

  for (const file of files) {
    if (!file.endsWith('.md') || file.endsWith('.agent.md')) continue

    const filePath = join(docsPath, String(file))
    const rawContent = await readFile(filePath, 'utf-8')
    const { data: frontmatter, content: body } = matter(rawContent)
    const id = file.replace('.md', '')
    const agentSourcePath = await resolveAgentDocPath(docsPath, id)

    docs.push({
      id,
      title: (frontmatter.title as string) || id.charAt(0).toUpperCase() + id.slice(1),
      description: frontmatter.description as string | undefined,
      content: body.trim(),
      rawContent,
      order: (frontmatter.order as number) || 999,
      groupId: frontmatter.groupId as string | undefined,
      groupTitle: frontmatter.group as string | undefined,
      sourcePath: file.replace(/\\/g, '/'),
      absoluteSourcePath: filePath,
      agentSourcePath: agentSourcePath ? relative(docsPath, agentSourcePath).replace(/\\/g, '/') : undefined,
      absoluteAgentSourcePath: agentSourcePath,
    })
  }

  docs.sort((a, b) => a.order - b.order)

  return docs
}
// ---------------------------------------------------------------------------
// Create command
// ---------------------------------------------------------------------------

export async function createCommand(projectDir: string, options: CreateOptions) {
  const cwd = process.cwd()
  const targetDir = join(cwd, projectDir)
  const sourcePath = options.source ? join(cwd, options.source) : join(cwd, 'docs')
  const projectName = options.name || basename(projectDir)
  const theme = resolveTheme(options.theme)

  console.log(chalk.blue(`\n🚀 Creating Dewey docs site: ${projectName}\n`))

  // Check if target directory exists
  if (await fileExists(targetDir)) {
    console.log(chalk.red(`❌ Directory already exists: ${projectDir}`))
    console.log(chalk.gray('   Use a different name or remove the existing directory.\n'))
    process.exit(1)
  }

  // Load markdown docs from source
  console.log(chalk.gray(`📖 Loading docs from: ${relative(cwd, sourcePath) || '.'}`))
  const docs = await loadMarkdownDocs(sourcePath)

  if (docs.length === 0) {
    console.log(chalk.yellow(`⚠️  No markdown files found in ${sourcePath}`))
    console.log(chalk.gray('   Creating with sample documentation...\n'))

    docs.push({
      id: 'overview',
      title: 'Overview',
      description: 'Welcome to the documentation',
      content: `Welcome to **${projectName}**.\n\nThis is your documentation site. Add markdown files to your docs directory to get started.`,
      rawContent: `---\ntitle: Overview\ndescription: Welcome to the documentation\norder: 1\n---\n\nWelcome to **${projectName}**.\n\nThis is your documentation site. Add markdown files to your docs directory to get started.\n`,
      order: 1,
      sourcePath: 'overview.md',
      absoluteSourcePath: join(sourcePath, 'overview.md'),
    })
  }

  console.log(chalk.green(`✓ Found ${docs.length} doc${docs.length === 1 ? '' : 's'}`))

  const defaultPage = docs[0]?.id || 'overview'

  // Create directory structure
  console.log(chalk.gray('\n📁 Creating project structure...'))

  await mkdir(targetDir, { recursive: true })

  const templateArgs: NextjsTemplateArgs = { projectName, theme, defaultPage }

  // Generate all template files
  const files: [string, string][] = Object.keys(NEXTJS_TEMPLATES).map((filePath) => [
    filePath,
    NEXTJS_TEMPLATES[filePath](templateArgs),
  ])

  // Add consumer-owned files that are generated once
  files.push(['src/lib/dewey.tsx', generateDeweyTsx(templateArgs)])

  const packageJsonContent = generateNextjsPackageJson(templateArgs)
  const gitignoreContent = generateNextjsGitignore()

  // Write package.json
  await writeFile(join(targetDir, 'package.json'), packageJsonContent)
  console.log(chalk.green('✓') + ' package.json')

  // Write template files
  for (const [filePath, content] of files) {
    const fullPath = join(targetDir, filePath)
    const dir = join(targetDir, filePath.split('/').slice(0, -1).join('/'))
    await mkdir(dir, { recursive: true })
    await writeFile(fullPath, content)
    console.log(chalk.green('✓') + ` ${filePath}`)
  }

  // Generate and write docs.json
  const docsJsonContent = JSON.stringify(buildDocsManifest(
    projectName,
    undefined,
    undefined,
    docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      content: doc.content,
      order: doc.order,
      groupId: doc.groupId,
      groupTitle: doc.groupTitle,
      sourcePath: `docs/${doc.sourcePath}`,
      agentSourcePath: doc.agentSourcePath ? `docs/${doc.agentSourcePath}` : undefined,
    })),
  ), null, 2)
  await writeFile(join(targetDir, 'docs.json'), docsJsonContent)
  console.log(chalk.green('✓') + ' docs.json')

  // Copy raw markdown files to docs/
  const docsDir = join(targetDir, 'docs')
  await mkdir(docsDir, { recursive: true })

  for (const doc of docs) {
    const docPath = join(docsDir, `${doc.id}.md`)
    await mkdir(dirname(docPath), { recursive: true })
    await writeFile(docPath, doc.rawContent)
    console.log(chalk.green('✓') + ` docs/${doc.sourcePath}`)

    if (doc.agentSourcePath && doc.absoluteAgentSourcePath) {
      const agentPath = join(docsDir, doc.agentSourcePath)
      const agentContent = await readFile(doc.absoluteAgentSourcePath, 'utf-8')
      await mkdir(dirname(agentPath), { recursive: true })
      await writeFile(agentPath, agentContent)
      console.log(chalk.green('✓') + ` docs/${doc.agentSourcePath}`)
    }
  }

  // Create .gitignore
  await writeFile(join(targetDir, '.gitignore'), gitignoreContent)
  console.log(chalk.green('✓') + ' .gitignore')

  // Write .dewey-manifest.json
  const now = new Date().toISOString()
  const manifestFiles: DeweyManifest['files'] = {}

  // Hash dewey-owned files
  for (const [filePath, content] of files) {
    const isDeweyOwned = (NEXTJS_OWNED_FILES as readonly string[]).includes(filePath)
    manifestFiles[filePath] = {
      owner: isDeweyOwned ? 'dewey' : 'consumer',
      ...(isDeweyOwned ? { hash: hashContent(content), version: DEWEY_VERSION } : {}),
    }
  }

  // Mark consumer-owned files
  for (const filePath of NEXTJS_CONSUMER_OWNED_FILES) {
    manifestFiles[filePath] = { owner: 'consumer' }
  }

  const manifest: DeweyManifest = {
    deweyVersion: DEWEY_VERSION,
    createdAt: now,
    updatedAt: now,
    template: 'nextjs',
    theme,
    projectName,
    defaultPage,
    files: manifestFiles,
  }

  await writeManifest(targetDir, manifest)
  console.log(chalk.green('✓') + ' .dewey-manifest.json')

  console.log(chalk.blue('\n✨ Docs site created!\n'))

  console.log('Next steps:')
  console.log(chalk.gray(`  cd ${projectDir}`))
  console.log(chalk.gray('  pnpm install'))
  console.log(chalk.gray('  pnpm dev'))
  console.log('')
  console.log('Your docs will be available at:')
  console.log(chalk.cyan('  http://localhost:3000/docs/'))
  console.log('')

  if (docs.length > 0) {
    console.log('Included documentation:')
    for (const doc of docs) {
      console.log(chalk.gray(`  - ${doc.title} (${doc.id}.md)`))
    }
    console.log('')
  }

  console.log(chalk.gray('To customize components:'))
  console.log(chalk.cyan('  dewey eject <Header|Sidebar|TableOfContents|MarkdownContent>'))
  console.log('')
}
