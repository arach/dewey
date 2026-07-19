import chalk from 'chalk'
import { mkdir, writeFile, readFile, access, rename, rm } from 'fs/promises'
import { join, resolve } from 'path'
import { hashContent, readManifest, writeManifest } from '../manifest.js'
import { EJECTIBLE_COMPONENTS, type EjectibleComponent } from '../templates/nextjs.js'
import { DEWEY_VERSION } from '../version.js'

interface EjectOptions {
  full?: boolean
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export function generateWrapComponent(name: string, meta: EjectibleComponent): string {
  return `'use client'

import { ${meta.defaultImport} as Default${meta.defaultImport} } from '@arach/dewey'
import type { ${meta.propsType} } from '@arach/dewey'

export default function ${name}(props: ${meta.propsType}) {
  // Wrap the default — add your own header, footer, or behavior
  return (
    <div>
      {/* Add custom content above */}
      <Default${meta.defaultImport} {...props} />
      {/* Add custom content below */}
    </div>
  )
}
`
}

export function generateFullComponent(name: string, meta: EjectibleComponent): string {
  // Build destructured props based on the component
  const propsMap: Record<string, string> = {
    Header: '{ projectName, homeUrl, showThemeToggle }',
    Sidebar: '{ tree, currentPage, projectName, basePath }',
    TableOfContents: '{ markdown, containerRef, title, className }',
    MarkdownContent: '{ content }',
  }

  const destructured = propsMap[name] || 'props'

  return `'use client'

import type { ${meta.propsType} } from '@arach/dewey'

export default function ${name}(${destructured}: ${meta.propsType}) {
  return (
    <div>
      {/* Your complete custom ${name} implementation */}
    </div>
  )
}
`
}

export interface DeweyRewriteResult {
  content: string
  importReady: boolean
  mappingReady: boolean
  changed: boolean
  failures: string[]
}

export function rewriteDeweyTsx(content: string, componentName: string): DeweyRewriteResult {
  // Add import for the override component
  const overrideImport = `import Custom${componentName} from '@/components/overrides/${componentName}'`

  const alreadyImported = content.includes(overrideImport)

  // Add the import after the last existing import line
  const lines = content.split('\n')
  let lastImportIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].match(/^} from /)) {
      lastImportIndex = i
    }
  }

  if (!alreadyImported && lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, overrideImport)
  }

  // Replace the component in the components map
  const updatedContent = lines.join('\n')

  // Replace `ComponentName: DefaultComponentName` with `ComponentName: CustomComponentName`
  const mappedContent = updatedContent.replace(
    new RegExp(`(${componentName}:\\s*)Default${componentName}`),
    `$1Custom${componentName}`,
  )

  const importReady = mappedContent.includes(overrideImport)
  const mappingReady = new RegExp(`${componentName}:\\s*Custom${componentName}`).test(mappedContent)
  const failures: string[] = []
  if (!importReady) failures.push(`could not add the Custom${componentName} import`)
  if (!mappingReady) failures.push(`could not replace the ${componentName} component mapping`)

  return {
    content: mappedContent,
    importReady,
    mappingReady,
    changed: mappedContent !== content,
    failures,
  }
}

async function atomicWriteFile(path: string, content: string): Promise<void> {
  const temporaryPath = `${path}.dewey-tmp-${process.pid}-${Date.now()}`
  try {
    await writeFile(temporaryPath, content)
    await rename(temporaryPath, path)
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => undefined)
    throw error
  }
}

