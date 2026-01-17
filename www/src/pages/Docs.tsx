import { Routes, Route, useParams, Link } from 'react-router-dom'
import { BookOpen, Terminal, Settings, Puzzle, Bot, Sparkles, FileText, ArrowRight, Library } from 'lucide-react'
import { DocsLayout, MarkdownContent, type NavGroup } from '../components/docs'

// ============================================
// AgentContent - Structured agent documentation
// ============================================

interface AgentContent {
  id: string
  title: string
  purpose: string
  sections: AgentSection[]
  meta?: { package?: string }
}

type AgentSection =
  | { type: 'table'; heading: string; columns: string[]; rows: string[][] }
  | { type: 'enums'; heading: string; values: Record<string, string[]> }
  | { type: 'code'; heading: string; language: string; code: string }
  | { type: 'text'; heading: string; content: string }
  | { type: 'list'; heading: string; items: string[] }

class AgentContentBuilder {
  private content: AgentContent

  constructor(id: string, title: string, purpose: string) {
    this.content = { id, title, purpose, sections: [] }
  }

  meta(meta: AgentContent['meta']) {
    this.content.meta = meta
    return this
  }

  table(heading: string, columns: string[], rows: string[][]) {
    this.content.sections.push({ type: 'table', heading, columns, rows })
    return this
  }

  enums(heading: string, values: Record<string, string[]>) {
    this.content.sections.push({ type: 'enums', heading, values })
    return this
  }

  code(heading: string, language: string, code: string) {
    this.content.sections.push({ type: 'code', heading, language, code })
    return this
  }

  text(heading: string, content: string) {
    this.content.sections.push({ type: 'text', heading, content })
    return this
  }

  list(heading: string, items: string[]) {
    this.content.sections.push({ type: 'list', heading, items })
    return this
  }

  build(): AgentContent {
    return this.content
  }
}

function agentContent(id: string, title: string, purpose: string) {
  return new AgentContentBuilder(id, title, purpose)
}

function renderAgentMarkdown(content: AgentContent): string {
  const lines: string[] = []
  lines.push(`# ${content.title} - Agent Context`)
  lines.push('')
  if (content.meta?.package) {
    lines.push(`## Package`)
    lines.push(content.meta.package)
    lines.push('')
  }
  lines.push(`## Purpose`)
  lines.push(content.purpose)
  lines.push('')

  for (const section of content.sections) {
    lines.push(`## ${section.heading}`)
    switch (section.type) {
      case 'table':
        lines.push(`| ${section.columns.join(' | ')} |`)
        lines.push(`|${section.columns.map(() => '---').join('|')}|`)
        for (const row of section.rows) {
          lines.push(`| ${row.join(' | ')} |`)
        }
        break
      case 'enums':
        for (const [name, values] of Object.entries(section.values)) {
          lines.push(`${name}: ${values.map(v => `'${v}'`).join(' | ')}`)
        }
        break
      case 'code':
        lines.push('```' + section.language)
        lines.push(section.code)
        lines.push('```')
        break
      case 'text':
        lines.push(section.content)
        break
      case 'list':
        for (const item of section.items) {
          lines.push(`- ${item}`)
        }
        break
    }
    lines.push('')
  }
  return lines.join('\n')
}

const navigation: NavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { id: 'overview', title: 'Overview', icon: BookOpen, description: 'Introduction to Dewey' },
      { id: 'quickstart', title: 'Quickstart', icon: Terminal, description: 'Get up and running' },
    ]
  },
  {
    title: 'Guides',
    items: [
      { id: 'configuration', title: 'Configuration', icon: Settings, description: 'Setup options' },
      { id: 'components', title: 'Components', icon: Puzzle, description: 'Available components' },
    ]
  },
  {
    title: 'Agent Features',
    items: [
      { id: 'agents', title: 'Agents', icon: Bot, description: 'Agent-ready documentation' },
      { id: 'skills', title: 'Skills', icon: Sparkles, description: 'LLM prompt templates' },
    ]
  }
]

