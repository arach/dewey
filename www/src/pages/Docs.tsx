import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { BookOpen, Terminal, Settings, Puzzle } from 'lucide-react'
import { DocsLayout, MarkdownContent, type NavGroup } from '../components/docs'

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
  }
]

const overviewContent = `## What is Dewey?

Dewey is a documentation toolkit for React projects. Named after Melvil Dewey, creator of the Dewey Decimal Classification system, it helps you build beautiful docs and generate agent-ready files.

### Two Packages

**@dewey/docs** - React components for documentation sites:
- DocsLayout with sidebar, TOC, dark mode
- MarkdownContent with syntax highlighting
- CodeBlock with copy button
- "Copy for Agent" feature

**@dewey/cli** - CLI for scaffolding and generation:
- \`dewey init\` - Scaffold docs structure
- \`dewey audit\` - Validate completeness
- \`dewey generate\` - Create AGENTS.md, llms.txt, docs.json

### Why Dewey?

1. **Consistent styling** - Same docs look across all your projects
2. **Agent-ready** - Generate AGENTS.md for AI coding assistants
3. **Validation** - Audit docs completeness with scoring
4. **Configurable** - Define project-specific context in dewey.config.ts

## Quick Example

\`\`\`tsx
import { DocsLayout, MarkdownContent } from '@dewey/docs'

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
    <DocsLayout
      title="Overview"
      description="Introduction to your project"
      navigation={navigation}
      projectName="MyProject"
    >
      <MarkdownContent content={markdownContent} />
    </DocsLayout>
  )
}
\`\`\`
`

const quickstartContent = `## Installation

Install both packages:

\`\`\`bash
pnpm add @dewey/docs @dewey/cli
\`\`\`

## Initialize Your Project

Run the init command to scaffold docs:

\`\`\`bash
pnpm dewey init
\`\`\`

This creates:
- \`docs/\` folder with template markdown files
- \`dewey.config.ts\` configuration file

## Configure

Edit \`dewey.config.ts\` with your project context:

\`\`\`typescript
/** @type {import('@dewey/cli').DeweyConfig} */
export default {
  project: {
    name: 'MyProject',
    tagline: 'A great project',
    type: 'npm-package',
  },

  agent: {
    criticalContext: [
      'NEVER do X when Y',
      'Always check Z before modifying W',
    ],
    entryPoints: {
      'main': 'src/',
      'config': 'config/',
    },
    sections: ['overview', 'quickstart', 'api'],
  },

  docs: {
    path: './docs',
    output: './',
    required: ['overview', 'quickstart'],
  },
}
\`\`\`

## Write Documentation

Edit the markdown files in \`docs/\`:

- \`overview.md\` - What is your project?
- \`quickstart.md\` - Get started in 5 minutes
- \`api.md\` - API reference (optional)
- \`configuration.md\` - Config options (optional)

## Audit

Check documentation completeness:

\`\`\`bash
pnpm dewey audit
\`\`\`

Output:
\`\`\`
✓ overview.md - complete (40/40)
✓ quickstart.md - complete (40/40)
✗ api.md - missing

Score: 80/100
\`\`\`

## Generate Agent Files

Create AGENTS.md and other agent-ready files:

\`\`\`bash
pnpm dewey generate
\`\`\`

This creates:
- \`AGENTS.md\` - Combined docs with critical context
- \`llms.txt\` - Plain text for LLMs
- \`docs.json\` - Structured JSON

## Use Components

Import components for your docs site:

\`\`\`tsx
import { DocsLayout, MarkdownContent } from '@dewey/docs'

export function DocPage({ content }) {
  return (
    <DocsLayout
      title="My Page"
      navigation={navigation}
      projectName="MyProject"
      markdown={content}
    >
      <MarkdownContent content={content} />
    </DocsLayout>
  )
}
\`\`\`
`

