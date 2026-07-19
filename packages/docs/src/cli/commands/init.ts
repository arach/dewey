import chalk from 'chalk'
import { mkdir, writeFile, access } from 'fs/promises'
import { join } from 'path'
import { parseProjectType, type ProjectType } from '../schema.js'
import { PROJECT_TYPE_PROFILES } from '../project-types.js'
import { configExists } from '../config.js'

interface InitOptions {
  type: ProjectType | string
  force?: boolean
}

const DOC_TEMPLATES: Record<string, { title: string; content: string }> = {
  overview: {
    title: 'Overview',
    content: `---
title: Overview
description: Introduction to the project
order: 1
---

Welcome to **{{PROJECT_NAME}}**.

{{PROJECT_TAGLINE}}

## What is {{PROJECT_NAME}}?

Describe what your project does and why it exists.

## Key Features

- Feature 1
- Feature 2
- Feature 3

## Quick Links

- [Quickstart](./quickstart.md) - Get started in 5 minutes
- [Configuration](./configuration.md) - Setup options
- [API Reference](./api.md) - Full API documentation
`,
  },
  quickstart: {
    title: 'Quickstart',
    content: `---
title: Quickstart
description: Get started in 5 minutes
order: 2
---

Get up and running with **{{PROJECT_NAME}}** in under 5 minutes.

## Prerequisites

List any requirements:

- Node.js >= 18
- Bun (recommended)

## Installation

\`\`\`bash
# Install via Bun
bun add {{PROJECT_NAME}}

# Or npm
npm install {{PROJECT_NAME}}
\`\`\`

## Basic Usage

\`\`\`typescript
// Example code
import { something } from '{{PROJECT_NAME}}'

// Use it
something()
\`\`\`

## Next Steps

- Read the [Configuration](./configuration.md) guide
- Explore the [API Reference](./api.md)
`,
  },
  api: {
    title: 'API Reference',
    content: `---
title: API Reference
description: Full API documentation
order: 3
---

Complete API documentation for **{{PROJECT_NAME}}**.

## Functions

### \`functionName()\`

Description of what this function does.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| \`param1\` | \`string\` | Description |
| \`param2\` | \`number\` | Description |

**Returns:** \`ReturnType\`

**Example:**

\`\`\`typescript
const result = functionName('hello', 42)
\`\`\`

## Types

### \`TypeName\`

\`\`\`typescript
interface TypeName {
  property: string
  optional?: number
}
\`\`\`
`,
  },
  configuration: {
    title: 'Configuration',
    content: `---
title: Configuration
description: Setup and configuration options
order: 4
---

Configure **{{PROJECT_NAME}}** to fit your needs.

## Configuration File

Create a configuration file in your project root:

\`\`\`typescript
// config.ts
export default {
  option1: 'value',
  option2: true,
}
\`\`\`

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`option1\` | \`string\` | \`'default'\` | Description |
| \`option2\` | \`boolean\` | \`false\` | Description |

## Environment Variables

| Variable | Description |
|----------|-------------|
| \`ENV_VAR\` | Description |
`,
  },
  troubleshooting: {
    title: 'Troubleshooting',
    content: `---
title: Troubleshooting
description: Common issues and solutions
order: 5
---

Solutions to common issues with **{{PROJECT_NAME}}**.

## Common Issues

### Issue 1: Description

**Symptoms:** What the user sees

**Cause:** Why it happens

**Solution:**

\`\`\`bash
# Fix command
\`\`\`

### Issue 2: Description

**Symptoms:** What the user sees

**Solution:** How to fix it

## Getting Help

- [GitHub Issues](https://github.com/username/repo/issues)
- [Discord Community](https://discord.gg/...)
`,
  },
  architecture: {
    title: 'Architecture',
    content: `---
title: Architecture
description: System structure, boundaries, and dependencies
order: 3
---

Explain how **{{PROJECT_NAME}}** is organized and where its important boundaries live.

## Components

Describe the main components, what each one owns, and the direction of dependencies between them.

## System boundaries

List external integrations, persistence boundaries, background processes, and any contracts that must remain stable.

## Project structure

\`\`\`text
src/
  index.ts       # Public entry point
  core/          # Domain logic
  integrations/  # External boundaries
\`\`\`

## Change guidance

Document which component should change for each common task, how to verify the change, and which boundaries agents must not cross without explicit approval.
`,
  },
  commands: {
    title: 'Command reference',
    content: `---
title: Command reference
description: Commands, arguments, flags, and exit behavior
order: 3
---

Document every public **{{PROJECT_NAME}}** command, its arguments, flags, output, and exit behavior.

## Usage

\`\`\`bash
{{PROJECT_NAME}} --help
{{PROJECT_NAME}} run --input ./example.json
\`\`\`

## Commands and options

| Command | Arguments | Options | Purpose |
|---|---|---|---|
| \`run\` | \`--input <path>\` | \`--format <value>\` | Run the primary operation |

## Exit codes

| Code | Meaning | Recovery |
|---|---|---|
| \`0\` | Success | No action required |
| \`1\` | Invalid input or runtime failure | Correct the reported error and retry |

Include one realistic failure example and state whether stdout or stderr carries machine-readable output.
`,
  },
  components: {
    title: 'Component reference',
    content: `---
title: Component reference
description: React components, props, and rendering contracts
order: 3
---

Document the public React components and props exported by **{{PROJECT_NAME}}**.

## Primary component

\`\`\`tsx
import { Widget } from '{{PROJECT_NAME}}'

export function Example() {
  return <Widget variant="default">Content</Widget>
}
\`\`\`

## Props

\`\`\`typescript
export type WidgetVariant = 'default' | 'accent'

export interface WidgetProps {
  variant?: WidgetVariant
  children: React.ReactNode
}
\`\`\`

State defaults, controlled and uncontrolled behavior, client-boundary requirements, accessibility behavior, and the semantic tokens a host application may override.
`,
  },
  packages: {
    title: 'Packages and workspaces',
    content: `---
title: Packages and workspaces
description: Monorepo package ownership, dependencies, and shared commands
order: 3
---

Explain how the **{{PROJECT_NAME}}** monorepo is divided into workspaces and which package owns each contract.

## Workspace map

| Path | Purpose | Public entry point |
|---|---|---|
| \`packages/<package>/\` | Shared domain logic | Replace with the real public entry point |
| \`apps/<app>/\` | Application | Replace with the real application entry point |

## Dependency direction

Document which workspaces may depend on one another, where shared types live, and which package commands verify cross-package changes.

## Common commands

\`\`\`bash
bun install
bun run build
bun test
\`\`\`

Include package-level ownership and release boundaries so agents can choose the smallest correct workspace for a change.
`,
  },
}