const overviewContent = `## What is Dewey?

Dewey is a documentation toolkit for React projects. Named after Melvil Dewey, creator of the Dewey Decimal Classification system, it helps you build beautiful docs and generate agent-ready files.

### One Package

**@arach/dewey** provides everything you need:

**CLI tools:**
- \`dewey init\` - Scaffold docs structure
- \`dewey audit\` - Validate completeness
- \`dewey generate\` - Create AGENTS.md, llms.txt, docs.json, install.md
- \`dewey agent\` - Score agent-readiness and get recommendations

**React components (22 total):**
- Layout: DocsLayout, Header, Sidebar, TableOfContents
- Content: MarkdownContent, CodeBlock, Callout, Tabs, Steps
- Agent: PromptSlideout, AgentContext, CopyButtons
- UI: Card, Badge, FileTree, ApiTable

**Skills for AI agents:**
- \`docsReviewAgent\` - Review docs quality, catch drift from codebase
- \`promptSlideoutGenerator\` - Generate AI-consumable prompts
- \`installMdGenerator\` - Create LLM-executable install instructions

### Why Dewey?

1. **Agent-ready** - Generate AGENTS.md, llms.txt, and install.md for AI assistants
2. **Skills system** - Prompts that guide LLMs to review and improve docs
3. **Validation** - Audit docs completeness with scoring
4. **22 components** - Full React component library for docs sites
5. **Theming** - 8 color presets with dark mode support

## Quick Example

\`\`\`tsx
import { DeweyProvider, DocsLayout, MarkdownContent } from '@arach/dewey'

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { id: 'overview', title: 'Overview' },
      { id: 'quickstart', title: 'Quickstart' },
    ]
  }
]

export function DocsPage() {
  return (
    <DeweyProvider theme="ocean">
      <DocsLayout
        title="Overview"
        navigation={navigation}
        projectName="MyProject"
      >
        <MarkdownContent content={markdownContent} />
      </DocsLayout>
    </DeweyProvider>
  )
}
\`\`\`
`

const quickstartContent = `## Prerequisites

- Node.js >= 18
- pnpm (recommended), npm, or yarn

## Installation

\`\`\`bash
# Using pnpm (recommended)
pnpm add @arach/dewey

# Using npm
npm install @arach/dewey
\`\`\`

## Initialize Your Project

\`\`\`bash
pnpm dewey init
\`\`\`

This creates:
- \`docs/\` folder with template markdown files
- \`dewey.config.ts\` configuration file

## Configure

Edit \`dewey.config.ts\` with your project context:

\`\`\`typescript
export default {
  project: {
    name: 'MyProject',
    tagline: 'A great project',
    type: 'npm-package', // or 'cli-tool', 'macos-app', etc.
  },

  agent: {
    criticalContext: [
      'NEVER do X when Y',
      'Always check Z before modifying W',
    ],
    sections: ['overview', 'quickstart', 'api'],
  },

  docs: {
    path: './docs',
    output: './',
  },

  // LLM-executable installation (installmd.org)
  install: {
    objective: 'Install and configure MyProject.',
    doneWhen: {
      command: 'myproject --version',
      expectedOutput: 'version number',
    },
  },
}
\`\`\`

## Write Documentation

Edit the markdown files in \`docs/\`:

- \`overview.md\` - What is your project?
- \`quickstart.md\` - Get started in 5 minutes
- \`api.md\` - API reference
- \`configuration.md\` - Config options

## Audit

Check documentation completeness:

\`\`\`bash
pnpm dewey audit
\`\`\`

## Check Agent-Readiness

Score your project's agent-friendliness:

\`\`\`bash
pnpm dewey agent
\`\`\`

This checks:
- Project context (25 pts)
- Agent-optimized files (30 pts)
- Human-to-agent handoff (25 pts)
- Content quality (20 pts)

## Generate Agent Files

\`\`\`bash
pnpm dewey generate
\`\`\`

This creates:
- \`AGENTS.md\` - Combined docs with critical context
- \`llms.txt\` - Plain text for LLMs
- \`docs.json\` - Structured JSON
- \`install.md\` - LLM-executable installation ([installmd.org](https://installmd.org))

The install.md can be piped directly to an LLM:
\`\`\`bash
curl -fsSL yourdocs.com/install.md | claude
\`\`\`

## Use Components

\`\`\`tsx
import { DeweyProvider, DocsLayout, MarkdownContent } from '@arach/dewey'

export function DocPage({ content }) {
  return (
    <DeweyProvider theme="ocean">
      <DocsLayout
        title="My Page"
        navigation={navigation}
        projectName="MyProject"
      >
        <MarkdownContent content={content} />
      </DocsLayout>
    </DeweyProvider>
  )
}
\`\`\`
`

