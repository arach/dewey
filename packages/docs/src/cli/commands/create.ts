import chalk from 'chalk'
import { mkdir, writeFile, readFile, readdir, access } from 'fs/promises'
import { join, basename, relative } from 'path'
import matter from 'gray-matter'
import {
  ASTRO_TEMPLATES,
  DEWEY_OWNED_FILES,
  CONSUMER_OWNED_FILES,
  resolveTheme,
  type AstroTemplateArgs,
} from '../templates/astro.js'
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
  template?: 'astro' | 'nextjs'
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
}

interface NavSection {
  title: string
  items: { id: string; title: string; description?: string }[]
}

function resolveTemplate(template?: string): 'astro' | 'nextjs' {
  if (template === 'astro') return 'astro'
  return 'nextjs'
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

  const files = await readdir(docsPath)

  for (const file of files) {
    if (!file.endsWith('.md')) continue

    const filePath = join(docsPath, file)
    const rawContent = await readFile(filePath, 'utf-8')
    const { data: frontmatter, content: body } = matter(rawContent)
    const id = file.replace('.md', '')

    docs.push({
      id,
      title: (frontmatter.title as string) || id.charAt(0).toUpperCase() + id.slice(1),
      description: frontmatter.description as string | undefined,
      content: body.trim(),
      rawContent,
      order: (frontmatter.order as number) || 999,
    })
  }

  docs.sort((a, b) => a.order - b.order)

  return docs
}

function generateNavigation(docs: DocFile[]): NavSection[] {
  const gettingStarted = docs.filter(d => d.order <= 10)
  const features = docs.filter(d => d.order > 10 && d.order <= 50)
  const reference = docs.filter(d => d.order > 50)

  const sections: NavSection[] = []

  if (gettingStarted.length > 0) {
    sections.push({
      title: 'Getting Started',
      items: gettingStarted.map(d => ({ id: d.id, title: d.title, description: d.description })),
    })
  }

  if (features.length > 0) {
    sections.push({
      title: 'Features',
      items: features.map(d => ({ id: d.id, title: d.title, description: d.description })),
    })
  }

  if (reference.length > 0) {
    sections.push({
      title: 'Reference',
      items: reference.map(d => ({ id: d.id, title: d.title, description: d.description })),
    })
  }

  if (sections.length === 0 && docs.length > 0) {
    sections.push({
      title: 'Documentation',
      items: docs.map(d => ({ id: d.id, title: d.title, description: d.description })),
    })
  }

  return sections
}

function generateDocsJson(projectName: string, navigation: NavSection[]): string {
  const groups = navigation.map(section => ({
    id: section.title.toLowerCase().replace(/\s+/g, '-'),
    title: section.title,
    items: section.items.map(item => ({
      id: item.id,
      title: item.title,
      ...(item.description ? { description: item.description } : {}),
    })),
  }))

  return JSON.stringify({ name: projectName, groups }, null, 2)
}

// ---------------------------------------------------------------------------
// Create command
// ---------------------------------------------------------------------------