const TYPE_SPECIFIC_ARCHITECTURE: Partial<Record<ProjectType, string>> = {
  'macos-app': `---
title: Architecture
description: macOS app lifecycle, SwiftUI boundaries, and Xcode build guidance
order: 3
---

Document the macOS lifecycle and ownership boundaries for **{{PROJECT_NAME}}**.

## App lifecycle

Explain the SwiftUI \`App\` entry point, scenes, windows, background work, persistence, and any AppKit integration.

## Source structure

\`\`\`text
Sources/
  App/            # SwiftUI app lifecycle
  Features/       # User-facing features
  Services/       # Persistence and external integrations
\`\`\`

## Build and verification

\`\`\`bash
xcodebuild -scheme {{PROJECT_NAME}} build
\`\`\`

Record the supported macOS version, required entitlements, signing assumptions, and test schemes. Include any main-actor or concurrency rules an agent must preserve when changing Swift code.
`,
}

const AGENT_DOC_TEMPLATES: Record<string, string> = {
  overview: `# {{PROJECT_NAME}} overview

| Field | Value |
|---|---|
| Project | {{PROJECT_NAME}} |
| Type | {{PROJECT_TYPE}} |
| Purpose | {{PROJECT_TAGLINE}} |

## Agent contract

- Treat the human overview as the narrative source and keep this page synchronized with factual changes.
- Record concrete capabilities, non-goals, users, and stable terminology.
- Replace placeholder content before using this file as retrieval context.
`,
  quickstart: `# {{PROJECT_NAME}} quickstart

| Requirement | Value |
|---|---|
| Project type | {{PROJECT_TYPE}} |
| Package/runtime | Replace with the tested requirement |
| Success check | Replace with the command and expected result |

## Execution sequence

1. Install the project using the command in the human quickstart.
2. Run the smallest complete example.
3. Verify the documented success condition.
4. Preserve exact commands, valid values, and failure recovery here when the human guide changes.
`,
  architecture: `# {{PROJECT_NAME}} architecture

| Concern | Source of truth |
|---|---|
| Components | Human architecture page and real source tree |
| Boundaries | Dependency direction and external integrations |
| Verification | Project-specific build and test commands |

## Agent rules

- Identify the owning component before editing.
- Preserve documented dependency direction and platform constraints.
- Keep source paths, lifecycle facts, and verification commands synchronized with code.
`,
  api: `# {{PROJECT_NAME}} API contract

| Concern | Requirement |
|---|---|
| Installation | Preserve the tested package-manager command |
| Exports | Match the package public entry point |
| Types | Copy exact names, signatures, defaults, and valid values from source |
| Errors | State thrown/rejected conditions and recovery |

## Drift rule

Every public contract change requires the source export, human API page, and this agent page to be updated together.
`,
  commands: `# {{PROJECT_NAME}} CLI contract

| Concern | Requirement |
|---|---|
| Commands | Exact executable and subcommand names |
| Inputs | Arguments, flags, defaults, environment variables |
| Outputs | stdout/stderr format and exit codes |
| Verification | Runnable shell invocation |

## Drift rule

Keep command names and options aligned with the CLI parser. Never invent aliases or flags that source does not accept.
`,
  components: `# {{PROJECT_NAME}} component contract

| Concern | Requirement |
|---|---|
| Components | Exact public export names |
| Props | Types, defaults, valid values, and callback signatures |
| Runtime | Server/client boundary and peer requirements |
| Accessibility | Keyboard and semantic behavior |

## Drift rule

Keep component props and string-union values synchronized with the TypeScript source and human component reference.

\`\`\`typescript
export type WidgetVariant = 'default' | 'accent'
\`\`\`
`,
  packages: `# {{PROJECT_NAME}} workspace contract

| Concern | Requirement |
|---|---|
| Workspaces | Exact \`packages/\` and \`apps/\` paths |
| Ownership | Package responsibility and public entry point |
| Dependencies | Allowed dependency direction |
| Verification | Root and package-scoped commands |

## Drift rule

Update this map whenever a workspace is added, renamed, moved, or changes ownership.
`,
}