const configurationContent = `## dewey.config.ts

The configuration file defines your project context:

\`\`\`typescript
export default {
  project: { ... },
  agent: { ... },
  docs: { ... },
  install: { ... },  // NEW: install.md generation
}
\`\`\`

## Project Config

| Option | Type | Values |
|--------|------|--------|
| \`name\` | \`string\` | Project name |
| \`tagline\` | \`string\` | Short description |
| \`type\` | \`ProjectType\` | \`'npm-package'\` \| \`'cli-tool'\` \| \`'macos-app'\` \| \`'react-library'\` \| \`'monorepo'\` \| \`'generic'\` |
| \`version\` | \`string\` | Semantic version |

## Agent Config

Configure how AGENTS.md is generated:

### criticalContext

Rules that AI agents MUST know:

\`\`\`typescript
criticalContext: [
  'NEVER kill running processes - user may be mid-task',
  'Use ProjectLogger, NEVER use console.log directly',
]
\`\`\`

### entryPoints

Key directories for navigation:

\`\`\`typescript
entryPoints: {
  'main-app': 'src/',
  'api': 'src/api/',
}
\`\`\`

### rules

Pattern-based navigation hints:

\`\`\`typescript
rules: [
  { pattern: 'database', instruction: 'Check src/db/' },
  { pattern: 'auth', instruction: 'Auth logic in src/auth/' },
]
\`\`\`

### sections

Which doc sections to include in AGENTS.md:

\`\`\`typescript
sections: ['overview', 'architecture', 'api']
\`\`\`

## Docs Config

| Option | Type | Default |
|--------|------|---------|
| \`path\` | \`string\` | \`'./docs'\` |
| \`output\` | \`string\` | \`'./'\` |
| \`required\` | \`string[]\` | \`['overview', 'quickstart']\` |

## Install Config

Configure install.md generation ([installmd.org](https://installmd.org) standard):

\`\`\`typescript
install: {
  // What gets installed
  objective: 'Install and configure MyProject.',

  // Verification command
  doneWhen: {
    command: 'myproject --version',
    expectedOutput: 'version number',
  },

  // Prerequisites
  prerequisites: [
    'Node.js >= 18',
    'pnpm (recommended)',
  ],

  // Installation steps
  steps: [
    {
      description: 'Install the package',
      command: 'pnpm add myproject',
      alternatives: [
        { condition: 'npm', command: 'npm install myproject' },
      ],
    },
  ],

  // URL for piping support
  hostedUrl: 'https://myproject.dev/install.md',
}
\`\`\`

The generated install.md follows the installmd.org standard:
- LLM-executable installation instructions
- Environment-adaptive (detects package manager, OS)
- Can be piped directly to Claude: \`curl url | claude\`
`

const agentsContent = `## Agent-Ready Documentation

Dewey generates documentation optimized for AI agents. These files help LLMs understand your project context and work effectively with your codebase.

### Generated Files

| File | Purpose | Format |
|------|---------|--------|
| \`AGENTS.md\` | Combined docs with critical context and rules | Markdown |
| \`llms.txt\` | Plain text summary for LLM context windows | Plain text |
| \`docs.json\` | Structured data for programmatic access | JSON |
| \`install.md\` | LLM-executable installation ([installmd.org](https://installmd.org)) | Markdown |

### AGENTS.md Structure

The AGENTS.md file combines your documentation into an agent-optimized format:

\`\`\`markdown
# Project Name

## Critical Context
<!-- Rules AI agents MUST follow -->
- NEVER do X when Y
- Always check Z before W

## Entry Points
<!-- Where to start looking -->
main-app: src/
api: src/api/

## Architecture
<!-- How the system works -->

## API Reference
<!-- Core interfaces and functions -->
\`\`\`

### install.md Standard

The [installmd.org](https://installmd.org) standard defines LLM-executable installation instructions:

\`\`\`bash
# Pipe directly to an LLM
curl -fsSL myproject.dev/install.md | claude
\`\`\`

Features:
- **Objective** - Clear success criteria
- **Prerequisites** - What's needed first
- **Steps** - Sequential installation commands
- **Alternatives** - Environment-adaptive (npm vs pnpm, etc.)
- **Verification** - Command to confirm success

### Agent Scoring

Run \`dewey agent\` to score your project's agent-readiness:

| Category | Points | What's Measured |
|----------|--------|-----------------|
| Project Context | 25 | Name, tagline, type, version |
| Agent-Optimized Files | 30 | AGENTS.md, llms.txt, install.md |
| Human-to-Agent Handoff | 25 | Critical context, entry points, rules |
| Content Quality | 20 | Completeness, accuracy |

**Score thresholds:**
- 0-49: Needs work
- 50-74: Good
- 75-100: Excellent

### Configuration

Configure agent files in \`dewey.config.ts\`:

\`\`\`typescript
export default {
  agent: {
    // Rules AI agents MUST follow
    criticalContext: [
      'NEVER modify database schemas without backup',
      'Use ProjectLogger, not console.log',
    ],

    // Where agents should look first
    entryPoints: {
      'main-app': 'src/',
      'api': 'src/api/',
    },

    // Pattern-based hints
    rules: [
      { pattern: 'database', instruction: 'Check src/db/' },
    ],

    // Which sections to include
    sections: ['overview', 'architecture', 'api'],
  }
}
\`\`\`
`

