import chalk from 'chalk'
import { mkdir, writeFile, readFile, access } from 'fs/promises'
import { join, resolve } from 'path'
import { readManifest } from '../manifest.js'
import { EJECTIBLE_COMPONENTS, type EjectibleComponent } from '../templates/nextjs.js'

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

function generateWrapComponent(name: string, meta: EjectibleComponent): string {
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

function generateFullComponent(name: string, meta: EjectibleComponent): string {
  // Build destructured props based on the component
  const propsMap: Record<string, string> = {
    Header: '{ projectName, homeUrl, showThemeToggle }',
    Sidebar: '{ tree, currentPage, projectName, basePath }',
    TableOfContents: '{ items, title, markdown }',
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

function updateDeweyTsx(content: string, componentName: string): string {
  // Add import for the override component
  const overrideImport = `import Custom${componentName} from '@/components/overrides/${componentName}'`

  // Check if there's already an import from overrides for this component
  if (content.includes(overrideImport)) {
    return content
  }

  // Add the import after the last existing import line
  const lines = content.split('\n')
  let lastImportIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].match(/^} from /)) {
      lastImportIndex = i
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, overrideImport)
  }

  // Replace the component in the components map
  const updatedContent = lines.join('\n')

  // Replace `ComponentName: DefaultComponentName` with `ComponentName: CustomComponentName`
  return updatedContent.replace(
    new RegExp(`(${componentName}:\\s*)Default${componentName}`),
    `$1Custom${componentName}`,
  )
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

  // Generate the override component
  const componentContent = mode === 'full'
    ? generateFullComponent(componentName, meta)
    : generateWrapComponent(componentName, meta)

  // Write the override file
  await mkdir(join(targetDir, 'src/components/overrides'), { recursive: true })
  await writeFile(overridePath, componentContent)
  console.log(chalk.green('\n  ' + '✓') + ` Created src/components/overrides/${componentName}.tsx`)

  // Update dewey.tsx to wire in the override
  const deweyTsxPath = join(targetDir, 'src/lib/dewey.tsx')
  if (await fileExists(deweyTsxPath)) {
    const existing = await readFile(deweyTsxPath, 'utf-8')
    const updated = updateDeweyTsx(existing, componentName)
    await writeFile(deweyTsxPath, updated)
    console.log(chalk.green('  ✓') + ' Updated src/lib/dewey.tsx')
  } else {
    console.log(chalk.yellow('  ⚠') + ' Could not find src/lib/dewey.tsx — wire the override manually')
  }

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