const CONFIG_TEMPLATE = `import { defineConfig } from '@arach/dewey'

export default defineConfig({
  project: {
    name: '{{PROJECT_NAME}}',
    tagline: '{{PROJECT_TAGLINE}}',
    type: '{{PROJECT_TYPE}}',
  },

  agent: {
    // Critical context that AI agents MUST know
    criticalContext: [
      // Add project-specific rules here
      // 'NEVER do X when Y',
      // 'Always check Z before modifying W',
    ],

    // Key entry points for navigating the codebase
    entryPoints: {
      // 'main': 'src/',
      // 'config': 'config/',
    },

    // Pattern-based navigation hints
    rules: [
      // { pattern: 'database', instruction: 'Check src/db/ for database code' },
    ],

    // Optional allowlist of doc IDs. Leave empty to include every doc.
    sections: [],
  },

  docs: {
    path: './docs',
    output: './',
    required: {{REQUIRED_DOCS}},
  },

  // install.md configuration (installmd.org standard)
  // Generates LLM-executable installation instructions
  install: {
    // What gets installed
    objective: 'Install and configure {{PROJECT_NAME}}.',

    // How to verify successful installation
    doneWhen: {
      command: '{{VERIFY_COMMAND}}',
      expectedOutput: '{{VERIFY_OUTPUT}}',
    },

    // Requirements before installation
    prerequisites: [
      // 'Node.js >= 18',
      // 'Bun (recommended)',
    ],

    // Installation steps (rendered as TODO checklist)
    steps: [
      { description: 'Prepare the project', command: '{{INSTALL_COMMAND}}' },
      { description: 'Verify the installation', command: '{{VERIFY_COMMAND}}' },
    ],
  },
})
`

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function initCommand(options: InitOptions) {
  const cwd = process.cwd()
  const docsPath = join(cwd, 'docs')
  const configPath = join(cwd, 'dewey.config.ts')
  const projectType = parseProjectType(options.type)
  const profile = PROJECT_TYPE_PROFILES[projectType]

  console.log(chalk.blue('\n📚 Initializing Dewey documentation...\n'))

  // Check if config already exists
  if (await configExists(cwd)) {
    if (!options.force) {
      console.log(chalk.yellow('⚠️  dewey.config.ts already exists. Use --force to overwrite.\n'))
      return
    }
  }

  // Detect project name from package.json
  let projectName = 'MyProject'
  let projectTagline = 'A great project'
  try {
    const pkgPath = join(cwd, 'package.json')
    if (await fileExists(pkgPath)) {
      const pkg = JSON.parse(await (await import('fs/promises')).readFile(pkgPath, 'utf-8'))
      projectName = pkg.name?.replace(/^@[^/]+\//, '') || projectName
      projectTagline = pkg.description || projectTagline
    }
  } catch {
    // Ignore
  }

  // Create docs directory
  await mkdir(docsPath, { recursive: true })
  console.log(chalk.green('✓') + ' Created docs/ directory')

  // Create a type-specific human + agent documentation scaffold.
  const required = profile.requiredDocuments
  await mkdir(join(docsPath, 'agent'), { recursive: true })
  for (const docName of required) {
    const template = DOC_TEMPLATES[docName]
    if (!template) continue

    const filePath = join(docsPath, `${docName}.md`)
    const shouldWriteHumanDoc = options.force || !await fileExists(filePath)
    if (!shouldWriteHumanDoc) {
      console.log(chalk.gray(`  Skipped ${docName}.md (already exists)`))
    } else {
      const selectedTemplate = docName === 'architecture'
        ? TYPE_SPECIFIC_ARCHITECTURE[projectType] ?? template.content
        : template.content
      const content = selectedTemplate
        .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
        .replace(/\{\{PROJECT_TAGLINE\}\}/g, projectTagline)

      await writeFile(filePath, content)
      console.log(chalk.green('✓') + ` Created docs/${docName}.md`)
    }

    const agentTemplate = AGENT_DOC_TEMPLATES[docName]
    if (agentTemplate) {
      const agentPath = join(docsPath, 'agent', `${docName}.agent.md`)
      if (await fileExists(agentPath) && !options.force) {
        console.log(chalk.gray(`  Skipped agent/${docName}.agent.md (already exists)`))
      } else {
        const agentContent = agentTemplate
          .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
          .replace(/\{\{PROJECT_TAGLINE\}\}/g, projectTagline)
          .replace(/\{\{PROJECT_TYPE\}\}/g, projectType)
        await writeFile(agentPath, agentContent)
        console.log(chalk.green('✓') + ` Created docs/agent/${docName}.agent.md`)
      }
    }
  }

  const installDefaults: Record<ProjectType, { install: string; verify: string; expected: string }> = {
    generic: { install: 'bun install', verify: 'bun test', expected: 'all tests pass' },
    'npm-package': { install: `bun add ${projectName}`, verify: 'bun test', expected: 'all tests pass' },
    'cli-tool': { install: `bun add -g ${projectName}`, verify: `${projectName} --version`, expected: 'version number' },
    'react-library': { install: `bun add ${projectName}`, verify: 'bun test', expected: 'all tests pass' },
    'macos-app': { install: 'swift package resolve', verify: `xcodebuild -scheme ${projectName} build`, expected: '** BUILD SUCCEEDED **' },
    monorepo: { install: 'bun install', verify: 'bun run build', expected: 'all workspaces build successfully' },
  }
  const install = installDefaults[projectType]

  // Create config file
  const configContent = CONFIG_TEMPLATE
    .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
    .replace(/\{\{PROJECT_TAGLINE\}\}/g, projectTagline)
    .replace(/\{\{PROJECT_TYPE\}\}/g, projectType)
    .replace(/\{\{REQUIRED_DOCS\}\}/g, JSON.stringify(required))
    .replace(/\{\{INSTALL_COMMAND\}\}/g, install.install)
    .replace(/\{\{VERIFY_COMMAND\}\}/g, install.verify)
    .replace(/\{\{VERIFY_OUTPUT\}\}/g, install.expected)

  await writeFile(configPath, configContent)
  console.log(chalk.green('✓') + ' Created dewey.config.ts')

  console.log(chalk.blue('\n✨ Dewey initialized!\n'))
  console.log('Next steps:')
  console.log(chalk.gray('  1. Edit dewey.config.ts with your project-specific context'))
  console.log(chalk.gray('  2. Write your documentation in docs/'))
  console.log(chalk.gray('  3. Run') + chalk.cyan(' dewey audit ') + chalk.gray('to check completeness'))
  console.log(chalk.gray('  4. Run') + chalk.cyan(' dewey generate ') + chalk.gray('to create agent files'))
  console.log()
  console.log(chalk.gray('Generated files include:'))
  console.log(chalk.gray('  - AGENTS.md    Context for AI agents'))
  console.log(chalk.gray('  - llms.txt     General software context'))
  console.log(chalk.gray('  - docs.json    Structured documentation'))
  console.log(chalk.gray('  - install.md   LLM-executable installation (installmd.org)'))
  console.log()
}