const skillsContent = `## Skills System

Dewey includes **skills** - LLM prompt templates that guide AI agents through specific tasks. Unlike deterministic code, skills leverage LLM reasoning to handle ambiguous situations.

### What is a Skill?

A skill is a structured prompt that:
1. Defines an objective for the LLM
2. Provides context and constraints
3. Specifies expected output format
4. Handles edge cases through natural language

### Available Skills

#### docsReviewAgent

Reviews documentation quality and catches drift from your codebase.

**Prompts:**
- \`review\` - Score docs on 5 criteria (completeness, accuracy, agent-readiness, structure, freshness)
- \`generateSummary\` - Create initial review summary
- \`updateSummary\` - Update summary with new run results
- \`fixFromReview\` - Fix issues identified in review
- \`iterateCycle\` - Run complete review/fix cycle

**Usage:**
\`\`\`typescript
import { docsReviewAgent } from '@arach/dewey'

// Get the review prompt
const prompt = docsReviewAgent.prompts.review
// Score: 25 points total (5 criteria × 5 points each)
// PASS >= 18, NEEDS_WORK < 18
\`\`\`

#### promptSlideoutGenerator

Generates configuration for the PromptSlideout component.

**Prompts:**
- \`generate\` - Create prompt config from API/component docs
- \`review\` - Validate existing prompt config
- \`improve\` - Enhance prompt based on usage patterns

**Usage:**
\`\`\`typescript
import { promptSlideoutGenerator } from '@arach/dewey'

const prompt = promptSlideoutGenerator.prompts.generate
// Feed API docs to LLM with this prompt
// Get back PromptSlideoutConfig
\`\`\`

#### installMdGenerator

Creates LLM-executable installation instructions following [installmd.org](https://installmd.org).

**Prompts:**
- \`generate\` - Create install.md from project context
- \`review\` - Validate against installmd.org standard
- \`improve\` - Enhance based on common issues
- \`fromQuickstart\` - Convert quickstart.md to install.md

**Project Type Templates:**
- \`npm-package\` - Node.js packages
- \`cli-tool\` - Command-line tools
- \`macos-app\` - macOS applications
- \`react-library\` - React component libraries

**Usage:**
\`\`\`typescript
import { installMdGenerator } from '@arach/dewey'

// Get template for project type
const template = installMdGenerator.templates['npm-package']

// Generate install.md
const prompt = installMdGenerator.prompts.generate
\`\`\`

### Creating Custom Skills

Skills are TypeScript objects with this structure:

\`\`\`typescript
interface Skill {
  name: string
  description: string
  prompts: Record<string, string>
  templates?: Record<string, string>
}

const mySkill = {
  name: 'mySkill',
  description: 'Does something useful',
  prompts: {
    generate: \`You are an expert at X.

Given: {context}
Task: Generate Y.

Output format:
- Item 1
- Item 2
\`,
  },
}
\`\`\`

### Skills vs Code

| Aspect | Skills (Prompts) | Code (Functions) |
|--------|------------------|------------------|
| Execution | LLM interprets | CPU executes |
| Ambiguity | Handles well | Needs explicit handling |
| Output | Variable but intelligent | Deterministic |
| Updates | Edit prompt text | Change code logic |
| Validation | Review output | Unit tests |

Skills shine when:
- Tasks require judgment (e.g., "is this doc accurate?")
- Output format is flexible
- Context is ambiguous
- Human review is acceptable
`