export async function createCommand(projectDir: string, options: CreateOptions) {
  const cwd = process.cwd()
  const targetDir = join(cwd, projectDir)
  const sourcePath = options.source ? join(cwd, options.source) : join(cwd, 'docs')
  const projectName = options.name || basename(projectDir)
  const template = resolveTemplate(options.template)
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
      content: `# Welcome to ${projectName}\n\nThis is your documentation site. Add markdown files to your docs directory to get started.`,
      rawContent: `---\ntitle: Overview\ndescription: Welcome to the documentation\norder: 1\n---\n\n# Welcome to ${projectName}\n\nThis is your documentation site. Add markdown files to your docs directory to get started.\n`,
      order: 1,
    })
  }

  console.log(chalk.green(`✓ Found ${docs.length} doc${docs.length === 1 ? '' : 's'}`))

  // Generate navigation from docs
  const navigation = generateNavigation(docs)
  const defaultPage = docs[0]?.id || 'overview'

  // Create directory structure
  console.log(chalk.gray('\n📁 Creating project structure...'))

  await mkdir(targetDir, { recursive: true })

  // Template args for all templates
  const templateArgs: AstroTemplateArgs & NextjsTemplateArgs = { projectName, theme, defaultPage }

  // Assemble template files based on chosen template
  let files: [string, string][]
  let ownedFiles: readonly string[]
  let consumerFiles: readonly string[]
  let gitignoreContent: string
  let packageJsonContent: string
  let devUrl: string

  if (template === 'nextjs') {
    // Next.js template
    files = Object.keys(NEXTJS_TEMPLATES).map((filePath) => [
      filePath,
      NEXTJS_TEMPLATES[filePath](templateArgs),
    ])

    // Add consumer-owned files that are generated once
    files.push(['src/lib/dewey.tsx', generateDeweyTsx(templateArgs)])

    ownedFiles = NEXTJS_OWNED_FILES
    consumerFiles = NEXTJS_CONSUMER_OWNED_FILES
    packageJsonContent = generateNextjsPackageJson(templateArgs)
    gitignoreContent = generateNextjsGitignore()
    devUrl = 'http://localhost:3000/docs/'
  } else {
    // Astro template (backward compat)
    files = [
      ['astro.config.mjs', ASTRO_TEMPLATES['astro.config.mjs'](templateArgs)],
      ['tsconfig.json', ASTRO_TEMPLATES['tsconfig.json'](templateArgs)],
      ['src/styles/global.css', ASTRO_TEMPLATES['src/styles/global.css'](templateArgs)],
      ['src/styles/tokens.css', ASTRO_TEMPLATES['src/styles/tokens.css'](templateArgs)],
      ['src/styles/base.css', ASTRO_TEMPLATES['src/styles/base.css'](templateArgs)],
      ['src/styles/markdown.css', ASTRO_TEMPLATES['src/styles/markdown.css'](templateArgs)],
      ['src/layouts/BaseLayout.astro', ASTRO_TEMPLATES['src/layouts/BaseLayout.astro'](templateArgs)],
      ['src/layouts/DocsLayout.astro', ASTRO_TEMPLATES['src/layouts/DocsLayout.astro'](templateArgs)],
      ['src/components/SidebarNav.astro', ASTRO_TEMPLATES['src/components/SidebarNav.astro'](templateArgs)],
      ['src/components/Toc.astro', ASTRO_TEMPLATES['src/components/Toc.astro'](templateArgs)],
      ['src/lib/nav.ts', ASTRO_TEMPLATES['src/lib/nav.ts'](templateArgs)],
      ['src/pages/index.astro', ASTRO_TEMPLATES['src/pages/index.astro'](templateArgs)],
      ['src/pages/docs/[...slug].astro', ASTRO_TEMPLATES['src/pages/docs/[...slug].astro'](templateArgs)],
    ]

    ownedFiles = DEWEY_OWNED_FILES
    consumerFiles = CONSUMER_OWNED_FILES
    packageJsonContent = ASTRO_TEMPLATES['package.json'](templateArgs)
    gitignoreContent = `# Dependencies
node_modules
.pnpm-store

# Astro
dist
.astro

# Misc
.DS_Store
*.log
`
    devUrl = 'http://localhost:4321/docs/'
  }

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
  const docsJsonContent = generateDocsJson(projectName, navigation)
  await writeFile(join(targetDir, 'docs.json'), docsJsonContent)
  console.log(chalk.green('✓') + ' docs.json')

  // Copy raw markdown files to docs/
  const docsDir = join(targetDir, 'docs')
  await mkdir(docsDir, { recursive: true })

  for (const doc of docs) {
    const docPath = join(docsDir, `${doc.id}.md`)
    await writeFile(docPath, doc.rawContent)
    console.log(chalk.green('✓') + ` docs/${doc.id}.md`)
  }

  // Create .gitignore
  await writeFile(join(targetDir, '.gitignore'), gitignoreContent)
  console.log(chalk.green('✓') + ' .gitignore')

  // Write .dewey-manifest.json
  const now = new Date().toISOString()
  const manifestFiles: DeweyManifest['files'] = {}

  // Hash dewey-owned files
  for (const [filePath, content] of files) {
    const isDeweyOwned = (ownedFiles as readonly string[]).includes(filePath)
    manifestFiles[filePath] = {
      owner: isDeweyOwned ? 'dewey' : 'consumer',
      ...(isDeweyOwned ? { hash: hashContent(content), version: DEWEY_VERSION } : {}),
    }
  }

  // Mark consumer-owned files
  for (const filePath of consumerFiles) {
    manifestFiles[filePath] = { owner: 'consumer' }
  }

  const manifest: DeweyManifest = {
    deweyVersion: DEWEY_VERSION,
    createdAt: now,
    updatedAt: now,
    template,
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
  console.log(chalk.cyan(`  ${devUrl}`))
  console.log('')

  if (docs.length > 0) {
    console.log('Included documentation:')
    for (const doc of docs) {
      console.log(chalk.gray(`  - ${doc.title} (${doc.id}.md)`))
    }
    console.log('')
  }

  if (template === 'nextjs') {
    console.log(chalk.gray('To customize components:'))
    console.log(chalk.cyan('  dewey eject <Header|Sidebar|TableOfContents|MarkdownContent>'))
    console.log('')
  }
}