export async function ejectCommand(componentName: string, dir: string | undefined, options: EjectOptions) {
  const targetDir = dir ? resolve(process.cwd(), dir) : process.cwd()

  // Validate component name
  const meta = EJECTIBLE_COMPONENTS[componentName]
  if (!meta) {
    const valid = Object.keys(EJECTIBLE_COMPONENTS).join(', ')
    console.log(chalk.red(`\n  Unknown component: ${componentName}`))
    console.log(chalk.gray(`  Available: ${valid}\n`))
    process.exit(1)
  }

  // Check this is a Dewey Next.js site
  const manifest = await readManifest(targetDir)
  if (!manifest) {
    console.log(chalk.red('\n  Not a Dewey site (no .dewey-manifest.json found).'))
    console.log(chalk.gray('  Run `dewey create <project-dir>` first.\n'))
    process.exit(1)
  }

  if (manifest.template !== 'nextjs') {
    console.log(chalk.red('\n  Component ejection is only supported for Next.js sites.'))
    console.log(chalk.gray('  Create a new site with: dewey create <dir>\n'))
    process.exit(1)
  }

  const mode = options.full ? 'full' : 'wrap'
  const overridePath = join(targetDir, 'src/components/overrides', `${componentName}.tsx`)

  // Check if override already exists
  if (await fileExists(overridePath)) {
    console.log(chalk.yellow(`\n  Override already exists: src/components/overrides/${componentName}.tsx`))
    console.log(chalk.gray('  Edit it directly or delete it to re-eject.\n'))
    process.exit(1)
  }

  const deweyTsxPath = join(targetDir, 'src/lib/dewey.tsx')
  if (!await fileExists(deweyTsxPath)) {
    console.log(chalk.red('\n  Eject failed: src/lib/dewey.tsx was not found.'))
    console.log(chalk.gray('  No override was created; restore the generated site file and try again.\n'))
    process.exit(1)
  }

  const existingDeweyTsx = await readFile(deweyTsxPath, 'utf-8')
  const rewrite = rewriteDeweyTsx(existingDeweyTsx, componentName)
  if (rewrite.failures.length > 0) {
    console.log(chalk.red(`\n  Eject failed: ${rewrite.failures.join('; ')}.`))
    console.log(chalk.gray('  No files were changed; wire the component manually or restore src/lib/dewey.tsx.\n'))
    process.exit(1)
  }

  // Generate the override component
  const componentContent = mode === 'full'
    ? generateFullComponent(componentName, meta)
    : generateWrapComponent(componentName, meta)

  const overrideRelativePath = `src/components/overrides/${componentName}.tsx`
  manifest.files[overrideRelativePath] = {
    owner: 'ejected',
    hash: hashContent(componentContent),
    version: DEWEY_VERSION,
    component: componentName,
    mode,
  }
  manifest.files['src/lib/dewey.tsx'] = {
    owner: 'ejected',
    hash: hashContent(rewrite.content),
    version: DEWEY_VERSION,
    component: componentName,
    mode,
  }
  manifest.updatedAt = new Date().toISOString()

  // Both rewrites were verified in memory before either file is changed.
  await mkdir(join(targetDir, 'src/components/overrides'), { recursive: true })
  let overrideWritten = false
  let wiringWritten = false
  let manifestWritten = false
  try {
    await atomicWriteFile(overridePath, componentContent)
    overrideWritten = true
    await atomicWriteFile(deweyTsxPath, rewrite.content)
    wiringWritten = true
    await writeManifest(targetDir, manifest)
    manifestWritten = true
  } catch (error) {
    console.log(chalk.red('\n  Eject did not complete.'))
    console.log(chalk.gray(`  Override file: ${overrideWritten ? 'written' : 'not written'}`))
    console.log(chalk.gray(`  Component wiring: ${wiringWritten ? 'written' : 'not written'}`))
    console.log(chalk.gray(`  Ownership manifest: ${manifestWritten ? 'written' : 'not written'}`))
    console.log(chalk.gray(`  ${error instanceof Error ? error.message : String(error)}\n`))
    throw error
  }

  console.log(chalk.green('\n  ' + '✓') + ` Created ${overrideRelativePath}`)
  console.log(chalk.green('  ✓') + ' Verified import and component-map rewrites in src/lib/dewey.tsx')
  console.log(chalk.green('  ✓') + ' Recorded ejected ownership and Dewey version in .dewey-manifest.json')

  // Print summary
  const tierLabel = meta.tier === 'safe'
    ? chalk.green('safe')
    : chalk.yellow('advanced')

  console.log('')
  console.log(chalk.gray(`  Component:  `) + componentName)
  console.log(chalk.gray(`  Mode:       `) + (mode === 'full' ? 'Full eject' : 'Wrap (composable)'))
  console.log(chalk.gray(`  Tier:       `) + tierLabel)
  console.log(chalk.gray(`  Props:      `) + meta.propsType)
  console.log(chalk.gray(`  About:      `) + meta.description)
  console.log('')

  if (mode === 'wrap') {
    console.log(chalk.gray('  The default component is imported and composed.'))
    console.log(chalk.gray('  Framework updates will still flow through.'))
  } else {
    console.log(chalk.gray('  You have full control — no default import.'))
    console.log(chalk.gray('  Framework updates to this component will not apply.'))
  }

  console.log('')
}