const componentsContent = `Dewey exports 22 React components organized by purpose.

## Entry Points

### DocsApp

Complete documentation site with routing, theming, and navigation.

\`\`\`tsx
import { DocsApp } from '@arach/dewey'

<DocsApp
  config={{
    projectName: 'MyProject',
    basePath: '/docs',
    pages: pageTree,
  }}
/>
\`\`\`

### DocsIndex

Card-based landing page for documentation.

\`\`\`tsx
import { DocsIndex } from '@arach/dewey'

<DocsIndex
  title="Documentation"
  description="Get started with MyProject"
  sections={navigationGroups}
/>
\`\`\`

---

## Layout Components

### DocsLayout

The main layout with sidebar, TOC, and navigation.

\`\`\`tsx
<DocsLayout
  title="Page Title"
  navigation={navigation}
  projectName="MyProject"
  basePath="/docs"
>
  <MarkdownContent content={content} />
</DocsLayout>
\`\`\`

| Prop | Type | Required | Default |
|------|------|----------|---------|
| \`title\` | \`string\` | Yes | - |
| \`navigation\` | \`NavGroup[]\` | Yes | - |
| \`projectName\` | \`string\` | Yes | - |
| \`description\` | \`string\` | No | - |
| \`basePath\` | \`string\` | No | \`'/docs'\` |

### Header

Sticky header with brand, back link, and theme toggle.

### Sidebar

Left navigation panel with collapsible groups.

### TableOfContents

Right-side minimap with scroll-spy highlighting.

---

## Content Components

### MarkdownContent

Renders markdown with syntax highlighting.

\`\`\`tsx
<MarkdownContent content={markdownString} />
\`\`\`

### CodeBlock

Standalone code block with copy button.

\`\`\`tsx
<CodeBlock className="language-typescript">
  {codeString}
</CodeBlock>
\`\`\`

---

## UI Components

### Callout

Alert boxes for notes, warnings, tips.

\`\`\`tsx
<Callout type="warning" title="Important">
  This is a warning message.
</Callout>
\`\`\`

| Prop | Type | Values |
|------|------|--------|
| \`type\` | \`CalloutType\` | \`'info'\` \| \`'warning'\` \| \`'tip'\` \| \`'danger'\` |
| \`title\` | \`string\` | Custom title (defaults based on type) |

### Badge

Status and version indicators.

\`\`\`tsx
<Badge variant="success">v2.0</Badge>
\`\`\`

| Prop | Type | Values |
|------|------|--------|
| \`variant\` | \`BadgeVariant\` | \`'default'\` \| \`'success'\` \| \`'warning'\` \| \`'danger'\` \| \`'info'\` \| \`'purple'\` |
| \`size\` | \`string\` | \`'sm'\` \| \`'md'\` |

### Tabs

Tabbed content switcher.

\`\`\`tsx
<Tabs>
  <Tab title="npm">npm install dewey</Tab>
  <Tab title="pnpm">pnpm add dewey</Tab>
</Tabs>
\`\`\`

### Steps

Numbered step-by-step instructions.

\`\`\`tsx
<Steps>
  <Step title="Install">Run the install command</Step>
  <Step title="Configure">Edit the config file</Step>
</Steps>
\`\`\`

### Card / CardGrid

Content cards and grid layouts.

\`\`\`tsx
<CardGrid>
  <Card title="Getting Started" href="/docs/quickstart" />
  <Card title="API Reference" href="/docs/api" />
</CardGrid>
\`\`\`

### FileTree

Directory structure visualizer.

\`\`\`tsx
<FileTree
  items={[
    { name: 'src', type: 'folder', children: [
      { name: 'index.ts', type: 'file' }
    ]}
  ]}
/>
\`\`\`

### ApiTable

Parameter and property documentation.

\`\`\`tsx
<ApiTable
  properties={[
    { name: 'title', type: 'string', required: true, description: 'Page title' }
  ]}
/>
\`\`\`

---

## Agent-Friendly Components

Components designed for AI assistant workflows.

### AgentContext

Collapsible block for agent-optimized content.

\`\`\`tsx
<AgentContext
  content="Structured context for AI..."
  title="Agent Context"
  defaultExpanded={false}
/>
\`\`\`

| Prop | Type | Default |
|------|------|---------|
| \`content\` | \`string\` | Required |
| \`title\` | \`string\` | \`'Agent Context'\` |
| \`defaultExpanded\` | \`boolean\` | \`false\` |

### PromptSlideout

Interactive panel for AI prompt editing with parameters.

\`\`\`tsx
<PromptSlideout
  title="Generate Component"
  description="Create a new React component"
  params={[
    { name: 'NAME', description: 'Component name', placeholder: 'Button' }
  ]}
  template="Create a component called {NAME}..."
/>
\`\`\`

### CopyButtons

"Copy for Agent" and "Copy Raw" buttons for documentation.

\`\`\`tsx
<CopyButtons markdown={rawContent} />
\`\`\`

---

## Provider

### DeweyProvider

Theme and component context provider.

\`\`\`tsx
import { DeweyProvider } from '@arach/dewey'

<DeweyProvider theme="ocean">
  <App />
</DeweyProvider>
\`\`\`

**Theme presets:** \`'neutral'\` | \`'ocean'\` | \`'emerald'\` | \`'purple'\` | \`'dusk'\` | \`'rose'\` | \`'github'\` | \`'warm'\`

---

## Types

\`\`\`typescript
// Navigation
interface NavGroup {
  title: string
  items: NavItem[]
}

interface NavItem {
  id: string
  title: string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
}

// Callout types
type CalloutType = 'info' | 'warning' | 'tip' | 'danger'

// Badge variants
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
\`\`\`
`

