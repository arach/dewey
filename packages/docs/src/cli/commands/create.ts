import chalk from 'chalk'
import { mkdir, writeFile, readFile, access } from 'fs/promises'
import { dirname, join, basename, relative } from 'path'
import {
  buildDocsManifest,
  discoverDocuments,
  type DiscoveredDocument,
} from '../docs-manifest.js'
import {
  ASTRO_TEMPLATES,
  DEWEY_OWNED_FILES,
  CONSUMER_OWNED_FILES,
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
import { writeAgentArtifacts } from '../agent-artifacts.js'
import { DEWEY_VERSION } from '../version.js'
import { resolveCliTheme } from '../input-contracts.js'

interface CreateOptions {
  source?: string
  template?: 'astro' | 'nextjs'
  theme?: string
  name?: string
}

type DocFile = DiscoveredDocument

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

export async function loadMarkdownDocs(docsPath: string): Promise<DocFile[]> {
  if (!await fileExists(docsPath)) {
    return []
  }
  return (await discoverDocuments({ rootDir: docsPath, docsDir: docsPath, audience: 'human' }))
    .filter(doc => doc.extension === '.md')
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
  const theme = resolveCliTheme(options.theme, message => console.warn(chalk.yellow(`⚠ ${message}`)))

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

    const samplePath = join(sourcePath, 'overview.md')
    docs.push({
      id: 'overview',
      title: 'Overview',
      description: 'Welcome to the documentation',
      content: `Welcome to **${projectName}**.\n\nThis is your documentation site. Add markdown files to your docs directory to get started.`,
      rawContent: `---\ntitle: Overview\ndescription: Welcome to the documentation\norder: 1\n---\n\nWelcome to **${projectName}**.\n\nThis is your documentation site. Add markdown files to your docs directory to get started.\n`,
      frontmatter: { title: 'Overview', description: 'Welcome to the documentation', order: 1 },
      order: 1,
      sourcePath: 'overview.md',
      relativeSourcePath: 'overview.md',
      extension: '.md',
      absoluteSourcePath: samplePath,
    })
  }

  console.log(chalk.green(`✓ Found ${docs.length} doc${docs.length === 1 ? '' : 's'}`))

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

  // A scaffold is a presentation layer over the same retrieval contract as
  // `dewey generate`. Keep scaffold ownership and generated-artifact ownership
  // separate, but compose them deliberately in a newly created site.
  const agentArtifacts = await writeAgentArtifacts({
    rootDir: targetDir,
    docsDir,
    outputDir: targetDir,
    project: { name: projectName },
  })
  console.log(chalk.green('✓') + ` agent/ (${agentArtifacts.docs} docs, ${agentArtifacts.prompts} prompts)`)

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
  console.log(chalk.gray('  bun install'))
  console.log(chalk.gray('  bun run dev'))
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