const configurationContent = `## dewey.config.ts

The configuration file defines your project context:

\`\`\`typescript
/** @type {import('@dewey/cli').DeweyConfig} */
export default {
  project: { ... },
  agent: { ... },
  docs: { ... },
}
\`\`\`

## Project Config

| Option | Type | Description |
|--------|------|-------------|
| \`name\` | \`string\` | Project name |
| \`tagline\` | \`string\` | Short description |
| \`type\` | \`string\` | Project type (npm-package, macos-app, cli-tool, etc.) |
| \`version\` | \`string\` | Optional version |

## Agent Config

Configure how AGENTS.md is generated:

### criticalContext

Rules that AI agents MUST know:

\`\`\`typescript
criticalContext: [
  'NEVER kill running processes - user may be mid-task',
  'Use ProjectLogger, NEVER use console.log directly',
  'Database is source of truth, API is sync layer',
]
\`\`\`

### entryPoints

Key directories for navigation:

\`\`\`typescript
entryPoints: {
  'main-app': 'src/',
  'api': 'src/api/',
  'components': 'src/components/',
}
\`\`\`

### rules

Pattern-based navigation hints:

\`\`\`typescript
rules: [
  { pattern: 'database', instruction: 'Check src/db/ for database code' },
  { pattern: 'auth', instruction: 'Auth logic in src/auth/' },
]
\`\`\`

### sections

Which doc sections to include in AGENTS.md:

\`\`\`typescript
sections: ['overview', 'architecture', 'api', 'troubleshooting']
\`\`\`

## Docs Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`path\` | \`string\` | \`'./docs'\` | Docs source directory |
| \`output\` | \`string\` | \`'./'\` | Output directory for generated files |
| \`required\` | \`string[]\` | \`['overview', 'quickstart']\` | Required doc sections |
`

const componentsContent = `## DocsLayout

The main layout component:

\`\`\`tsx
<DocsLayout
  title="Page Title"
  description="Page description"
  badge="Getting Started"
  badgeColor="blue"
  navigation={navigation}
  projectName="MyProject"
  basePath="/docs"
  homeUrl="/"
  markdown={content}
  prevPage={{ id: 'overview', title: 'Overview' }}
  nextPage={{ id: 'api', title: 'API Reference' }}
>
  <MarkdownContent content={content} />
</DocsLayout>
\`\`\`

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| \`title\` | \`string\` | Yes | Page title |
| \`navigation\` | \`NavGroup[]\` | Yes | Navigation structure |
| \`projectName\` | \`string\` | Yes | Project name |
| \`description\` | \`string\` | No | Page description |
| \`badge\` | \`string\` | No | Badge text |
| \`badgeColor\` | \`BadgeColor\` | No | Badge color |
| \`basePath\` | \`string\` | No | Base URL path |
| \`homeUrl\` | \`string\` | No | Home link URL |
| \`markdown\` | \`string\` | No | Raw markdown for copy |
| \`prevPage\` | \`NavItem\` | No | Previous page |
| \`nextPage\` | \`NavItem\` | No | Next page |

## MarkdownContent

Renders markdown with syntax highlighting:

\`\`\`tsx
<MarkdownContent
  content={markdownString}
  isDark={false}
/>
\`\`\`

Features:
- GitHub Flavored Markdown
- Syntax highlighting (highlight.js)
- Anchor links on headings
- Tables, blockquotes, lists

## CodeBlock

Standalone code block:

\`\`\`tsx
<CodeBlock
  className="language-typescript"
  isDark={false}
>
  {codeString}
</CodeBlock>
\`\`\`

## HeadingLink

Anchor link for headings:

\`\`\`tsx
<HeadingLink id="section-id" size="lg" />
\`\`\`

## Types

\`\`\`typescript
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

interface DocSection {
  id: string
  title: string
  level: 2 | 3
}

type BadgeColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose'
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

  return (
    <DocsLayout
      title={page?.title || 'Documentation'}
      description={page?.description}
      navigation={navigation}
      projectName="Dewey"
      basePath="/docs"
      homeUrl="/"
      markdown={pageContent}
      prevPage={prev}
      nextPage={next}
    >
      <MarkdownContent content={pageContent} />
    </DocsLayout>
  )
}

export function Docs() {
  return (
    <Routes>
      <Route index element={<Navigate to="overview" replace />} />
      {/* Raw markdown routes - must come before regular routes */}
      <Route path=":slug.md" element={<RawMarkdownView />} />
      {/* Regular doc pages */}
      <Route path="overview" element={<DocsPage pageId="overview" />} />
      <Route path="quickstart" element={<DocsPage pageId="quickstart" />} />
      <Route path="configuration" element={<DocsPage pageId="configuration" />} />
      <Route path="components" element={<DocsPage pageId="components" />} />
    </Routes>
  )
}