const allPages = navigation.flatMap(g => g.items)

function getNavigation(currentId: string) {
  const currentIndex = allPages.findIndex(p => p.id === currentId)
  return {
    prev: currentIndex > 0 ? allPages[currentIndex - 1] : undefined,
    next: currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : undefined,
  }
}

const content: Record<string, string> = {
  overview: overviewContent,
  quickstart: quickstartContent,
  configuration: configurationContent,
  components: componentsContent,
  agents: agentsContent,
  skills: skillsContent,
}

// Agent-optimized content using structured AgentContent
// Rendered to markdown for "Copy for Agent" button
const agentContentData = {
  overview: agentContent('dewey', 'dewey', 'Documentation toolkit that generates AI-agent-ready files and provides React components for docs sites.')
    .meta({ package: '@arach/dewey' })
    .table('CLI Commands', ['Command', 'Action'], [
      ['dewey init', 'Create docs/ + dewey.config.ts'],
      ['dewey audit', 'Validate completeness'],
      ['dewey generate', 'Create AGENTS.md, llms.txt, docs.json, install.md'],
      ['dewey agent', 'Score agent-readiness (0-100 pts)'],
    ])
    .table('Generated Files', ['File', 'Purpose'], [
      ['AGENTS.md', 'Combined docs with critical context'],
      ['llms.txt', 'Plain text for LLMs'],
      ['docs.json', 'Structured JSON'],
      ['install.md', 'LLM-executable installation (installmd.org)'],
    ])
    .table('Skills', ['Skill', 'Purpose'], [
      ['docsReviewAgent', 'Review quality, catch drift'],
      ['promptSlideoutGenerator', 'Generate prompt configs'],
      ['installMdGenerator', 'Create install.md'],
    ])
    .list('Components (22)', [
      'Entry: DocsApp, DocsIndex',
      'Layout: DocsLayout, Header, Sidebar, TableOfContents',
      'Content: MarkdownContent, CodeBlock, Callout, Tabs, Steps, Card, FileTree, ApiTable, Badge',
      'Agent: AgentContext, PromptSlideout, CopyButtons',
      'Provider: DeweyProvider',
    ])
    .enums('Valid Values', {
      ProjectType: ['npm-package', 'cli-tool', 'macos-app', 'react-library', 'monorepo', 'generic'],
      ThemePreset: ['neutral', 'ocean', 'emerald', 'purple', 'dusk', 'rose', 'github', 'warm'],
      CalloutType: ['info', 'warning', 'tip', 'danger'],
      BadgeVariant: ['default', 'success', 'warning', 'danger', 'info', 'purple'],
    })
    .build(),

  quickstart: agentContent('dewey-quickstart', 'dewey Quickstart', 'Get started with Dewey in 5 minutes.')
    .text('Installation', 'pnpm add @arach/dewey')
    .list('Setup', [
      'dewey init - creates docs/ folder and dewey.config.ts',
    ])
    .list('Workflow', [
      'dewey init - scaffold',
      'Edit docs/*.md',
      'dewey audit - validate',
      'dewey agent - score readiness',
      'dewey generate - create agent files',
    ])
    .code('Usage', 'tsx', `import { DeweyProvider, DocsLayout, MarkdownContent } from '@arach/dewey'

<DeweyProvider theme="ocean">
  <DocsLayout title="Page" navigation={nav} projectName="MyProject">
    <MarkdownContent content={md} />
  </DocsLayout>
</DeweyProvider>`)
    .build(),

  configuration: agentContent('dewey-config', 'dewey Configuration', 'Configure Dewey via dewey.config.ts.')
    .code('Schema', 'typescript', `{
  project: { name, tagline, type },
  agent: { criticalContext[], entryPoints{}, rules[], sections[] },
  docs: { path: './docs', output: './', required[] },
  install: { objective, doneWhen, prerequisites[], steps[] }
}`)
    .enums('Valid Values', {
      ProjectType: ['npm-package', 'cli-tool', 'macos-app', 'react-library', 'monorepo', 'generic'],
    })
    .build(),

  components: agentContent('dewey-components', 'dewey Components', '22 React components for documentation sites.')
    .table('Entry Points', ['Component', 'Purpose'], [
      ['DocsApp', 'Complete docs site with routing'],
      ['DocsIndex', 'Card-based landing page'],
    ])
    .table('Layout', ['Component', 'Purpose'], [
      ['DocsLayout', 'Main layout (sidebar, TOC, nav)'],
      ['Header', 'Sticky header with theme toggle'],
      ['Sidebar', 'Left navigation'],
      ['TableOfContents', 'Right minimap with scroll-spy'],
    ])
    .table('UI Components', ['Component', 'Key Props'], [
      ['Callout', "type: 'info' | 'warning' | 'tip' | 'danger'"],
      ['Badge', "variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'"],
      ['Tabs', 'children: Tab[]'],
      ['Steps', 'children: Step[]'],
      ['Card', 'title, href, icon'],
      ['FileTree', 'items: FileTreeItem[]'],
      ['ApiTable', 'properties: ApiProperty[]'],
    ])
    .table('Agent-Friendly', ['Component', 'Purpose'], [
      ['AgentContext', 'Collapsible agent content block'],
      ['PromptSlideout', 'Interactive prompt editor'],
      ['CopyButtons', '"Copy for AI" + "Copy Markdown"'],
    ])
    .enums('Provider', {
      DeweyProvider: ['neutral', 'ocean', 'emerald', 'purple', 'dusk', 'rose', 'github', 'warm'],
    })
    .build(),

  agents: agentContent('dewey-agents', 'dewey Agent Files', 'Generate AI-agent-optimized documentation files.')
    .table('Generated Files', ['File', 'Purpose', 'Format'], [
      ['AGENTS.md', 'Combined docs with critical context', 'Markdown'],
      ['llms.txt', 'Plain text for LLM context', 'Plain text'],
      ['docs.json', 'Structured data', 'JSON'],
      ['install.md', 'LLM-executable installation', 'Markdown'],
    ])
    .table('AGENTS.md Sections', ['Section', 'Content'], [
      ['Critical Context', 'Rules AI MUST follow'],
      ['Entry Points', 'Where to start in codebase'],
      ['Architecture', 'How the system works'],
      ['API Reference', 'Core interfaces'],
    ])
    .table('Agent Scoring', ['Category', 'Points'], [
      ['Project Context', '25'],
      ['Agent-Optimized Files', '30'],
      ['Human-to-Agent Handoff', '25'],
      ['Content Quality', '20'],
    ])
    .text('Thresholds', 'PASS >= 18/25 per category. 0-49: Needs work, 50-74: Good, 75-100: Excellent.')
    .build(),

  skills: agentContent('dewey-skills', 'dewey Skills', 'LLM prompt templates for documentation tasks.')
    .table('Available Skills', ['Skill', 'Purpose'], [
      ['docsReviewAgent', 'Review quality, catch drift from codebase'],
      ['promptSlideoutGenerator', 'Generate PromptSlideout configs'],
      ['installMdGenerator', 'Create install.md (installmd.org)'],
    ])
    .table('docsReviewAgent Prompts', ['Prompt', 'Action'], [
      ['review', 'Score on 5 criteria (25 pts total)'],
      ['generateSummary', 'Create review summary'],
      ['fixFromReview', 'Fix identified issues'],
      ['iterateCycle', 'Complete review/fix cycle'],
    ])
    .table('installMdGenerator Templates', ['Type', 'For'], [
      ['npm-package', 'Node.js packages'],
      ['cli-tool', 'Command-line tools'],
      ['macos-app', 'macOS applications'],
    ])
    .text('Skills vs Code', 'Skills use LLM reasoning for ambiguous tasks. Code is deterministic. Use skills when judgment is needed.')
    .build(),
}

