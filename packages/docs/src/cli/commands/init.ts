import chalk from 'chalk'
import { mkdir, writeFile, access } from 'fs/promises'
import { join } from 'path'
import type { ProjectType } from '../schema.js'
import { configExists } from '../config.js'

interface InitOptions {
  type: ProjectType
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

# Overview

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

# Quickstart

Get up and running with **{{PROJECT_NAME}}** in under 5 minutes.

## Prerequisites

List any requirements:

- Node.js >= 18
- pnpm (recommended)

## Installation

\`\`\`bash
# Install via pnpm
pnpm add {{PROJECT_NAME}}

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

# API Reference

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

# Configuration

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

# Troubleshooting

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
}

const CONFIG_TEMPLATE = `/** @type {import('@dewey/cli').DeweyConfig} */
export default {
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

    // Which doc sections to include in AGENTS.md
    sections: ['overview', 'quickstart', 'api'],
  },

  docs: {
    path: './docs',
    output: './',
    required: ['overview', 'quickstart'],
  },

  // install.md configuration (installmd.org standard)
  // Generates LLM-executable installation instructions
  install: {
    // What gets installed
    objective: 'Install and configure {{PROJECT_NAME}}.',

    // How to verify successful installation
    doneWhen: {
      command: '{{PROJECT_NAME}} --version',
      expectedOutput: 'version number',
    },

    // Requirements before installation
    prerequisites: [
      // 'Node.js >= 18',
      // 'pnpm (recommended)',
    ],

    // Installation steps (rendered as TODO checklist)
    steps: [
      // { description: 'Install the package', command: 'pnpm add {{PROJECT_NAME}}' },
      // { description: 'Verify installation', command: '{{PROJECT_NAME}} --version' },
    ],
  },
}
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

  // Create doc templates
  const required = ['overview', 'quickstart']
  for (const docName of required) {
    const template = DOC_TEMPLATES[docName]
    if (!template) continue

    const filePath = join(docsPath, `${docName}.md`)
    if (await fileExists(filePath) && !options.force) {
      console.log(chalk.gray(`  Skipped ${docName}.md (already exists)`))
      continue
    }

    const content = template.content
      .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
      .replace(/\{\{PROJECT_TAGLINE\}\}/g, projectTagline)

    await writeFile(filePath, content)
    console.log(chalk.green('✓') + ` Created docs/${docName}.md`)
  }

  // Create config file
  const configContent = CONFIG_TEMPLATE
    .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
    .replace(/\{\{PROJECT_TAGLINE\}\}/g, projectTagline)
    .replace(/\{\{PROJECT_TYPE\}\}/g, options.type)

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