// Render to markdown for copying
const agentContentRendered: Record<string, string> = {
  overview: renderAgentMarkdown(agentContentData.overview),
  quickstart: renderAgentMarkdown(agentContentData.quickstart),
  configuration: renderAgentMarkdown(agentContentData.configuration),
  components: renderAgentMarkdown(agentContentData.components),
  agents: renderAgentMarkdown(agentContentData.agents),
  skills: renderAgentMarkdown(agentContentData.skills),
}

// Raw markdown view - truly raw plain text
function RawMarkdownView() {
  const { slug } = useParams<{ slug: string }>()
  const pageId = slug?.replace('.md', '') || ''
  const pageContent = content[pageId]

  if (!pageContent) {
    return <pre>Document not found: {slug}</pre>
  }

  // Add frontmatter-style header
  const page = allPages.find(p => p.id === pageId)
  const fullMarkdown = `---
title: ${page?.title || pageId}
description: ${page?.description || ''}
---

# ${page?.title || pageId}

${pageContent.trim()}
`

  // Truly raw - no styling, just plain text
  return (
    <pre style={{ margin: 0, padding: 0, fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
      {fullMarkdown}
    </pre>
  )
}

function DocsPage({ pageId }: { pageId: string }) {
  const page = allPages.find(p => p.id === pageId)
  const { prev, next } = getNavigation(pageId)
  const pageContent = content[pageId] || ''
  const pageAgentContent = agentContentRendered[pageId]

  return (
    <DocsLayout
      title={page?.title || 'Documentation'}
      description={page?.description}
      navigation={navigation}
      projectName="Dewey"
      basePath="/docs"
      homeUrl="/"
      markdown={pageContent}
      agentContent={pageAgentContent}
      prevPage={prev}
      nextPage={next}
    >
      <MarkdownContent content={pageContent} />
    </DocsLayout>
  )
}

// DocsIndex - Landing page with card navigation (matches Landing.tsx style)
function DocsIndexPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--arc-paper)' }}
    >
      {/* Nav - matches Landing */}
      <nav
        className="sticky top-0 z-50"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(247, 243, 236, 0.85)',
          borderBottom: '1px solid var(--arc-border)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--arc-accent)',
                boxShadow: '0 0 0 3px var(--arc-glow)',
              }}
            />
            <span
              className="text-lg font-semibold font-serif"
              style={{ color: 'var(--arc-ink)' }}
            >
              Dewey
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="text-[13px] font-medium transition-colors px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--arc-ink-soft)' }}
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ background: 'rgba(240, 124, 79, 0.15)' }}
          >
            <Library className="w-8 h-8" style={{ color: 'var(--arc-accent)' }} />
          </div>
          <h1
            className="text-3xl md:text-4xl font-semibold mb-4 font-serif"
            style={{ color: 'var(--arc-ink)', letterSpacing: '-0.02em' }}
          >
            Documentation
          </h1>
          <p
            className="text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--arc-muted)' }}
          >
            Everything you need to build agent-ready documentation.
          </p>
        </div>

        {/* Navigation sections */}
        <div className="space-y-10">
          {navigation.map((group) => (
            <section key={group.title}>
              <h2
                className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4 px-1"
                style={{ color: 'var(--arc-muted)' }}
              >
                {group.title}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.id}
                      to={`/docs/${item.id}`}
                      className="group flex items-center gap-4 p-5 rounded-xl transition-all hover:shadow-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid var(--arc-border)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {Icon && (
                        <div
                          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                          style={{ background: 'rgba(31, 122, 101, 0.1)' }}
                        >
                          <Icon className="w-5 h-5" style={{ color: 'var(--arc-accent-2)' }} />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <h3
                          className="font-medium font-serif transition-colors"
                          style={{ color: 'var(--arc-ink)' }}
                        >
                          {item.title}
                        </h3>
                        {item.description && (
                          <p
                            className="text-[13px] truncate"
                            style={{ color: 'var(--arc-muted)' }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight
                        className="w-5 h-5 transition-transform group-hover:translate-x-1"
                        style={{ color: 'var(--arc-muted)' }}
                      />
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Quick links */}
        <div
          className="mt-16 pt-8"
          style={{ borderTop: '1px solid var(--arc-border)' }}
        >
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://github.com/arach/dewey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] transition-colors"
              style={{ color: 'var(--arc-muted)' }}
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@arach/dewey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] transition-colors"
              style={{ color: 'var(--arc-muted)' }}
            >
              npm
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Docs() {
  return (
    <Routes>
      <Route index element={<DocsIndexPage />} />
      {/* Raw markdown routes - must come before regular routes */}
      <Route path=":slug.md" element={<RawMarkdownView />} />
      {/* Regular doc pages */}
      <Route path="overview" element={<DocsPage pageId="overview" />} />
      <Route path="quickstart" element={<DocsPage pageId="quickstart" />} />
      <Route path="configuration" element={<DocsPage pageId="configuration" />} />
      <Route path="components" element={<DocsPage pageId="components" />} />
      <Route path="agents" element={<DocsPage pageId="agents" />} />
      <Route path="skills" element={<DocsPage pageId="skills" />} />
    </Routes>
  )
}
