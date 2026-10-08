# All Documentation

| Kind | Title | Source | Raw markdown |
|------|-------|--------|--------------|
| doc | dewey | `docs/AGENTS.md` | /agent/raw/docs/AGENTS.md |
| doc | API Reference | `docs/api.md` | /agent/raw/docs/api.md |
| doc | CLI Reference | `docs/cli.md` | /agent/raw/docs/cli.md |
| doc | Integrate into an existing site | `docs/integrate-existing-site.md` | /agent/raw/docs/integrate-existing-site.md |
| doc | Maintaining generated sites | `docs/maintenance.md` | /agent/raw/docs/maintenance.md |
| doc | Overview | `docs/overview.md` | /agent/raw/docs/overview.md |
| doc | Quickstart | `docs/quickstart.md` | /agent/raw/docs/quickstart.md |
| doc | Skills | `docs/skills.md` | /agent/raw/docs/skills.md |
| agent | API Reference | `docs/agent/api.agent.md` | /agent/raw/docs/agent/api.agent.md |
| agent | CLI Reference | `docs/agent/cli.agent.md` | /agent/raw/docs/agent/cli.agent.md |
| agent | Integrate existing site (agent) | `docs/agent/integrate-existing-site.agent.md` | /agent/raw/docs/agent/integrate-existing-site.agent.md |
| agent | Maintaining generated sites | `docs/agent/maintenance.agent.md` | /agent/raw/docs/agent/maintenance.agent.md |
| agent | dewey - Agent Context | `docs/agent/overview.agent.md` | /agent/raw/docs/agent/overview.agent.md |
| agent | Quickstart for agents | `docs/agent/quickstart.agent.md` | /agent/raw/docs/agent/quickstart.agent.md |
| agent | Agent Skills.agent | `docs/agent/skills.agent.md` | /agent/raw/docs/agent/skills.agent.md |

---

<!-- source: docs/AGENTS.md -->

# dewey

> Keeps docs usable by people and coding agents, and checks they still match the code

## Critical Context

**IMPORTANT:** Read these rules before making any changes:

- The primary commands are `init`, `build` and `check`; `audit`, `generate`, `agent`, `create`, `update` and `eject` are frozen (they warn and read `dewey.config.ts`)
- Settings live in `.dewey/project.json`; `build` writes the site to `.dewey/site/`
- Skills are LLM prompts, NOT deterministic code - they guide agents
- Never hardcode values that exist in source code - always cross-reference

## Project Structure

| Component | Path | Purpose |
|-----------|------|---------|
| React Components | `packages/docs/src/components/` | Optional docs UI components |
| CLI Commands | `packages/docs/src/cli/fresh/` | init, build, check, review, new, which, uncovered |
| Frozen CLI Commands | `packages/docs/src/cli/commands/` | audit, generate, agent, create, update, eject |
| Skills | `packages/docs/src/skills/` | LLM prompt templates |
| Documentation Site | `www/src/app/` | Live docs at dewey site |

## Quick Navigation

- Entry point: `packages/docs/src/index.ts`
- CLI entry: `packages/docs/src/cli/index.ts`
- Config schema: `packages/docs/src/cli/schema.ts`
- Main layout: `packages/docs/src/components/DocsLayout.tsx`

## CLI Commands

| Command | Purpose |
|---------|---------|
| `dewey init` | Front door, skills, `.dewey/project.json`, draft guide and maps, first build |
| `dewey build` | Site in `.dewey/site/`, `llms.txt`, `llms-full.txt`, `.md` copies |
| `dewey check` | Exit 1 on drafts, coverage gaps, stale reviews, broken references, stale outputs |
| `dewey review <doc>` | Record that a covered doc was reviewed |
| `dewey new <kind> <name>` | Draft map, guide, reference or history doc |
| `dewey which <path>` | Docs that cover a path |
| `dewey uncovered` | Source files no map covers |

Frozen: `audit`, `generate`, `agent`, `create`, `update`, `eject`.

## Skills System

Skills are exportable LLM prompts that guide agents:

| Skill | Purpose |
|-------|---------|
| `docsReviewAgent` | Review docs quality, catch drift from codebase |
| `docsDesignCritic` | Critique page structure — heading hierarchy, component usage, visual rhythm |
| `promptSlideoutGenerator` | Generate AI-consumable prompt configs |
| `installMdGenerator` | Create LLM-executable installation (installmd.org) |

### Using Skills

```typescript
import { docsReviewAgent } from '@deweydocs/dewey'

// Get the prompt template
const prompt = docsReviewAgent.reviewPage
  .replace('{DOC_FILE}', 'docs/api.md')
  .replace('{SOURCE_FILES}', 'src/types/index.ts')
  .replace('{OUTPUT_FILE}', '.dewey/reviews/api.md')

// Feed to LLM for execution
```

## React Components (22 total)

### Entry Points
- `DocsApp` - Complete docs site with routing
- `DocsIndex` - Card-based landing page

### Layout
- `DocsLayout` - Main layout (sidebar, TOC, navigation)
- `Header` - Sticky header with theme toggle
- `Sidebar` - Left navigation panel
- `TableOfContents` - Right minimap with scroll-spy

### Content
- `MarkdownContent` - Renders markdown with syntax highlighting
- `CodeBlock` - Code with copy button
- `Callout` - Alert boxes (info, warning, tip, danger)
- `Tabs` - Tabbed content
- `Steps` - Numbered instructions
- `Card`, `CardGrid` - Content cards
- `FileTree` - Directory visualizer
- `ApiTable` - Props/params table
- `Badge` - Status indicators

### Agent-Friendly
- `AgentContext` - Collapsible agent content block
- `PromptSlideout` - Interactive prompt editor with parameters
- `CopyButtons` - "Copy for AI" and "Copy Markdown" buttons

### Provider
- `DeweyProvider` - Theme and component context

## Configuration (dewey.config.ts, frozen commands only)

```typescript
export default {
  project: {
    name: string,
    tagline: string,
    type: 'npm-package' | 'cli-tool' | 'macos-app' | 'react-library' | 'monorepo' | 'generic',
  },
  agent: {
    criticalContext: string[],      // Rules agents MUST know
    entryPoints: Record<string, string>,  // Key directories
    rules: Array<{ pattern, instruction }>,
    sections: string[],             // Docs to include in AGENTS.md
  },
  docs: {
    path: string,    // Default: './docs'
    output: string,  // Default: './'
    required: string[],
  },
  install: {
    objective: string,
    doneWhen: { command, expectedOutput },
    prerequisites: string[],
    steps: Array<{ description, command, alternatives }>,
  },
}
```

## Type Reference

### CalloutType
`'info'` | `'warning'` | `'tip'` | `'danger'`

### BadgeVariant
`'default'` | `'success'` | `'warning'` | `'danger'` | `'info'` | `'purple'`

### ThemePreset
`'neutral'` | `'ocean'` | `'emerald'` | `'purple'` | `'dusk'` | `'rose'` | `'github'` | `'warm'` | `'midnight'` | `'editorial'` | `'mono'` | `'hudson'` | `'ink'` | `'slate'`

## File Generation

The frozen `dewey generate` creates:

| File | Format | Purpose |
|------|--------|---------|
| AGENTS.md | Markdown | Combined docs with critical context |
| llms.txt | Plain text | General software context |
| docs.json | JSON | Structured documentation |
| install.md | Markdown | LLM-executable installation (installmd.org) |
| agent/ | Markdown + JSON | Recursive retrieval manifests, raw docs, prompts, and bundles |

## Agent Content Pattern (frozen pipeline)

This repo's docs pair each page with a dense `.agent.md` copy for the frozen `generate`. With `dewey build`, a `*.agent.md` file is usually a map (`kind: map`) instead.

Layout:

```
docs/
├── overview.md           # Human-readable
├── quickstart.md
├── agent/
│   ├── overview.agent.md # Agent-optimized (dense, structured)
│   └── quickstart.agent.md
├── AGENTS.md            # Combined agent doc
└── llms.txt             # Plain text summary
```

The `.agent.md` versions are:
- Denser (no prose, just facts)
- Structured (tables, explicit values)
- Self-contained (no URL fetching needed)
- Cross-referenced against source code

---

*Generated by Dewey | [github.com/arach/dewey](https://github.com/arach/dewey)*

---

<!-- source: docs/api.md -->

# API Reference

Dewey’s primary product surface is the CLI: `dewey init`, `build` and `check` (see [CLI Reference](./cli.md)). The TypeScript API supports typed configuration for the frozen 0.4 pipeline, programmatic artifact retrieval, theme CSS, prompt templates, and an optional React presentation layer. The public module is defined by `packages/docs/src/index.ts`; package subpaths are defined by `packages/docs/package.json`.

## Choose the right surface

| Goal | Surface | Import or command |
|---|---|---|
| Set up docs, front door and site | CLI | `bunx dewey init` |
| Build the site, `llms.txt`, `.md` copies and `llms-full.txt` | CLI | `bunx dewey build` |
| Check maps, reviews, references and outputs | CLI | `bunx dewey check` |
| Collect or build 0.4 retrieval artifacts in code | Artifact subpath | `@deweydocs/dewey/agent-artifacts` |
| Render Markdown in an existing React app | Optional UI | `@deweydocs/dewey` + CSS subpaths |
| Style a site with a house skin | CSS subpath | `@deweydocs/dewey/css/skins/<name>.css` |
| Type-check a `dewey.config.ts` for the frozen commands | Main TypeScript module | `@deweydocs/dewey` |

The React components render Markdown for people inside an app you already have. They do not replace `dewey build`, which writes its own static site.

## Package entry points

| Package path | Contents |
|---|---|
| `@deweydocs/dewey` | Configuration helper, themes, React components, hooks, skills, utilities, and types |
| `@deweydocs/dewey/react` | Compatibility alias for the same module as `@deweydocs/dewey` |
| `@deweydocs/dewey/agent-artifacts` | Markdown collection, manifests, bundles, and ownership-safe artifact writing |
| `@deweydocs/dewey/css` | Full CSS bundle |
| `@deweydocs/dewey/styles` | Alias for the full CSS bundle |
| `@deweydocs/dewey/css/base.css` | Base component styles |
| `@deweydocs/dewey/css/tokens` | Semantic `--dw-*` tokens |
| `@deweydocs/dewey/css/tailwind` | Tailwind-oriented CSS |
| `@deweydocs/dewey/css/colors/<theme>.css` | One published color preset |
| `@deweydocs/dewey/css/skins/<name>.css` | One site skin: `dewey`, `openscout`, `talkie`, `lattices`, `hudsonkit`, `atlas`, `endpoint`, `terminal` |
| `@deweydocs/dewey/tailwind` | Tailwind preset module |

There is no wildcard color export. `<theme>` must be one of the fourteen published names listed under [Themes](#themes).

## Configuration API

`defineConfig` parses and returns a `DeweyConfig`; it is not just a TypeScript identity helper. `dewey.config.ts` is read only by the frozen commands (`audit`, `generate`, `agent`, `create`, `update`, `eject`); `init`, `build` and `check` use `.dewey/project.json` instead. Invalid values throw a Zod validation error. Its source is `packages/docs/src/cli/schema.ts`.

```ts
// dewey.config.ts
import { defineConfig } from '@deweydocs/dewey'

export default defineConfig({
  project: {
    name: 'my-library',
    tagline: 'A useful TypeScript library',
    type: 'npm-package',
    version: '1.0.0',
  },
  agent: {
    criticalContext: ['Use Bun for package operations'],
    entryPoints: { API: 'src/index.ts', Tests: 'test/' },
    rules: [
      { pattern: '*.test.ts', instruction: 'Use bun:test.' },
    ],
    sections: [], // empty means all human-readable docs
  },
  docs: {
    path: './docs',
    output: './',
    required: ['overview', 'quickstart', 'api'],
  },
  install: {
    objective: 'Install my-library.',
    prerequisites: ['Node.js 18+'],
    steps: [{ description: 'Install', command: 'bun add my-library' }],
    doneWhen: { command: 'bun test', expectedOutput: 'all tests pass' },
  },
})
```

### `DeweyConfig`

| Field | Type | Default / requirement |
|---|---|---|
| `project.name` | `string` | Required |
| `project.tagline` | `string` | Optional |
| `project.type` | `ProjectType` | `'generic'` |
| `project.version` | `string` | Optional |
| `agent.criticalContext` | `string[]` | `[]` |
| `agent.entryPoints` | `Record<string, string>` | `{}` |
| `agent.rules` | `{ pattern: string; instruction: string }[]` | `[]` |
| `agent.sections` | `string[]` | `[]`; empty includes every human-readable document |
| `docs.path` | `string` | `'./docs'` |
| `docs.output` | `string` | `'./'` |
| `docs.required` | `string[]` | `['overview', 'quickstart']` |
| `install.objective` | `string` | Optional |
| `install.doneWhen` | `{ command: string; expectedOutput?: string }` | Optional |
| `install.prerequisites` | `string[]` | `[]` |
| `install.steps` | Install step array | `[]` |
| `install.hostedUrl` | `string` | Optional |

`ProjectType` is `'macos-app' | 'npm-package' | 'cli-tool' | 'react-library' | 'monorepo' | 'generic'`.

## Programmatic agent artifacts

Import this surface from `@deweydocs/dewey/agent-artifacts`, implemented in `packages/docs/src/cli/agent-artifacts.ts`.

```ts
import {
  buildAgentManifest,
  collectMarkdownArtifacts,
  getMarkdownArtifact,
  writeAgentArtifacts,
} from '@deweydocs/dewey/agent-artifacts'

const options = {
  rootDir: process.cwd(),
  docsDir: './docs',
}
const project = { name: 'my-library', version: '1.0.0' }

const docs = await collectMarkdownArtifacts(options)
const manifest = buildAgentManifest(docs, { project })
const api = await getMarkdownArtifact('api', options)

const preview = await writeAgentArtifacts({
  ...options,
  outputDir: './generated',
  project,
  dryRun: true,
})

console.log(manifest.recommendedReadOrder, api?.rawUrl, preview.operations)
```

`dryRun: true` plans the same ownership-aware operations without writing. A real write creates or updates Dewey-owned outputs and prunes stale outputs in the selected artifact scope; `overwrite: true` explicitly permits replacement of reviewed desired-output conflicts, including modified or unowned targets.

### Artifact functions

| Export | Signature / result |
|---|---|
| `collectMarkdownArtifacts(options?)` | Recursively parse `.md` and `.mdx`; returns sorted `Promise<MarkdownArtifact[]>` |
| `getMarkdownArtifact(slug, options?)` | Find by normalized slug or source path; returns `Promise<MarkdownArtifact \| null>` |
| `getPromptArtifact(promptId, options?)` | Find a prompt under `prompts/`; returns `Promise<MarkdownArtifact \| null>` |
| `parseDocArtifact(filePath, raw?, options?)` | Parse one file or supplied Markdown string into a `MarkdownArtifact` |
| `buildAgentManifest(docs, options?)` | Build an `AgentManifest`; `includeContent` controls embedded Markdown/content |
| `buildPromptRegistry(docs, options?)` | Build the schema-versioned prompt registry |
| `buildContextBundle(docs, slugs, title?)` | Render selected slugs as one Markdown bundle |
| `buildAgentArtifactFiles(options?)` | Build generated file descriptions in memory without applying them |
| `writeAgentArtifacts(options?)` | Plan and optionally apply artifact writes; returns counts, paths, and operations |

### Artifact types and classification

`CollectMarkdownArtifactsOptions` accepts `rootDir?` and `docsDir?`. `WriteAgentArtifactsOptions` adds `outputDir?`, `project?`, `dryRun?`, and `overwrite?`. `AgentArtifactsProject` is `{ name: string; version?: string; tagline?: string; repository?: string }`.

`MarkdownArtifactKind` is `'doc' | 'agent' | 'prompt' | 'reference' | 'proposal'`. Classification is path-based:

| Path pattern | Kind |
|---|---|
| `prompts/**` | `prompt` |
| `agent/**` or a slug ending in `.agent` | `agent` |
| `reference/**` | `reference` |
| `proposals/**` | `proposal` |
| Everything else | `doc` |

A `MarkdownArtifact` includes `id`, `slug`, `kind`, optional `promptId`, title/description, `sourcePath`, retrieval URLs, frontmatter, headings, token estimate, raw Markdown, and body content. Manifest types exported by the subpath are `AgentManifest`, `AgentManifestEntry`, `PromptManifestEntry`, `MarkdownArtifact`, `MarkdownHeading`, and the option/project types above.

## React API

React is an optional presentation layer. The main source is `packages/docs/src/index.ts`; component contracts live in `packages/docs/src/components/`.

```tsx
'use client'

import {
  AutoTableOfContents,
  CopyButtons,
  DeweyProvider,
  MarkdownContent,
} from '@deweydocs/dewey'
import '@deweydocs/dewey/css/base.css'
import '@deweydocs/dewey/css/tokens'
import '@deweydocs/dewey/css/colors/ocean.css'

export function DocPage({ markdown, agentMarkdown }: {
  markdown: string
  agentMarkdown: string
}) {
  return (
    <DeweyProvider theme="ocean">
      <CopyButtons markdownContent={markdown} agentContent={agentMarkdown} />
      <MarkdownContent content={markdown} />
      <AutoTableOfContents markdown={markdown} />
    </DeweyProvider>
  )
}
```

Components that call Dewey hooks must be descendants of `DeweyProvider`. In a Next.js App Router project, put the provider and interactive components behind a client boundary; load Markdown and generate static params on the server.

### Provider and complete app

| Export | Required props | Important optional props |
|---|---|---|
| `DeweyProvider` | `children` | `components`, `theme`, `defaultDark`, `storageKey` |
| `DocsApp` | `docs: Record<string, string>` | `config`, `currentPage`, `providerProps`; `onNavigate` is currently reserved and not invoked |
| `DocsIndex` | `tree: PageNode[]` | `projectName`, `tagline`, `description`, `basePath`, `hero`, `showSearch`, `heroIcon`, `quickLinks`, `layout` |

`FrameworkComponents` can provide a `Link` component accepting anchor props plus `href`, and an optional `Image` component accepting image props. `ThemeConfig` accepts `preset?`, partial `colors` (`primary`, `background`, `foreground`, `accent`), and partial `fonts` (`sans`, `mono`).

`DocsAppConfig.layout.header` is `boolean | 'minimal'`; the other layout switches are booleans: `sidebar`, `toc`, `footer`, `prevNext`, and `breadcrumbs`.

### Layout and content components

| Export | Required props | Important optional props |
|---|---|---|
| `Header` | None | `projectName`, `homeUrl`, `backUrl`, `backLabel`, `label`, `showThemeToggle`, `actions` |
| `Sidebar` | `tree` | `currentPage`, `projectName`, `basePath`, `isOpen`, `onClose`, `header`, `footer` |
| `MarkdownContent` | `content` | `isDark` |
| `TableOfContents` | None | `items`, `title`, `className`, `scrollOffset` |
| `AutoTableOfContents` | None | `markdown`, `containerRef`, `title`, `className` |
| `DocsLayout` | `children`, `title`, `navigation`, `projectName` | Router-neutral shell; accepts `currentPage` and a framework `LinkComponent`, with plain anchors by default; its prop type is not re-exported by the main entry point |
| `CodeBlock` / `HeadingLink` | See source | Values are public, but their prop interfaces are not exported |

`TocItem` is `{ id: string; title: string; level: number }`. Related exports are `useActiveSection`, `extractTocItems`, `extractTocFromDom`, `useTableOfContents`, and `extractSections`.

### Content and agent-friendly components

| Export | Required props | Important optional props / unions |
|---|---|---|
| `Callout` | `children` | `type?: 'info' \| 'warning' \| 'tip' \| 'danger'`, `title` |
| `Tabs` / `Tab` | `children`; `Tab` also requires `label` | `Tabs.defaultTab` |
| `Steps` / `Step` | `children`; `Step` also requires `title` | — |
| `Card` | `title` | `description`, `icon`, `href`, `children` |
| `CardGrid` | `children` | `columns?: 2 \| 3 \| 4` |
| `FileTree` | `items` | `defaultExpanded`; item `type?: 'file' \| 'folder'` |
| `ApiTable` | `properties` | `title` |
| `Badge` | `children` | `variant`, `size?: 'sm' \| 'md'` |
| `CopyButtons` | `markdownContent` | `agentContent`, `showLabels`, `onCopy`, `className` |
| `AgentContext` | `content` | `title`, `defaultExpanded`, `className` |
| `PromptSlideout` | `isOpen`, `onClose`, `info`, `starterTemplate` | `title`, `description`, `params`, `examples`, `expectedOutput`, `className` |

`BadgeVariant` is `'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'`. `CopyButtons.onCopy` receives `'markdown' | 'agent' | 'plain'`.

### Navigation types

`PageNode` is a discriminated union of `PageItem`, `PageFolder`, and `PageSeparator` using `type: 'page' | 'folder' | 'separator'`. Page/navigation badge colors are `'info' | 'success' | 'warning' | 'error' | 'default'`. `NavigationConfig` is `NavigationGroup[]`.

Legacy compatibility types are also exported: `NavItem`, `NavGroup`, `DocSection`, `BadgeColor`, `PageLink`, and `DocsConfig`. The legacy `BadgeColor` union is `'blue' | 'emerald' | 'purple' | 'amber' | 'rose'`.

## Themes

The canonical registry is `packages/docs/src/themes.ts`.

```ts
import {
  THEME_REGISTRY,
  VALID_THEMES,
  isThemeName,
  resolveTheme,
  type ThemeName,
} from '@deweydocs/dewey'

const input = process.env.DOCS_THEME
const theme: ThemeName = resolveTheme(input) // invalid or missing -> 'neutral'

if (input && !isThemeName(input)) {
  console.warn(`Choose one of: ${VALID_THEMES.join(', ')}`)
}

console.log(THEME_REGISTRY[theme].cssFile)
```

`ThemeName` and `ThemePreset` contain the same values:

`'neutral' | 'ocean' | 'emerald' | 'purple' | 'dusk' | 'rose' | 'github' | 'warm' | 'midnight' | 'editorial' | 'mono' | 'hudson' | 'ink' | 'slate'`

`PUBLISHED_CSS_THEMES` lists presets with CSS exports; `VALID_THEMES` lists presets accepted by generated sites. Every current registry entry belongs to both lists. `resolveTheme` falls back to `'neutral'`.

All fourteen presets resolve the same semantic contract in light and dark: surfaces/foregrounds, primary/secondary/accent pairs, border/ring, info/warning/error/success pairs, code and syntax colors, sidebar/header colors, typography, radii, shadows, and motion. Runtime components and generated sites consume semantic `--dw-*` variables; public components do not own literal color palettes.

Contract tests verify every preset and generated-site theme in both modes, reject missing/dead tokens, require WCAG AA text pairs and visible focus, and check reduced-motion behavior. `bun run --cwd packages/docs test:visual` renders representative navigation, prose, controls, semantic states, code, and tables for 14 themes × light/dark and compares 28 Playwright screenshots.

## Skills and structured agent content

The skill exports are LLM prompt definitions, not deterministic generators:

| Export | Type / role |
|---|---|
| `docsReviewAgent` | Prompt set for accuracy and drift review; result type `DocsReviewResult` |
| `docsDesignCritic` | Prompt set for structure/design critique; result type `DocsDesignCritiqueResult` |
| `promptSlideoutGenerator` | Prompt set for authoring slideout configuration; type `PromptSlideoutConfig` |
| `installMdGenerator` | Prompt set for installmd.org content; type `InstallMdConfig` |
| `improveAIPrompts` | Iterative discovery/draft/review/refinement prompt set; types `PromptImprovementPass` and `PromptQualityCriteria` |

`improveAIPromptsSkill` is a deprecated alias of `improveAIPrompts` for compatibility.

Structured agent content can be assembled and rendered without the CLI:

```ts
import {
  agentContent,
  renderAgentJson,
  renderAgentMarkdown,
} from '@deweydocs/dewey'

const api = agentContent('api', 'API', 'Public package contracts')
  .enums('Themes', { ThemePreset: ['neutral', 'ocean'] })
  .code('Import', 'ts', "import { defineConfig } from '@deweydocs/dewey'")
  .build()

const markdown = renderAgentMarkdown(api)
const json = renderAgentJson(api)
```

The related exports are `AgentContentBuilder`, `renderAgentPlainText`, and the `AgentContent`, `AgentSection`, `TableSection`, `EnumSection`, `CodeSection`, `TextSection`, and `ListSection` types.

## Complete main-module export inventory

The following names are re-exported from `packages/docs/src/index.ts`.

| Group | Runtime exports |
|---|---|
| Config | `defineConfig` |
| Themes | `PUBLISHED_CSS_THEMES`, `THEME_REGISTRY`, `VALID_THEMES`, `isThemeName`, `resolveTheme` |
| App/provider | `DocsApp`, `DocsAppDefault`, `DocsIndex`, `DeweyProvider`, `useDewey`, `useTheme`, `useComponents`, `useLink` |
| Layout/content | `Header`, `DocsLayout`, `MarkdownContent`, `CodeBlock`, `HeadingLink`, `Sidebar`, `TableOfContents`, `AutoTableOfContents`, `useActiveSection`, `extractTocItems`, `extractTocFromDom` |
| UI | `Callout`, `Tabs`, `Tab`, `Steps`, `Step`, `Card`, `CardGrid`, `FileTree`, `ApiTable`, `Badge` |
| Agent UI | `CopyButtons`, `AgentContext`, `PromptSlideout` |
| Skills | `promptSlideoutGenerator`, `docsReviewAgent`, `docsDesignCritic`, `installMdGenerator`, `improveAIPrompts`, `improveAIPromptsSkill` |
| Hooks/utilities | `useDarkMode`, `useTableOfContents`, `extractSections`, `cn`, `resolveIcon`, `commonIcons` |
| Agent content | `agentContent`, `AgentContentBuilder`, `renderAgentMarkdown`, `renderAgentJson`, `renderAgentPlainText` |

| Type group | Type exports |
|---|---|
| Config/themes | `AgentRule`, `DeweyConfig`, `InstallConfig`, `ProjectType`, `ThemeDefinition`, `ThemeName`, `ThemePreset` |
| App/provider | `DocsAppProps`, `DocsAppConfig`, `DocsIndexProps`, `DeweyProviderProps`, `DeweyContextValue`, `ThemeConfig`, `FrameworkComponents` |
| Components | `HeaderProps`, `DocsLayoutProps`, `MarkdownContentProps`, `SidebarProps`, `AutoTocProps`, `TableOfContentsProps`, `TocItem`, `CalloutProps`, `CalloutType`, `TabsProps`, `TabProps`, `StepsProps`, `StepProps`, `CardProps`, `CardGridProps`, `FileTreeProps`, `FileTreeItem`, `ApiTableProps`, `ApiProperty`, `BadgeProps`, `BadgeVariant`, `CopyButtonsProps`, `AgentContextProps`, `PromptSlideoutProps`, `PromptParam` |
| Skills/content | `PromptSlideoutConfig`, `DocsReviewResult`, `DocsDesignCritiqueResult`, `InstallMdConfig`, `PromptImprovementPass`, `PromptQualityCriteria`, `AgentContent`, `AgentSection`, `TableSection`, `EnumSection`, `CodeSection`, `TextSection`, `ListSection` |
| Navigation/utilities | `PageTree`, `PageNode`, `PageItem`, `PageFolder`, `PageSeparator`, `FlatPage`, `NavigationConfig`, `NavigationGroup`, `NavigationItem`, `CommonIconName` |
| Legacy | `NavItem`, `NavGroup`, `DocSection`, `BadgeColor`, `PageLink`, `DocsConfig` |

For command flags and workflows, use the [CLI reference](./cli.md). For a complete server/client integration, use [Integrate into an existing site](./integrate-existing-site.md).

---

<!-- source: docs/cli.md -->

# CLI Reference

## Run Dewey

Install Dewey in a project and use its local binary:

```bash
bun add -d @deweydocs/dewey
bunx dewey --help
```

For a one-off run without installing it first, address the scoped package:

```bash
bunx @deweydocs/dewey@latest --help
```

`npx` works the same under Node. Every command runs from the project root.

## Commands

| Command | Purpose |
|---|---|
| `dewey init` | Set up a project: front door, draft maps and guide, skills, first site build |
| `dewey build` | Build the site in `.dewey/site` and `llms.txt` from the same Markdown |
| `dewey check` | Check maps, reviews, references, front door, site links, navigation and freshness |
| `dewey review <doc>` | Record that a covered doc was reviewed against the current code |
| `dewey new <kind> <name>` | Create a draft map, guide, reference or history doc |
| `dewey which <path>` | List the docs that cover a file or directory |
| `dewey uncovered` | List source files no map covers, by area |

The commands `audit`, `generate`, `agent`, `create`, `update` and `eject` are frozen. See [Frozen commands](#frozen-commands).

## init

```bash
dewey init --purpose "Count lines in log files" --rule "Never write to input files"
dewey init --no-rules --host AGENT.md
```

| Option | Meaning |
|---|---|
| `--purpose <text>` | Project purpose. Defaults to the `package.json` description, then the README's first paragraph |
| `--rule <text>` | A hard rule for agents. Repeat for more than one |
| `--no-rules` | Declare that there are no project-specific hard rules |
| `--host <file>` | Write a pointer file that redirects to `AGENTS.md`. Repeatable. Must be a `.md` file name |

In a terminal, init asks for a missing purpose or rules. Without a terminal, it fails with: `Supply --purpose and either --rule or --no-rules in non-interactive use.`

Init writes `AGENTS.md`, `SKILL.md`, `.agents/skills/dewey-author/SKILL.md`, `.dewey/project.json`, a draft `docs/quickstart.md`, a draft map per source area, then runs the first build.

In a repo with existing docs, init keeps your files:

- `AGENTS.md` and `llms.txt` get a marked region appended. Text outside the markers is never changed.
- Existing guides, maps, `SKILL.md` and host files are left alone.
- A doc in `docs/` without a `kind` gets one guessed from its path: `history` under plans, specs, reports, proposals or decisions; `reference` under reference or api; otherwise `guide`. Init prints how many it changed.
- Areas an existing map covers get no draft map.
- If anything fails, including the first build, init restores every file it touched.

In a project without `.dewey/project.json`, init refuses to run if `.dewey/site/` or `.dewey/outputs.json` already exists. Rerunning it in an initialized project only refreshes the marked region of `AGENTS.md` and runs a build; it never replaces authored files.

## build

```bash
dewey build
```

Writes:

| Output | Contents |
|---|---|
| `.dewey/site/*.html` | One page per guide and reference, plus an index page |
| `.dewey/site/**/*.md` | A Markdown copy next to each page, with links to the other copies |
| `.dewey/site/llms.txt` | One line per page: summary and size (lines, estimated tokens) |
| `.dewey/site/llms-full.txt` | Every guide and reference in one file |
| `.dewey/site/nav.json` | The sidebar as data: title, summary, HTML and `.md` paths, source file |
| `llms.txt` (root) | The marked `index` region: the same page list, linking to source files |
| `AGENTS.md` | The marked `observed` region: scripts, source areas and maps |

Maps and history docs are not published to the site or `llms-full.txt`. Generated files are tracked by hash in `.dewey/outputs.json`; a build stops before writing if a target was edited by hand or is not Dewey's. Build never records a review.

## check

```bash
dewey check
dewey check --json
```

Exits 0 when everything is consistent and 1 otherwise. Text output prints `path:line CODE message` and a `fix:` line per issue. `--json` prints `{ "passed": boolean, "issues": [{ code, path, line?, message, fix }] }`.

| Area | Codes |
|---|---|
| Doc metadata | `DOC_DRAFT`, `DOC_KIND`, `DOC_META`, `DOC_STATUS`, `DOC_COVERS`, `SUPERSEDES_MISSING` |
| Coverage | `MAP_MISSING`, `COVERAGE_OVERLAP`, `COVERAGE_BROAD`, `COVERAGE_EMPTY` |
| Review | `REVIEW_REQUIRED` |
| Front door | `FRONT_DOOR_MISSING`, `FRONT_DOOR_BUDGET`, `FRONT_DOOR_POINTER`, `SKILL_MISSING`, `REGION_STALE`, `REGION_INVALID` |
| References | `MISSING_PATH`, `MISSING_SCRIPT`, `MISSING_SYMBOL`, `UNKNOWN_COMMAND` |
| Links and site | `BROKEN_LINK`, `BROKEN_ANCHOR`, `NON_PUBLIC_LINK`, `SITE_LINK`, `NAV_MISSING` |
| Outputs | `STALE_OUTPUT`, `OUTPUT_OWNERSHIP` |
| Packaging | `PUBLISH_MISSING` |

Details:

- The front door is `AGENTS.md` plus any host files. Together they must stay at 150 lines and about 2,000 tokens or fewer.
- A symbol citation is written `` `src/model.ts#loadModel` `` or `[loadModel](../src/model.ts#loadModel)`. Check confirms the JS or TS file declares that name.
- A command in a `sh` fence must be a package bin, a common tool (bun, node, git and similar), a `./` script, or listed in `commands` in `.dewey/project.json`. Mark a fence ```` ```sh ignore ```` to skip it.
- A published package (named, not `private`) must ship `AGENTS.md`, `SKILL.md` and its guides and references in its `files` list.

Check does not run doc commands or fetch external links. A pass does not prove the prose is true.

## review

```bash
dewey review docs/src.agent.md
```

Records hashes of the doc and the files it covers in `.dewey/reviews.json`. Run it after you have reread the code and corrected the doc. The doc must declare `covers`; for other docs, review fails with `Choose a document with covers frontmatter`.

## new

```bash
dewey new map src/sync              # docs/src-sync.agent.md
dewey new guide "Deploy to staging" # docs/deploy-to-staging.md
dewey new reference "CLI flags"     # docs/reference/cli-flags.md
dewey new history "Why JSONL"       # docs/history/<date>-why-jsonl.md
```

Each file starts as a draft with section prompts. `new` refuses to overwrite an existing file.

## which and uncovered

```bash
dewey which src/sync/index.ts   # docs whose covers match the file
dewey which src/sync            # docs covering anything under a directory
dewey uncovered                 # source files no map covers, grouped by area
```

Both take `--json`. `which` lists each doc's path, kind, title, matching pattern, line count and estimated tokens, maps first.

## Frontmatter

```yaml
---
kind: map            # guide | reference | map | history
covers: [src/sync/**]
title: Sync implementation
description: One line shown under the title and used as the summary
group: Guides        # sidebar group
order: 2             # sort within the group
---
```

| Field | Values |
|---|---|
| `kind` | `guide`, `reference`, `map`, `history`. Root `README.md` is a guide by default |
| `covers` | Project-relative patterns with `*`, `**`, `?`. `src/*` does not cover `src/sync/index.ts`. A pattern may not start with `**` |
| `draft` | `true` until the doc is finished; check fails while it is set |
| `status` | `shipped` (default), `proposal`, `abandoned`. Proposals show a notice; abandoned docs are not published |
| `applies` | What the doc covers, such as a package, version or platform. String or list |
| `supersedes`, `superseded_by` | Doc paths from the project root |
| `nav` | `false` for a human page that is deliberately left out of the sidebar |

Sidebar groups are Start here (`README.md`, `docs/quickstart.md`), Guides, then Reference.

## .dewey/project.json

```json
{
  "schemaVersion": 1,
  "name": "tally",
  "purpose": "Count lines in log files",
  "rules": ["Never write to input files"],
  "hosts": ["AGENT.md"],
  "commands": ["frobnicate"],
  "skin": "dewey"
}
```

| Field | Meaning |
|---|---|
| `name`, `purpose`, `rules` | Shown in `AGENTS.md`, `SKILL.md` and `llms.txt` |
| `hosts` | Pointer files that redirect to `AGENTS.md` |
| `commands` | Extra shell commands that docs may use in `sh` fences |
| `skin` | `dewey` (default, looks like deweydocs.com), `openscout`, `talkie`, `lattices`, `hudsonkit`, or `ink` (a plain look with a theme menu) |
| `site` | See [Site settings](#site-settings) |

### Site settings

Every field is optional:

```json
"site": {
  "theme": "slate",
  "accent": { "light": "#0f766e", "dark": "#5eead4" },
  "fonts": { "sans": "Inter, system-ui, sans-serif", "mono": "ui-monospace, monospace", "stylesheet": "https://…" },
  "logo": "brand/logo.svg",
  "css": "brand/docs.css",
  "home": { "href": "https://example.com", "label": "Example" },
  "links": [{ "label": "GitHub", "href": "https://github.com/example/example" }]
}
```

| Field | Meaning |
|---|---|
| `theme` | One color theme for the ink look; removes the visitor's theme menu. Implies `"skin": "ink"`. Refused with any other skin |
| `accent` | One CSS color, or `{ light, dark }`. Applies over any skin |
| `fonts` | `sans`, `heading`, `mono` font stacks and a `stylesheet` URL for web fonts |
| `logo` | Project path to an image that replaces the header's brand mark |
| `css` | Project path to a stylesheet loaded after Dewey's |
| `home` | A header link back to the product site |
| `links` | Header links, such as GitHub |

`theme` accepts `neutral`, `ocean`, `emerald`, `purple`, `dusk`, `rose`, `github`, `warm`, `midnight`, `editorial`, `mono`, `hudson`, `ink` or `slate`. An invalid value stops the build with a message naming the field.

## Frozen commands

These 0.4 commands still run, print `dewey <command> is frozen and will be removed. Use dewey init, build and check instead.` to stderr (except with `--json`), and get no new work. They read `dewey.config.ts`, not `.dewey/project.json`.

| Command | What it did | Use instead |
|---|---|---|
| `dewey audit` | Completeness checks | `dewey check` |
| `dewey generate` | `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, `agent/` | `dewey build` |
| `dewey agent` | 0–100 readiness score | `dewey check` |
| `dewey create <dir>` | Next.js or Astro site scaffold | `dewey build` (static site in `.dewey/site`) |
| `dewey update [dir]` | Refresh a scaffolded site | — |
| `dewey eject <component> [dir]` | Take ownership of a scaffolded component | — |

Existing `create` sites are covered in [Maintaining generated sites](./maintenance.md).

## Error handling in automation

Every command exits non-zero on failure. In CI:

```bash
bunx dewey build
bunx dewey check --json > dewey-check.json
```

The second command exits 1 when check finds issues, which fails the job; the JSON report is still written.

---

<!-- source: docs/integrate-existing-site.md -->

Dewey's CLI (`init`, `build`, `check`) keeps your Markdown, `AGENTS.md` and `llms.txt` in step with the code, and `build` writes its own static site to `.dewey/site/`. The React components are an **optional presentation layer** for rendering the same Markdown inside a site you already own.

This guide is for teams that already have a React or Next.js app and want docs under a route such as `/docs`. If a standalone static site is enough, `dewey build` already makes one; see [Quickstart](./quickstart.md).

## When to embed

| Path | Use when |
|------|----------|
| **Embed components** (this guide) | You already have React/Next.js routing, layout, design system, or deploy pipeline |
| **`dewey build`** | A static site in `.dewey/site/` is enough; serve that folder |
| **`dewey create`** (frozen) | Existing scaffolded Next.js or Astro sites only; see [Maintaining generated sites](./maintenance.md) |

Embedding does not replace `dewey build` and `dewey check`. Keep running them; use components only to render Markdown for people.

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| Node.js 18+ | |
| Bun 1.3+ (recommended) | Examples below use Bun |
| React 18 or 19 | Peer dependency of `@deweydocs/dewey` |
| Next.js App Router | Patterns below target App Router; adapt for Pages Router if needed |
| Existing Markdown under `docs/` | With a `kind` in each file's frontmatter; see [Kinds of doc](./overview.md#kinds-of-doc) |

## Package and CSS installation

```bash
bun add @deweydocs/dewey gray-matter
```

- Runtime dependency (not only `-d`) when the site imports Dewey components.
- `gray-matter` is the usual choice for frontmatter when you load files from disk.
- No router package is required by Dewey. `react-router-dom` is not a peer dependency; pass a framework link adapter where needed.

### CSS entry points

Import base styles, design tokens, and one color theme in a root layout or global CSS entry:

```tsx
// app/layout.tsx (or app/docs/layout.tsx)
import '@deweydocs/dewey/css/base.css'
import '@deweydocs/dewey/css/tokens'
import '@deweydocs/dewey/css/colors/ocean.css'
```

| Export | Purpose |
|--------|---------|
| `@deweydocs/dewey/css` | Full bundle (base + tokens + default theme wiring) |
| `@deweydocs/dewey/css/base.css` | Reset and base rules |
| `@deweydocs/dewey/css/tokens` | Semantic `--dw-*` CSS variables |
| `@deweydocs/dewey/css/colors/<theme>.css` | Color preset |
| `@deweydocs/dewey/styles` | Alias of the full CSS bundle |
| `@deweydocs/dewey/tailwind` | Tailwind preset for `--dw-*` utilities |

**Themes:** `neutral`, `ocean`, `emerald`, `purple`, `dusk`, `rose`, `github`, `warm`, `midnight`, `editorial`, `mono`, `hudson`, `ink`, `slate`.

Tokens use the `--dw-*` prefix so they rarely collide with a host design system. Dark mode follows a `.dark` class on an ancestor (DeweyProvider manages this when you use the provider).

The complete semantic contract covers surfaces and foregrounds; primary, secondary, and accent pairs; border/ring; info, warning, error, and success pairs; code and syntax colors; sidebar/header colors; typography, radii, shadows, and motion. Every public component and generated theme consumes this contract. The package verifies WCAG AA pairs, focus and reduced motion, plus 28 representative Playwright screenshots (14 themes × light/dark).

### Import path note

`@deweydocs/dewey` and `@deweydocs/dewey/react` resolve to the **same** module surface. Prefer `@deweydocs/dewey` in new code; treat `/react` as a compatibility alias, not a separate React-only package.

```tsx
import {
  DeweyProvider,
  Header,
  Sidebar,
  MarkdownContent,
  AutoTableOfContents,
  CopyButtons,
} from '@deweydocs/dewey'
```

## Recommended architecture

Keep a clear server/client boundary (required for static export and App Router):

```
app/
  layout.tsx              # server: fonts, CSS imports, Providers shell
  providers.tsx           # client: DeweyProvider + Next.js Link/Image
  docs/
    layout.tsx            # client or server shell: Header + Sidebar
    [...slug]/
      page.tsx            # server: load markdown, generateStaticParams
      content.tsx         # client: MarkdownContent, TOC, CopyButtons
lib/
  dewey.tsx               # components map + providerProps + siteConfig
  docs.ts                 # recursive fs loaders (server-only)
  navigation.ts           # nav tree from docs.json (optional)
docs/                     # source markdown (project root or monorepo package)
```

This mirrors the layout of the frozen `dewey create --template nextjs` scaffold, without a separate project.

## Server-to-client wrapper

Dewey layout and content components use React hooks (theme, TOC scroll-spy, copy buttons). In the App Router they must run as **client** components. Static export and `generateStaticParams` must run on the **server**.

**Pattern:** server page loads and serializes doc data → client content component renders Dewey UI.

### 1. Client provider

```tsx
// app/providers.tsx
'use client'

import { DeweyProvider } from '@deweydocs/dewey'
import type { DeweyProviderProps } from '@deweydocs/dewey'
import type { AnchorHTMLAttributes } from 'react'
import Link from 'next/link'

type DeweyLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
const DeweyLink = ({ href, ...props }: DeweyLinkProps) => <Link href={href} {...props} />

const providerProps: Omit<DeweyProviderProps, 'children'> = {
  theme: 'ocean',
  components: { Link: DeweyLink },
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <DeweyProvider {...providerProps}>{children}</DeweyProvider>
}
```

Wire `Providers` once in the root layout (server component):

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import '@deweydocs/dewey/css/base.css'
import '@deweydocs/dewey/css/tokens'
import '@deweydocs/dewey/css/colors/ocean.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Project docs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

`suppressHydrationWarning` on `<html>` avoids noise from theme class hydration.

### 2. Server page + client content

```tsx
// app/docs/[...slug]/page.tsx
import { getDocBySlug, getAllDocSlugs } from '@/lib/docs'
import { DocContent } from './content'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs()
  return slugs.map((slug) => ({ slug: slug.split('/') }))
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const doc = getDocBySlug(slug.join('/'))

  if (!doc) {
    return <div>Page not found</div>
  }

  return <DocContent doc={doc} />
}
```

```tsx
// app/docs/[...slug]/content.tsx
'use client'

import { MarkdownContent, AutoTableOfContents, CopyButtons } from '@deweydocs/dewey'
import type { DocData } from '@/lib/docs'

export function DocContent({ doc }: { doc: DocData }) {
  return (
    <div className="docs-content-grid">
      <article>
        <h1>{doc.title}</h1>
        {doc.description ? <p>{doc.description}</p> : null}
        <CopyButtons
          markdownContent={doc.content}
          agentContent={doc.agentContent}
        />
        <MarkdownContent content={doc.content} />
      </article>
      <aside>
        <AutoTableOfContents markdown={doc.content} />
      </aside>
    </div>
  )
}
```

Pass only serializable props (`string`, plain objects) across the boundary — not file handles or class instances.

## Static export configuration

For fully static hosting (GitHub Pages, S3, many CDNs):

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@deweydocs/dewey'],
}

module.exports = nextConfig
```

| Setting | Why |
|---------|-----|
| `output: 'export'` | Emits a static `out/` directory |
| `images.unoptimized` | Required when using `output: 'export'` with Next Image |
| `transpilePackages: ['@deweydocs/dewey']` | Ensures Dewey ESM ships correctly through Next’s bundler |

`generateStaticParams` must return every docs slug you want pre-rendered. Without it, nested routes are missing from the export.

If the host app is **not** a pure static export, you can still use the same server/client split and omit `output: 'export'`; keep `transpilePackages` when bundling Dewey.

## Recursive content loading

Discover human Markdown recursively; exclude `.agent.md` from the page list, then attach an agent counterpart when present.

```ts
// lib/docs.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface DocData {
  slug: string
  title: string
  description?: string
  content: string
  agentContent?: string
  order: number
}

const docsDirectory = path.join(process.cwd(), 'docs')

function walkDir(dir: string, base = ''): string[] {
  const results: string[] = []
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? `${base}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        results.push(...walkDir(path.join(dir, entry.name), rel))
      } else {
        results.push(rel)
      }
    }
  } catch {
    // missing directory
  }
  return results
}

export function getAllDocSlugs(): string[] {
  return walkDir(docsDirectory)
    .filter((file) => file.endsWith('.md') && !file.endsWith('.agent.md'))
    .map((file) => file.replace(/\.md$/, ''))
}

export function getDocBySlug(slug: string): DocData | null {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf-8')
    const { data, content } = matter(fileContents)

    let agentContent: string | undefined
    const agentCandidates = [
      path.join(docsDirectory, `${slug}.agent.md`),
      path.join(docsDirectory, 'agent', `${slug}.agent.md`),
    ]
    const agentPath = agentCandidates.find((p) => fs.existsSync(p))
    if (agentPath) {
      const agentFile = fs.readFileSync(agentPath, 'utf-8')
      const { content: agentBody } = matter(agentFile)
      agentContent = agentBody.trim() || undefined
    }

    return {
      slug,
      title: (data.title as string) || slug,
      description: data.description as string | undefined,
      content: content.trim(),
      agentContent,
      order: (data.order as number) || 999,
    }
  } catch {
    return null
  }
}
```

| Rule | Behavior |
|------|----------|
| Human page | `docs/**/*.md` excluding `*.agent.md` |
| Colocated agent | `docs/guides/install.agent.md` next to `docs/guides/install.md` |
| Nested agent folder | `docs/agent/guides/install.agent.md` (or `docs/agent/overview.agent.md` for top-level pages) |
| Nested routes | Slug `guides/install` → URL `/docs/guides/install` |

In 0.5.0 a `*.agent.md` file under `docs/` is usually a map (`kind: map`): an internal doc about a source area, not an agent copy of a human page. `dewey build` leaves maps off its site. Filter on the `kind` frontmatter if you only want guides and references in the UI.

### Optional navigation from `docs.json`

`docs.json` comes from the frozen `dewey generate`. `dewey build` writes `.dewey/site/nav.json` instead, with a different shape: groups of `{ title, summary, url, markdown, source }`. With the frozen pipeline, import the generated manifest for sidebar groups:

```ts
// lib/navigation.ts
import docsJson from '../../docs.json'
import type { PageNode } from '@deweydocs/dewey'

export function getNavTree(): PageNode[] {
  return (docsJson as { groups: { title: string; items: { id: string; title: string; description?: string }[] }[] })
    .groups.map((group) => ({
      type: 'folder' as const,
      name: group.title,
      defaultOpen: true,
      children: group.items.map((item) => ({
        type: 'page' as const,
        id: item.id,
        name: item.title,
        description: item.description,
      })),
    }))
}
```

With the frozen pipeline, regenerate `docs.json` whenever nav or page set changes so the UI and agent artifacts stay aligned.

## Themes at runtime

Preset via provider:

```tsx
<DeweyProvider theme="purple" components={{ Link: DeweyLink }}>
  {children}
</DeweyProvider>
```

Or partial overrides:

```tsx
<DeweyProvider
  theme={{
    preset: 'ocean',
    colors: { primary: '#0ea5e9' },
    fonts: { sans: 'var(--font-sans)', mono: 'var(--font-mono)' },
  }}
>
  {children}
</DeweyProvider>
```

Pair the CSS file (`@deweydocs/dewey/css/colors/purple.css`) with the matching `theme` prop so tokens and components stay in sync.

Optional Tailwind:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import deweyPreset from '@deweydocs/dewey/tailwind'

export default {
  presets: [deweyPreset],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
} satisfies Config
```

## Docs layout shell (Header + Sidebar)

```tsx
// app/docs/layout.tsx
'use client'

import { usePathname } from 'next/navigation'
import { Header, Sidebar } from '@deweydocs/dewey'
import { getNavTree } from '@/lib/navigation'

const basePath = '/docs'
const projectName = 'My Project'
const defaultPage = 'overview'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentPage =
    pathname.replace(new RegExp(`^${basePath}/?`), '').replace(/\/$/, '') || defaultPage

  return (
    <>
      <Header projectName={projectName} homeUrl={basePath} showThemeToggle />
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <Sidebar
            tree={getNavTree()}
            currentPage={currentPage}
            projectName={projectName}
            basePath={basePath}
          />
        </aside>
        <main className="docs-main">{children}</main>
      </div>
    </>
  )
}
```

Prefer composing `Header`, `Sidebar`, `MarkdownContent`, and `AutoTableOfContents` when you want full control. The packaged `DocsLayout` is also router-neutral: it uses anchors by default and accepts `LinkComponent` plus `currentPage`.

```tsx
import { DocsLayout, MarkdownContent } from '@deweydocs/dewey'

<DocsLayout
  title={doc.title}
  navigation={navigation}
  projectName="My Project"
  currentPage={doc.id}
  LinkComponent={DeweyLink}
>
  <MarkdownContent content={doc.content} />
</DocsLayout>
```

## Dewey alongside the site

Keep Dewey in the **same repository** as the host app. Components render Markdown; `build` and `check` keep it consistent with the code and write the agent files.

### Onboarding sequence

| Step | Command | Role |
|------|---------|------|
| 1. Install | `bun add @deweydocs/dewey gray-matter` | Package on the site; CLI available via `bunx` |
| 2. Init (once) | `bunx dewey init --purpose "…" --no-rules` | Front door, draft maps and guide, `.dewey/project.json` |
| 3. Author | Finish the drafts in `docs/` | Guides, references and maps |
| 4. Review | `bunx dewey review docs/<area>.agent.md` | Record each map as checked against the code |
| 5. Build | `bunx dewey build` | `AGENTS.md` and `llms.txt` regions, `.dewey/site/` |
| 6. Check | `bunx dewey check` | Fails on drafts, stale reviews, broken links, stale outputs |
| 7. Render | Your Next/React routes | Human UI (this guide) |

Suggested `package.json` scripts:

```json
{
  "scripts": {
    "docs:build": "dewey build",
    "docs:check": "dewey check",
    "prebuild": "bun run docs:build",
    "dev": "next dev",
    "build": "next build"
  }
}
```

### Serve agent files from the static host

`dewey build` writes these under `.dewey/site/`. Copy the ones you want into `public/` (or your static asset root) in a build step:

| Artifact | Typical public URL |
|----------|-------------------|
| `.dewey/site/llms.txt` | `/llms.txt` |
| `.dewey/site/llms-full.txt` | `/llms-full.txt` |
| `.dewey/site/**/*.md` | Markdown copy of each page |
| `AGENTS.md` (repo root) | `/AGENTS.md` |

The `.md` links in `.dewey/site/llms.txt` are relative to `.dewey/site/`. Keep the same layout when you copy them, or serve `.dewey/site/` as its own path.

## CI

Check the docs without depending on the UI build:

```yaml
# .github/workflows/docs.yml (illustrative)
name: docs
on:
  pull_request:

jobs:
  dewey:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunx dewey build
      - run: bunx dewey check
```

| Command | CI use |
|---------|--------|
| `dewey build` | Refresh the site and agent files |
| `dewey check` | Exit 1 on drafts, uncovered code, stale reviews, broken references or stale outputs |
| `dewey check --json` | The same, as `{ passed, issues[] }` |

Commit `.dewey/project.json` and `.dewey/reviews.json` so CI checks against the same reviewed baseline. Run `build` **before** `next build` when the app serves files from `.dewey/site/`.

## Monorepo notes

| Setup | Approach |
|-------|----------|
| Docs package + app package | Run `dewey init` in the package whose `docs/` you render; depend on `@deweydocs/dewey` from the app |
| Shared `docs/` at repo root | `process.cwd()` in Next is the app package — set `docsDirectory` to a path relative to the monorepo root (or symlink `docs` into the app) |
| One docs set for many apps | Run `dewey build` at the repo root; copy files from `.dewey/site/` into each app's static assets |

## Checklist

- [ ] `@deweydocs/dewey` + CSS theme imported
- [ ] `DeweyProvider` in a client `Providers` wrapper with Next `Link` / `Image`
- [ ] Server `page.tsx` + client `content.tsx` split
- [ ] `generateStaticParams` covers recursive slugs (if static export)
- [ ] Recursive loader skips `.agent.md` for routes but loads agent siblings for `CopyButtons` / agent view
- [ ] `bunx dewey build` and `bunx dewey check` in local and CI pipelines
- [ ] Agent artifacts reachable at stable URLs if you expose them publicly

## Related

- [Quickstart](./quickstart.md) — init, author, review, build, check
- [CLI Reference](./cli.md) — every command, `.dewey/project.json` and site settings
- [Overview](./overview.md) — the docs loop and kinds of doc
- [Skills](./skills.md) — LLM prompt skills for review and install.md
- [Maintaining generated sites](./maintenance.md) — frozen `create`/`update`/`eject` sites and release checks

For a static site without embedding, run `bunx dewey build` and serve `.dewey/site/`.

---

<!-- source: docs/maintenance.md -->

`dewey create`, `update` and `eject` are frozen in 0.5.0: they still run, print a warning and will be removed. New projects use `dewey build`, which writes a static site to `.dewey/site/`; see [Quickstart](./quickstart.md). This page is for sites already made with `create`.

The frozen commands keep two ownership records. `dewey generate` tracks agent-facing artifacts in `.dewey-generated.json`; `dewey create`, `update` and `eject` track the standalone site in `.dewey-manifest.json`. Review those ownership boundaries before forcing a write.

## Safe update workflow

Commit the site before an update so every scaffold change is reviewable.

```bash
bunx dewey update ./my-docs --dry-run
bunx dewey update ./my-docs
```

`update` classifies each current template file as current, safely updatable, missing/new, or modified. It updates Dewey-owned files whose recorded hash is unchanged and skips consumer-owned, ejected, or locally modified files. It never rewrites `package.json` or `docs/*.md` as part of normal scaffold maintenance.

Use `--force` only after inspecting the dry run:

```bash
bunx dewey update ./my-docs --dry-run
bunx dewey update ./my-docs --force
```

Forced, locally modified Dewey-owned scaffold files are copied into a timestamped `.dewey-backup/<snapshot>/...` tree before replacement. Consumer-owned and ejected files remain protected even with `--force`. Dewey keeps the five newest timestamped snapshots and removes older snapshots after a forced update.

## Recover or adopt a missing manifest

If `.dewey-manifest.json` is absent but the directory still has the recognizable generated structure, the first `dewey update` adopts it:

- Astro: detects `astro.config.mjs` plus `src/layouts/BaseLayout.astro`.
- Next.js: detects `next.config.js`, `next.config.mjs`, or `next.config.ts` plus `<site-root>/src/lib/dewey.tsx`.

The adoption pass records current hashes, template type, detected project/theme/default page where available, and consumer-owned settings. It writes `.dewey-manifest.json`, stops, and asks you to run `update` again. Review the adopted manifest before that second run. Unknown recorded themes produce a warning and resolve to `neutral`.

## Eject a Next.js component

Ejection transfers a component from Dewey-managed defaults to an explicit override:

```bash
# Compose the packaged default (recommended starting point)
bunx dewey eject Header ./my-docs

# Replace it completely
bunx dewey eject Header ./my-docs --full
```

Supported components are `Header`, `Sidebar`, `TableOfContents`, and `MarkdownContent`. Ejection is currently Next.js-only.

Before writing, Dewey verifies in memory that it can add the custom import and replace the component map in `<site-root>/src/lib/dewey.tsx`. If either rewrite cannot be proven, it reports the failed step and creates no override. Successful writes use temporary files and report the status of the override, wiring, and manifest if an I/O failure interrupts the operation.

The manifest records the override and its wiring as `owner: "ejected"` with a content hash, Dewey version, component name, and `wrap` or `full` mode. `update` will not reclaim these entries, including with `--force`; remove or deliberately revise the ejected ownership entries only when you want to restore Dewey defaults.

## Recovery checklist

1. Stop if the update/eject summary reports a partial write.
2. Inspect `git diff`, `.dewey-manifest.json`, and the latest timestamp under `.dewey-backup/`.
3. Restore from Git first when the site was committed; otherwise copy only the affected file from the newest backup snapshot.
4. For a missing manifest, run adoption once and review it before applying templates.
5. Run the site build and the relevant route/component smoke check after recovery.

## Release workflow

Releases use `packages/docs/package.json` as the package-version source of truth and require an exact matching `v<version>` tag. From a clean checkout:

1. Finalize `CHANGELOG.md`, package version, `dewey.config.ts`, and lockfile.
2. Run `bun run check`.
3. Regenerate artifacts and confirm `.dewey-generated.json`, root artifacts, and `agent/` have no drift.
4. Run `bun run verify:package`.
5. Commit the release candidate so the checkout is clean and the tested package is reviewable.
6. Run `bun run verify:release-smoke` to pack, install in an isolated consumer, import the public API, run the packed CLI `init` and `build` in a fixture, then `create` and build a generated Next.js site. If it fails, fix and commit, then rerun.
7. Create the exact tag only after the smoke passes, then let the publish workflow repeat package and smoke verification.

The release smoke script requires a clean checkout and removes its isolated temporary directory whether it passes or fails. See `RELEASING.md` for the authoritative repository checklist.

## Related

- [CLI Reference](./cli.md) — commands, including [Frozen commands](./cli.md#frozen-commands)
- [Integrate into an existing site](./integrate-existing-site.md) — use components without a standalone scaffold
- [API Reference](./api.md) — package, component, theme, and artifact contracts

---

<!-- source: docs/overview.md -->

# Overview

Dewey keeps a project's docs usable by people and by coding agents, and checks that they still match the code. From one folder of Markdown it writes a front door for agents (`AGENTS.md`), an agent index (`llms.txt`) and a static docs site.

## The loop

```
dewey init     # once: front door, draft maps and guide, skills, first site build
dewey build    # site in .dewey/site, llms.txt, .md copies, llms-full.txt
dewey check    # maps, reviews, references, front door, site links, freshness
```

`init` sets the project up. After that, you edit Markdown, run `build`, and run `check`. When covered code changes, `check` asks for a review; you reread the doc, fix it, and run `dewey review <doc>`.

## What init creates

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Front door: purpose, hard rules, and a marked region Dewey keeps up to date (scripts, source areas, maps) |
| `docs/quickstart.md` | Draft task guide |
| `docs/<area>.agent.md` | Draft map for each source area, such as `docs/src.agent.md` |
| `SKILL.md` | For agents using the project from outside |
| `.agents/skills/dewey-author/SKILL.md` | For agents maintaining the docs |
| `.dewey/project.json` | Project name, purpose, rules and site settings |
| `.dewey/site/`, `llms.txt` | The first build |

Drafts carry `draft: true`. The site builds from them right away, but `check` fails until you finish them and remove that line.

## Kinds of doc

Every doc declares a `kind` in its frontmatter.

| Kind | Audience | On the site | Notes |
|------|----------|-------------|-------|
| `guide` | People and agents | Yes | Task-shaped: how to do something |
| `reference` | People and agents | Yes | API, CLI and config contracts |
| `map` | Agents | No | Declares `covers`, the source files it describes |
| `history` | Record | No | Plans, decisions, reports |

A map covers part of the source tree:

```yaml
---
kind: map
covers: [src/sync/**]
title: Sync implementation
---
```

Each source file belongs to exactly one map. `dewey uncovered` lists files no map covers, and `dewey which <path>` finds the docs that cover a file.

## What check verifies

`dewey check` exits 1 and lists issues when:

- a doc is still a draft or has invalid frontmatter
- a source file has no map, or two maps cover the same file
- covered code changed since the doc was last reviewed
- `AGENTS.md`, `SKILL.md` or a host pointer file is missing, or the front door is over 150 lines or about 2,000 tokens
- a cited path, package script, shell command or `path#symbol` does not exist
- a local link or anchor is broken, or a human page is missing from navigation
- `llms.txt` or the site is out of date

Each issue has a code, a file, a line when there is one, and a fix. A pass means references, coverage, reviews and outputs agree. It does not prove the prose is true.

## Agent outputs

`build` writes, next to each HTML page, a `.md` copy. It also writes `.dewey/site/llms.txt` (one line per page, with its size), `.dewey/site/llms-full.txt` (every guide and reference in one file), `.dewey/site/nav.json`, and the marked index region of the root `llms.txt`.

## The docs site

The site works with JavaScript off. One small script adds search, dark mode, the phone menu and the Copy page menu. By default it looks like deweydocs.com. A `skin` or a `site` block in `.dewey/project.json` changes the theme, accent, fonts, logo, CSS and header links. See [CLI Reference](./cli.md#site-settings).

## Frozen commands

The 0.4 commands `audit`, `generate`, `agent`, `create`, `update` and `eject` still run, print a warning, and will be removed. See [Frozen commands](./cli.md#frozen-commands).

## Package extras

The `@deweydocs/dewey` package also exports React components for rendering docs inside an existing app ([Integrate into an existing site](./integrate-existing-site.md)), theme CSS, and prompt templates ([Skills](./skills.md)).

## Quick links

- [Quickstart](./quickstart.md) - init, author, review, build, check
- [CLI Reference](./cli.md) - Every command and its options
- [API Reference](./api.md) - TypeScript, React, theme and artifact exports
- [Integrate into an existing site](./integrate-existing-site.md) - React/Next.js embed guide
- [Skills](./skills.md) - Prompt templates and the skills init writes
- [Maintaining generated sites](./maintenance.md) - Frozen site commands and release checks

---

<!-- source: docs/quickstart.md -->

# Quickstart

Requires Node.js 18+ or Bun 1.3+.

| Step | Command | Result |
|------|---------|--------|
| 1. Install | `bun add -d @deweydocs/dewey` | Local `dewey` binary |
| 2. Init | `bunx dewey init --purpose "…" --rule "…"` | Front door, drafts, skills, first site build |
| 3. Author | Edit the drafts in `docs/` | Real guide and maps |
| 4. Review | `bunx dewey review docs/src.agent.md` | Review recorded for each map |
| 5. Build | `bunx dewey build` | `.dewey/site/` and `llms.txt` |
| 6. Check | `bunx dewey check` | Pass, or a list of issues with fixes |

### 1. Install

```bash
bun add -d @deweydocs/dewey
```

`npm install -D @deweydocs/dewey` and `npx dewey` work the same. For a one-off run without installing, use `bunx @deweydocs/dewey <command>`.

### 2. Initialize

Run from the project root:

```bash
bunx dewey init \
  --purpose "Count lines in log files" \
  --rule "Never write to input files"
```

- `--purpose` defaults to the `description` in `package.json`, then to the README's first paragraph.
- Repeat `--rule` for each hard rule, or pass `--no-rules` to declare none.
- In a terminal, init asks for anything missing. In CI or a script, it fails and asks for the flags.
- Pass `--host <file>` (repeatable) to write a pointer file, such as a tool-specific instruction file, that redirects to `AGENTS.md`.

For a project with `src/index.ts` and `src/sync/index.ts`, init writes:

```
AGENTS.md
SKILL.md
llms.txt
.agents/skills/dewey-author/SKILL.md
.dewey/project.json
.dewey/site/
docs/quickstart.md        # draft guide
docs/src.agent.md         # draft map, covers src/*
docs/src-sync.agent.md    # draft map, covers src/sync/*
```

In a repo that already has docs, init keeps your files. It appends a marked region to an existing `AGENTS.md` and `llms.txt`, leaves existing guides, maps, `SKILL.md` and host files alone, and adds a `kind` to docs that lack one, guessed from the path. If anything fails, it restores every file it touched.

### 3. Author the drafts

Open each draft and replace the comments with what the code does. A map lists its files, data flow, and invariants and traps. The guide states a task, its prerequisites and how to tell it worked. Remove `draft: true` from each file when it is done.

To add docs later:

```bash
bunx dewey new guide "Deploy to staging"   # docs/deploy-to-staging.md
bunx dewey new reference "CLI flags"       # docs/reference/cli-flags.md
bunx dewey new history "Why JSONL"         # docs/history/<date>-why-jsonl.md
bunx dewey new map src/net                 # docs/src-net.agent.md
```

### 4. Review the maps

After you have checked a map against the code, record it:

```bash
bunx dewey review docs/src.agent.md
bunx dewey review docs/src-sync.agent.md
```

This stores hashes of the doc and the files it covers in `.dewey/reviews.json`. When covered code changes, `check` reports `REVIEW_REQUIRED` and names the files that changed. `build` never records a review for you.

### 5. Build

```bash
bunx dewey build
```

Writes the static site to `.dewey/site/`, a `.md` copy of each page, `llms-full.txt`, `nav.json`, and refreshes the marked regions of `AGENTS.md` and `llms.txt`. To look at it:

```bash
python3 -m http.server 4387 --bind 127.0.0.1 --directory .dewey/site
```

### 6. Check

```bash
bunx dewey check
bunx dewey check --json   # for CI
```

On a fresh init, check fails with `DOC_DRAFT` and `REVIEW_REQUIRED`. Once the drafts are done and reviewed and the site is built, it prints:

```
Dewey check passed: references, coverage, reviews and outputs are consistent. It does not prove the prose is true.
```

Check exits 1 on any issue. Each issue prints `path:line CODE message` followed by a fix.

---

## Next steps

- Commit `.dewey/project.json` and `.dewey/reviews.json` so CI checks against the same reviewed baseline.
- Run `dewey build` and `dewey check` in CI.
- Use `dewey which <path>` before changing code to find the docs that cover it, and `dewey uncovered` to find files no map covers.
- Change the site's look with a `skin` or `site` block in `.dewey/project.json` ([site settings](./cli.md#site-settings)).
- [CLI Reference](./cli.md) · [Skills](./skills.md) · [Integrate into an existing site](./integrate-existing-site.md)

---

<!-- source: docs/skills.md -->

Skills are instructions for agents, not code. They say how to do a task, what to check and what counts as done.

## Skills init writes

`dewey init` writes two skill files. It leaves either alone if it already exists.

| File | For | Contents |
|------|-----|----------|
| `SKILL.md` | Agents using the project from outside | Points to the quickstart and `llms.txt`, lists the project's rules, and says not to treat maps or history as the public interface |
| `.agents/skills/dewey-author/SKILL.md` | Agents maintaining the docs | The authoring loop: `dewey check --json`, `which`, `new`, `review`, `build`, then `check`; keeping the front door within 150 lines |

`dewey check` reports `SKILL_MISSING` if `SKILL.md` is missing. Edit `SKILL.md` to suit the project; the authoring skill works as written.

## Prompt templates

The package also exports prompt templates. They do not inspect a repository or change files; you paste them into an agent with the context they ask for.

| Skill | Purpose | Usage |
|-------|---------|-------|
| `docsReviewAgent` | Reviews doc quality page-by-page — catches stale content, missing sections, unclear explanations, broken links | `Use the docsReviewAgent skill to review docs/overview.md` |
| `promptSlideoutGenerator` | Generates AI-consumable prompt configurations for documentation pages | `Use promptSlideoutGenerator to create prompt config for the API page` |
| `docsDesignCritic` | Critiques page structure and visual design — heading hierarchy, component usage, information density | `Use docsDesignCritic to critique docs/quickstart.md` |
| `installMdGenerator` | Creates install.md files following the [installmd.org](https://installmd.org) spec | `Use installMdGenerator to create install.md from dewey.config.ts` |
| `improveAIPrompts` | Iteratively discovers prompt opportunities, drafts self-contained contracts, reviews them, and refines the result | `Use improveAIPrompts.passes.discovery.prompt`, then draft/review/refine passes |

`improveAIPrompts` is the public name. `improveAIPromptsSkill` is exported only as a deprecated compatibility alias and references the same object.

```ts
import { improveAIPrompts } from '@deweydocs/dewey'

const discovery = improveAIPrompts.passes.discovery.prompt
const review = improveAIPrompts.passes.review.prompt
  .replace('{PASTE_DRAFT}', draft)
```

The pass prompts guide an LLM; they do not inspect a repository or rewrite files by themselves. Supply the requested context, evaluate the model output against the included quality criteria, and retain human review for project-specific constraints.

---

## Creating Custom Skills

Skills live as markdown files in your project:

```
.agents/skills/
  my-skill.md
```

Each skill follows a consistent structure:

<div class="doc-file-block">
<div class="doc-file-bar">my-skill.md</div>

```markdown
# Skill Name

Brief description of what this skill does.

## When to Use

- Situation 1
- Situation 2

## Instructions

Step-by-step guide for the AI agent:

1. First, check X
2. Then, do Y
3. Finally, verify Z

## Example

Show an example input and expected output.
```

</div>

## Best Practices

| Do | Don't |
|----|-------|
| Be specific and actionable | Use vague instructions |
| Include examples | Assume context |
| Define success criteria | Leave outcomes ambiguous |
| Reference file paths | Use relative descriptions |

---

<!-- source: docs/agent/api.agent.md -->

# Dewey API - Agent Context

## Purpose

Public contracts for `@deweydocs/dewey`. The CLI (`init`, `build`, `check`) is the primary product; TypeScript artifact APIs enable retrieval automation; React/theme APIs are optional presentation.

## Source of truth

| Surface | Source path |
|---|---|
| Main public exports | `packages/docs/src/index.ts` |
| Package subpaths | `packages/docs/package.json` |
| Config schema | `packages/docs/src/cli/schema.ts` |
| CLI commands/options | `packages/docs/src/cli/index.ts` |
| Artifact API | `packages/docs/src/cli/agent-artifacts.ts` |
| Ownership planner | `packages/docs/src/cli/generation-plan.ts` |
| Theme registry | `packages/docs/src/themes.ts` |
| React contracts | `packages/docs/src/components/` |
| Navigation types | `packages/docs/src/types/page-tree.ts` |
| Legacy types | `packages/docs/src/types.ts` |
| Structured agent content | `packages/docs/src/utils/agent-content.ts` |

## Surface selection

| Goal | Use |
|---|---|
| Set up a project | `bunx dewey init` |
| Site, `llms.txt`, `AGENTS.md` region | `bunx dewey build` |
| Consistency gate | `bunx dewey check` / `--json` |
| Typed config for frozen commands | `defineConfig` from `@deweydocs/dewey` (`dewey.config.ts`) |
| Programmatic retrieval/build/write | `@deweydocs/dewey/agent-artifacts` |
| Existing React/Next UI | components from `@deweydocs/dewey` + CSS subpaths |
| Standalone docs UI | `bunx dewey build` → `.dewey/site/` (frozen: `dewey create`) |

Invariant: the CLI is the product contract. React components and generated sites are optional human-facing layers. Frozen `audit`, `generate`, `agent`, `create`, `update`, `eject` still run with a warning.

## Package subpaths

| Import | Contract |
|---|---|
| `@deweydocs/dewey` | Main JS/types |
| `@deweydocs/dewey/react` | Exact compatibility alias of main JS/types |
| `@deweydocs/dewey/agent-artifacts` | Artifact JS/types |
| `@deweydocs/dewey/css` | Full CSS |
| `@deweydocs/dewey/styles` | Full CSS alias |
| `@deweydocs/dewey/css/base.css` | Base CSS |
| `@deweydocs/dewey/css/tokens` | Semantic token CSS |
| `@deweydocs/dewey/css/tailwind` | Tailwind-oriented CSS |
| `@deweydocs/dewey/css/colors/{theme}.css` | Explicit per-theme CSS export; no wildcard |
| `@deweydocs/dewey/tailwind` | Tailwind preset JS/types |

## Config

```ts
import { defineConfig } from '@deweydocs/dewey'

export default defineConfig({
  project: { name: 'pkg', type: 'npm-package', version: '1.0.0' },
  agent: {
    criticalContext: ['Use Bun'],
    entryPoints: { API: 'src/index.ts' },
    rules: [{ pattern: '*.test.ts', instruction: 'Use bun:test.' }],
    sections: [],
  },
  docs: {
    path: './docs',
    output: './',
    required: ['overview', 'quickstart', 'api'],
  },
  install: {
    objective: 'Install pkg.',
    prerequisites: ['Node.js 18+'],
    steps: [{ description: 'Install', command: 'bun add pkg' }],
    doneWhen: { command: 'bun test', expectedOutput: 'all tests pass' },
  },
})
```

`defineConfig(input): DeweyConfig` parses with Zod and throws on invalid input.

| Config path | Type | Default/required |
|---|---|---|
| `project.name` | `string` | required |
| `project.tagline` | `string?` | optional |
| `project.type` | `ProjectType` | `'generic'` |
| `project.version` | `string?` | optional |
| `agent.criticalContext` | `string[]` | `[]` |
| `agent.entryPoints` | `Record<string,string>` | `{}` |
| `agent.rules` | `AgentRule[]` | `[]` |
| `agent.sections` | `string[]` | `[]`; empty = every human-readable doc |
| `docs.path` | `string` | `'./docs'` |
| `docs.output` | `string` | `'./'` |
| `docs.required` | `string[]` | `['overview','quickstart']` |
| `install.objective` | `string?` | optional |
| `install.doneWhen` | `{command:string;expectedOutput?:string}?` | optional |
| `install.prerequisites` | `string[]` | `[]` |
| `install.steps` | `{description:string;command?:string;alternatives?:{condition:string;command:string}[]}[]` | `[]` |
| `install.hostedUrl` | `string?` | optional |

`ProjectType = 'macos-app' | 'npm-package' | 'cli-tool' | 'react-library' | 'monorepo' | 'generic'`.

Main config types: `AgentRule`, `DeweyConfig`, `InstallConfig`, `ProjectType`.

## Artifact API

Import only from `@deweydocs/dewey/agent-artifacts`.

| Export | Contract |
|---|---|
| `collectMarkdownArtifacts(options?)` | `Promise<MarkdownArtifact[]>`; recursive `.md`/`.mdx`, deterministic sort |
| `getMarkdownArtifact(slug, options?)` | `Promise<MarkdownArtifact|null>`; normalized slug/source lookup |
| `getPromptArtifact(promptId, options?)` | `Promise<MarkdownArtifact|null>`; prompt lookup |
| `parseDocArtifact(filePath, raw?, options?)` | `Promise<MarkdownArtifact>` |
| `buildAgentManifest(docs, {project?,includeContent?}?)` | `AgentManifest` |
| `buildPromptRegistry(docs, {project?,includeContent?}?)` | schema-versioned registry object |
| `buildContextBundle(docs, slugs, title?)` | Markdown `string` |
| `buildAgentArtifactFiles(options?)` | in-memory generated file set; no apply |
| `writeAgentArtifacts(options?)` | plans and optionally applies writes; returns `docs`, `prompts`, `written`, `changed`, `deleted`, `operations` |

```ts
import {
  collectMarkdownArtifacts,
  buildAgentManifest,
  writeAgentArtifacts,
} from '@deweydocs/dewey/agent-artifacts'

const input = { rootDir: process.cwd(), docsDir: './docs' }
const project = { name: 'pkg', version: '1.0.0' }
const docs = await collectMarkdownArtifacts(input)
const manifest = buildAgentManifest(docs, { project })
const preview = await writeAgentArtifacts({
  ...input,
  outputDir: './generated',
  project,
  dryRun: true,
})
console.log(manifest.recommendedReadOrder, preview.operations)
```

| Type | Fields |
|---|---|
| `CollectMarkdownArtifactsOptions` | `rootDir?`, `docsDir?` |
| `WriteAgentArtifactsOptions` | previous + `outputDir?`, `project?`, `dryRun?`, `overwrite?` |
| `AgentArtifactsProject` | `name`, `version?`, `tagline?`, `repository?` |
| `MarkdownHeading` | `depth`, `text`, `anchor` |
| `MarkdownArtifact` | `id`, `slug`, `kind`, `promptId?`, `title`, `description`, `sourcePath`, `url`, `rawUrl`, `promptUrl?`, `frontmatter`, `headings`, `tokensEstimate`, `rawMarkdown`, `content` |

Other exported artifact types: `AgentManifest`, `AgentManifestEntry`, `PromptManifestEntry`.

`MarkdownArtifactKind = 'doc' | 'agent' | 'prompt' | 'reference' | 'proposal'`.

| Slug/path condition, first match | Kind |
|---|---|
| starts `prompts/` | `prompt` |
| starts `agent/` or ends `.agent` | `agent` |
| starts `reference/` | `reference` |
| starts `proposals/` | `proposal` |
| otherwise | `doc` |

Write semantics: `dryRun` never applies; desired unowned outputs block unless `overwrite`; stale deletion is limited to Dewey-owned outputs in `agentArtifacts` scope.

## Themes

```text
ThemeName = ThemePreset =
'neutral' | 'ocean' | 'emerald' | 'purple' | 'dusk' | 'rose' | 'github' |
'warm' | 'midnight' | 'editorial' | 'mono' | 'hudson' | 'ink' | 'slate'
```

| Export | Contract |
|---|---|
| `THEME_REGISTRY` | canonical name -> `{cssFile,generatedSite}` |
| `PUBLISHED_CSS_THEMES` | readonly presets with CSS |
| `VALID_THEMES` | readonly presets accepted by generated sites |
| `isThemeName(string)` | type guard |
| `resolveTheme(string?)` | valid theme or `'neutral'` fallback |

All current themes are published and generated-site-valid. Pair `theme="ocean"` with `@deweydocs/dewey/css/colors/ocean.css`.

Custom `ThemeConfig`: `preset?: ThemePreset`; `colors?: {primary?,background?,foreground?,accent?}`; `fonts?: {sans?,mono?}`.

## React minimal example

```tsx
'use client'
import {
  AutoTableOfContents,
  CopyButtons,
  DeweyProvider,
  MarkdownContent,
} from '@deweydocs/dewey'
import '@deweydocs/dewey/css/base.css'
import '@deweydocs/dewey/css/tokens'
import '@deweydocs/dewey/css/colors/ocean.css'

export function Page({ markdown, agentMarkdown }: {
  markdown: string
  agentMarkdown: string
}) {
  return (
    <DeweyProvider theme="ocean">
      <CopyButtons markdownContent={markdown} agentContent={agentMarkdown} />
      <MarkdownContent content={markdown} />
      <AutoTableOfContents markdown={markdown} />
    </DeweyProvider>
  )
}
```

Provider rule: components using Dewey context hooks require `DeweyProvider`. Next App Router: provider/interactive layer is client; filesystem/static-param work is server.

## Component contracts

| Value export | Required props | Optional contract |
|---|---|---|
| `DeweyProvider` | `children` | `components`, `theme`, `defaultDark`, `storageKey` |
| `DocsApp` | `docs: Record<string,string>` | `config`, `currentPage`, `providerProps`; `onNavigate` reserved/not invoked |
| `DocsIndex` | `tree: PageNode[]` | `projectName`, `tagline`, `description`, `basePath`, `hero`, `showSearch`, `heroIcon`, `quickLinks`, `layout?: 'stacked'|'columns'` |
| `Header` | none | `projectName`, `homeUrl`, `backUrl`, `backLabel`, `label`, `showThemeToggle`, `actions` |
| `Sidebar` | `tree` | `currentPage`, `projectName`, `basePath`, `isOpen`, `onClose`, `header`, `footer` |
| `MarkdownContent` | `content` | `isDark` |
| `TableOfContents` | none | `items`, `title`, `className`, `scrollOffset` |
| `AutoTableOfContents` | none | `markdown`, `containerRef`, `title`, `className` |
| `Callout` | `children` | `type`, `title` |
| `Tabs` / `Tab` | `children`; Tab: `label` | Tabs: `defaultTab` |
| `Steps` / `Step` | `children`; Step: `title` | — |
| `Card` | `title` | `description`, `icon`, `href`, `children` |
| `CardGrid` | `children` | `columns?: 2|3|4` |
| `FileTree` | `items` | `defaultExpanded`; item `type?: 'file'|'folder'` |
| `ApiTable` | `properties` | `title` |
| `Badge` | `children` | `variant`, `size?: 'sm'|'md'` |
| `CopyButtons` | `markdownContent` | `agentContent`, `showLabels`, `onCopy`, `className` |
| `AgentContext` | `content` | `title`, `defaultExpanded`, `className` |
| `PromptSlideout` | `isOpen`, `onClose`, `info`, `starterTemplate` | `title`, `description`, `params`, `examples`, `expectedOutput`, `className` |

`DocsLayout` is router-neutral: it uses plain anchors by default and accepts `LinkComponent` plus `currentPage` for host integration. `DocsLayoutProps` is re-exported from main. `CodeBlock` and `HeadingLink` values are public; their prop interfaces are not exported.

## Component/navigation unions

```text
CalloutType = 'info' | 'warning' | 'tip' | 'danger'
BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
CopyButtons.onCopy type = 'markdown' | 'agent' | 'plain'
PageNode.type = 'page' | 'folder' | 'separator'
Page/navigation badgeColor = 'info' | 'success' | 'warning' | 'error' | 'default'
DocsAppConfig.layout.header = boolean | 'minimal'
legacy BadgeColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose'
legacy DocSection.level = 2 | 3
```

## Main module runtime exports

| Group | Names |
|---|---|
| Config | `defineConfig` |
| Themes | `PUBLISHED_CSS_THEMES`, `THEME_REGISTRY`, `VALID_THEMES`, `isThemeName`, `resolveTheme` |
| App/provider | `DocsApp`, `DocsAppDefault`, `DocsIndex`, `DeweyProvider`, `useDewey`, `useTheme`, `useComponents`, `useLink` |
| Layout/content | `Header`, `DocsLayout`, `MarkdownContent`, `CodeBlock`, `HeadingLink`, `Sidebar`, `TableOfContents`, `AutoTableOfContents`, `useActiveSection`, `extractTocItems`, `extractTocFromDom` |
| UI | `Callout`, `Tabs`, `Tab`, `Steps`, `Step`, `Card`, `CardGrid`, `FileTree`, `ApiTable`, `Badge` |
| Agent UI | `CopyButtons`, `AgentContext`, `PromptSlideout` |
| Skills | `promptSlideoutGenerator`, `docsReviewAgent`, `docsDesignCritic`, `installMdGenerator`, `improveAIPrompts`, `improveAIPromptsSkill` |
| Hooks/utils | `useDarkMode`, `useTableOfContents`, `extractSections`, `cn`, `resolveIcon`, `commonIcons` |
| Agent content | `agentContent`, `AgentContentBuilder`, `renderAgentMarkdown`, `renderAgentJson`, `renderAgentPlainText` |

## Main module type exports

| Group | Names |
|---|---|
| Config/themes | `AgentRule`, `DeweyConfig`, `InstallConfig`, `ProjectType`, `ThemeDefinition`, `ThemeName`, `ThemePreset` |
| App/provider | `DocsAppProps`, `DocsAppConfig`, `DocsIndexProps`, `DeweyProviderProps`, `DeweyContextValue`, `ThemeConfig`, `FrameworkComponents` |
| Components | `HeaderProps`, `DocsLayoutProps`, `MarkdownContentProps`, `SidebarProps`, `AutoTocProps`, `TableOfContentsProps`, `TocItem`, `CalloutProps`, `CalloutType`, `TabsProps`, `TabProps`, `StepsProps`, `StepProps`, `CardProps`, `CardGridProps`, `FileTreeProps`, `FileTreeItem`, `ApiTableProps`, `ApiProperty`, `BadgeProps`, `BadgeVariant`, `CopyButtonsProps`, `AgentContextProps`, `PromptSlideoutProps`, `PromptParam` |
| Skills/content | `PromptSlideoutConfig`, `DocsReviewResult`, `DocsDesignCritiqueResult`, `InstallMdConfig`, `PromptImprovementPass`, `PromptQualityCriteria`, `AgentContent`, `AgentSection`, `TableSection`, `EnumSection`, `CodeSection`, `TextSection`, `ListSection` |
| Navigation/utils | `PageTree`, `PageNode`, `PageItem`, `PageFolder`, `PageSeparator`, `FlatPage`, `NavigationConfig`, `NavigationGroup`, `NavigationItem`, `CommonIconName` |
| Legacy | `NavItem`, `NavGroup`, `DocSection`, `BadgeColor`, `PageLink`, `DocsConfig` |

## Skills are prompts

| Export | Result type | Meaning |
|---|---|---|
| `docsReviewAgent` | `DocsReviewResult` | LLM prompt set: correctness/drift review |
| `docsDesignCritic` | `DocsDesignCritiqueResult` | LLM prompt set: structure/design critique |
| `promptSlideoutGenerator` | `PromptSlideoutConfig` | LLM prompt set: slideout authoring |
| `installMdGenerator` | `InstallMdConfig` | LLM prompt set: install.md authoring |
| `improveAIPrompts` | `PromptImprovementPass` / `PromptQualityCriteria` | Iterative prompt discovery, draft, review, refinement |

`improveAIPromptsSkill`: deprecated runtime alias, identical object.

## Router and theme contract

- `DocsLayout`: no React Router dependency; default plain anchor; optional `LinkComponent`; optional explicit `currentPage`; browser pathname fallback.
- `react-router-dom`: not a package peer dependency.
- Fourteen themes × light/dark resolve one `--dw-*` semantic contract across runtime CSS, components, Tailwind, and generated sites.
- Required categories: surface/foreground; primary/secondary/accent pairs; border/ring; info/warning/error/success pairs; code/syntax; sidebar/header; fonts/radii/shadows/motion.
- Automated proof: token completeness/dead-token rejection, WCAG AA text pairs, focus, reduced motion, semantic/component checks, and 28 Playwright screenshots.

## Structured agent content

```ts
import { agentContent, renderAgentMarkdown } from '@deweydocs/dewey'

const content = agentContent('api', 'API', 'Public contracts')
  .enums('Themes', { ThemePreset: ['neutral', 'ocean'] })
  .code('Import', 'ts', "import { defineConfig } from '@deweydocs/dewey'")
  .build()

const markdown = renderAgentMarkdown(content)
```

Runtime: `agentContent`, `AgentContentBuilder`, `renderAgentMarkdown`, `renderAgentJson`, `renderAgentPlainText`.

Types: `AgentContent`, `AgentSection`, `TableSection`, `EnumSection`, `CodeSection`, `TextSection`, `ListSection`.

---

<!-- source: docs/agent/cli.agent.md -->

# Dewey CLI

| Command | Inputs | Writes | Purpose |
|---|---|---|---|
| `dewey init` | `--purpose`, `--rule` (repeat), `--no-rules`, `--host` (repeat) | front door, skills, `.dewey/project.json`, drafts, first build | Set up a project |
| `dewey build` | none | `.dewey/site/`, root `llms.txt` `index` region, `AGENTS.md` `observed` region, `.dewey/outputs.json` | Build site and agent index |
| `dewey check` | `--json` | none | Consistency gate; exit 0/1 |
| `dewey review <doc>` | doc with `covers` | `.dewey/reviews.json` | Record review |
| `dewey new <kind> <name>` | kind: map, guide, reference, history | draft doc | Scaffold; refuses existing file |
| `dewey which <path>` | `--json` | none | Docs covering a path |
| `dewey uncovered` | `--json` | none | Uncovered source files by area |

## init

- Non-TTY needs `--purpose` (unless `package.json` description or README supplies it) and `--rule` or `--no-rules`.
- Refuses when `.dewey/site/` or `.dewey/outputs.json` exists without `.dewey/project.json`.
- Rerun in an initialized project: refresh `AGENTS.md` marked region + build; authored files never replaced.
- Adoption: keeps existing files; guesses missing `kind` (plans/specs/reports/proposals/decisions → history; reference/api → reference; else guide); no draft map for covered areas; restores all files on failure.

## build outputs

`.dewey/site/*.html`, `.dewey/site/**/*.md`, `.dewey/site/llms.txt`, `.dewey/site/llms-full.txt`, `.dewey/site/nav.json`. Maps and history are not published. Outputs hashed in `.dewey/outputs.json`; build stops if a target was hand-edited or not Dewey's. Build never records reviews.

## check JSON

`{ passed: boolean, issues: [{ code, path, line?, message, fix }] }`

| Area | Codes |
|---|---|
| Doc metadata | DOC_DRAFT, DOC_KIND, DOC_META, DOC_STATUS, DOC_COVERS, SUPERSEDES_MISSING |
| Coverage | MAP_MISSING, COVERAGE_OVERLAP, COVERAGE_BROAD, COVERAGE_EMPTY |
| Review | REVIEW_REQUIRED |
| Front door | FRONT_DOOR_MISSING, FRONT_DOOR_BUDGET, FRONT_DOOR_POINTER, SKILL_MISSING, REGION_STALE, REGION_INVALID |
| References | MISSING_PATH, MISSING_SCRIPT, MISSING_SYMBOL, UNKNOWN_COMMAND |
| Links/site | BROKEN_LINK, BROKEN_ANCHOR, NON_PUBLIC_LINK, SITE_LINK, NAV_MISSING |
| Outputs | STALE_OUTPUT, OUTPUT_OWNERSHIP |
| Packaging | PUBLISH_MISSING |

Front door budget: `AGENTS.md` + hosts ≤ 150 lines and ~2,000 tokens. Symbol citation: `path#symbol` (JS/TS declarations). `sh` fence commands must be a package bin, common tool, `./` script or listed in `commands`; `sh ignore` skips. Check does not run commands or fetch external links.

## Frontmatter

`kind` (guide|reference|map|history), `covers` (`*`, `**`, `?`; not leading `**`), `title`, `description`, `group`, `order`, `draft`, `status` (shipped|proposal|abandoned), `applies`, `supersedes`, `superseded_by`, `nav: false`.

## .dewey/project.json

`schemaVersion: 1`, `name`, `purpose`, `rules[]`, `hosts[]`, `commands[]`, `skin` (dewey|openscout|talkie|lattices|hudsonkit|ink), `site`:

| Field | Contract |
|---|---|
| theme | ThemePreset; implies skin ink; error with other skins |
| accent | CSS color or `{light,dark}` |
| fonts | `sans`, `heading`, `mono`, `stylesheet` |
| logo, css | project paths |
| home | `{href,label}` |
| links | `[{label,href}]` |

## Frozen

`audit`, `generate`, `agent`, `create`, `update`, `eject`: run, warn on stderr (not with `--json`), read `dewey.config.ts`. Replacements: audit/agent → check; generate/create → build; update/eject → none.

---

<!-- source: docs/agent/integrate-existing-site.agent.md -->

# Dewey embed contract (existing React / Next.js)

## Positioning

| Layer | Role | Required? |
|---|---|---|
| CLI `init` / `build` / `check` | Front door, `llms.txt`, `.dewey/site/`, consistency gate | Yes |
| React components + CSS | Optional human UI in host app | No |
| `dewey create` (frozen) | Scaffold standalone Next.js/Astro site | Existing sites only |

Embedding components does not replace `build` and `check`.

## Decision table

| Situation | Action |
|---|---|
| Existing React/Next app needs `/docs` | Embed components (this doc) |
| Static site is enough | `bunx dewey build`; serve `.dewey/site/` |
| Agents only | `bunx dewey build` + `check`; ignore the site |

## Install

```bash
bun add @deweydocs/dewey gray-matter
```

| Export | Use |
|---|---|
| `@deweydocs/dewey` | Canonical JS/TS imports |
| `@deweydocs/dewey/react` | **Same as main** — compatibility alias only |
| `@deweydocs/dewey/css` | Full CSS bundle |
| `@deweydocs/dewey/css/base.css` | Base |
| `@deweydocs/dewey/css/tokens` | `--dw-*` tokens |
| `@deweydocs/dewey/css/colors/<theme>.css` | Theme preset |
| `@deweydocs/dewey/tailwind` | Tailwind preset |
| `@deweydocs/dewey/agent-artifacts` | Programmatic collectors |

Router dependency: none. `react-router-dom` is not a peer dependency.

**Themes:** `neutral` \| `ocean` \| `emerald` \| `purple` \| `dusk` \| `rose` \| `github` \| `warm` \| `midnight` \| `editorial` \| `mono` \| `hudson` \| `ink` \| `slate`

## Onboarding sequence (shared)

| # | Step | Command / action |
|---|---|---|
| 1 | Install | `bun add @deweydocs/dewey gray-matter` |
| 2 | Init | `bunx dewey init --purpose "…" --no-rules` (once) |
| 3 | Author | Guides/references (`.md`), maps (`<area>.agent.md`, `kind: map`) |
| 4 | Review | `bunx dewey review docs/<area>.agent.md` |
| 5 | Build | `bunx dewey build` |
| 6 | Check | `bunx dewey check` / `--json` |
| 7 | Embed UI | Host routes + provider + loaders |

## Architecture (Next App Router)

| File | Runtime | Duty |
|---|---|---|
| `app/layout.tsx` | server | CSS imports, wrap `Providers` |
| `app/providers.tsx` | client | `DeweyProvider` + Next `Link`/`Image` |
| `app/docs/layout.tsx` | client (typical) | `Header` + `Sidebar` |
| `app/docs/[...slug]/page.tsx` | server | `getDocBySlug`, `generateStaticParams` |
| `app/docs/[...slug]/content.tsx` | client | `MarkdownContent`, TOC, `CopyButtons` |
| `lib/docs.ts` | server-only | Recursive fs + gray-matter |
| `lib/navigation.ts` | either | Nav from `docs.json` |

### Boundary rule

- Hooks / Dewey interactive UI → **client** (`'use client'`).
- `generateStaticParams` / fs / static export → **server**.
- Cross boundary: serializable props only (`DocData` strings/numbers).

### Prefer composed shell

Compose `Header`, `Sidebar`, `MarkdownContent`, `AutoTableOfContents` for maximum host control. `DocsLayout` is also router-neutral: default anchors, optional `LinkComponent`, optional `currentPage`, browser-path fallback.

## Theme proof contract

- Twelve presets; light and dark.
- Shared semantic `--dw-*` contract across components, CSS, Tailwind, generated sites.
- Categories: surfaces/foregrounds; primary/secondary/accent; border/ring; status pairs; code/syntax; sidebar/header; typography/radius/shadow/motion.
- Tests: complete/dead tokens, WCAG AA text pairs, focus, reduced motion, component semantics, 28 Playwright screenshots.

## Static export

```js
// next.config.js
module.exports = {
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@deweydocs/dewey'],
}
```

| Key | Required for |
|---|---|
| `output: 'export'` | Pure static `out/` |
| `images.unoptimized` | Next Image under export |
| `transpilePackages` | Bundle `@deweydocs/dewey` ESM |
| `generateStaticParams` | Pre-render every nested slug |

## Content discovery rules

| Rule | Value |
|---|---|
| Human pages | recursive `**/*.md` excluding `*.agent.md` |
| Agent colocated | `<slug>.agent.md` beside human file |
| Agent nested | `docs/agent/<slug>.agent.md` |
| Slug | path without `.md` (e.g. `guides/install`) |
| Maps | `*.agent.md` with `kind: map` are internal; `build` leaves them off the site. Filter on `kind` |
| Nav data | `.dewey/site/nav.json` from `build` (groups of `{title,summary,url,markdown,source}`); `docs.json` only from frozen `generate` |

## Provider snippet contract

```tsx
'use client'
import { DeweyProvider } from '@deweydocs/dewey'
import type { AnchorHTMLAttributes } from 'react'
import Link from 'next/link'

type DeweyLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
const DeweyLink = ({ href, ...props }: DeweyLinkProps) => <Link href={href} {...props} />

// theme: ThemePreset | ThemeConfig
// Adapt framework links to Dewey's required string-href contract.
<DeweyProvider theme="ocean" components={{ Link: DeweyLink }}>{children}</DeweyProvider>
```

Root `<html suppressHydrationWarning>` recommended for theme class hydration.

## Scripts (host package.json)

| Script | Command |
|---|---|
| `docs:build` | `dewey build` |
| `docs:check` | `dewey check` |
| `prebuild` | `docs:build` before `next build` when serving files from `.dewey/site/` |

## CI (minimum)

```bash
bun install
bunx dewey build
bunx dewey check
```

Check exits 1 on any issue. Commit `.dewey/project.json` and `.dewey/reviews.json`.

## Public agent URLs (optional)

| Artifact | URL example |
|---|---|
| `llms.txt` | `/llms.txt` |
| `AGENTS.md` | `/AGENTS.md` |
| `llms-full.txt` | `/llms-full.txt` |

Copy from `.dewey/site/` (and root `AGENTS.md`) after `build`, keeping relative `.md` paths.

## Monorepo

| Case | Approach |
|---|---|
| Docs at repo root | Resolve `docsDirectory` to monorepo root, not app `cwd` alone |
| Docs package | `dewey init` in that package; app depends on `@deweydocs/dewey` |
| Multi-app | `dewey build` once at root; copy from `.dewey/site/` |

## Anti-patterns

| Don't | Do |
|---|---|
| Treat embed as replacing `build`/`check` | Always run them |
| Import hooks in server `page.tsx` | Split page (server) / content (client) |
| Use only top-level `docs/*.md` walk | Recursive walk; nested routes |
| Prefer `@deweydocs/dewey/react` as different API | Import from `@deweydocs/dewey` |
| Frame as competing docs frameworks | Present as optional UI on agent pipeline |

## Related paths

| Doc | Role |
|---|---|
| `docs/integrate-existing-site.md` | Human narrative guide |
| `docs/quickstart.md` | Greenfield sequence |
| `docs/cli.md` | Flags |
| `docs/maintenance.md` | Frozen create/update/eject sites, release |
| `packages/docs/src/cli/templates/nextjs.ts` | Canonical scaffold reference (implementation, not consumer edit target) |

---

<!-- source: docs/agent/maintenance.agent.md -->

# Dewey generated-site maintenance contract

`create`, `update`, `eject`, `generate` are frozen in 0.5.0: run, warn, removal planned. New sites: `dewey build` → `.dewey/site/`. This contract covers existing `create` sites.

## Ownership manifests

| Surface | Manifest | Owner |
|---|---|---|
| Agent artifacts from `generate` | `.dewey-generated.json` | Generation planner/scopes |
| Standalone Astro/Next.js scaffold | `.dewey-manifest.json` | `create` / `update` / `eject` |

Do not conflate the manifests. Source `docs/*.md` and consumer `package.json` are not normal `update` targets.

## Update

```bash
bunx dewey update ./my-docs --dry-run
bunx dewey update ./my-docs
bunx dewey update ./my-docs --force
```

| State | Default behavior |
|---|---|
| Dewey-owned, recorded hash unchanged | Update safely |
| Already equal to current template | Leave current; refresh manifest metadata |
| Missing/new template file | Create |
| Consumer/ejected/locally modified | Skip |
| Modified Dewey-owned scaffold with `--force` | Back up, replace, remain `owner: dewey` |
| Consumer/ejected entry with `--force` | Stay protected; never reclaimed by `update` |

Backup contract: timestamped `.dewey-backup/<snapshot>/...`; retain five newest timestamped snapshots after forced updates.

## Manifest adoption

First `update` with no manifest:

| Template | Detection |
|---|---|
| Astro | `astro.config.mjs` + `src/layouts/BaseLayout.astro` |
| Next.js | one of `next.config.js` / `.mjs` / `.ts` + `<site-root>/src/lib/dewey.tsx` |

Action: write `.dewey-manifest.json`; infer template/current hashes and available project/theme/default-page settings; stop; require a second `update` run. Unknown theme warns and becomes `neutral`.

## Ejection

Supported Next.js components: `Header`, `Sidebar`, `TableOfContents`, `MarkdownContent`.

Modes:

- `wrap`: override composes packaged default.
- `full`: complete consumer implementation.

Pre-write proof: custom import exists in candidate `<site-root>/src/lib/dewey.tsx`; component mapping points to custom import. Proof failure => no override write. Successful file replacement uses temporary-file rename.

Manifest entries for override and wiring:

```text
owner: ejected
hash: content hash
version: Dewey version
component: component name
mode: wrap | full
```

`update` never reclaims consumer/ejected entries, including with `--force`. Restoring a default is an explicit ownership decision outside the update path.

## Recovery

1. Inspect command partial-write status and `git diff`.
2. Prefer Git restore from a committed pre-update state.
3. Otherwise restore only affected file from newest `.dewey-backup/<snapshot>/`.
4. Missing manifest: adopt once, inspect, rerun.
5. Build and smoke-check affected route/component.

## Release gate

| Order | Check |
|---|---|
| 1 | Clean checkout; changelog/package version/config/lock aligned |
| 2 | `bun run check` |
| 3 | Generate; no `.dewey-generated.json`, root-artifact, or `agent/` drift |
| 4 | `bun run verify:package` |
| 5 | Commit release candidate; checkout becomes clean/reviewable |
| 6 | `bun run verify:release-smoke`; fix + commit + rerun on failure |
| 7 | Exact `v<version>` tag only after smoke; publish workflow repeats verification |

Release smoke: real tarball; isolated consumer install/import; packed CLI `init` + `build` in a fixture, then `create` + generated Next.js build; clean-checkout precondition; temporary directory removed on pass/fail.

Authoritative repository procedure: `RELEASING.md`.

---

<!-- source: docs/agent/overview.agent.md -->

# dewey - Agent Context

## Package
@deweydocs/dewey

## Purpose
Keeps a project's docs usable by people and coding agents and checks they still match the code. One folder of Markdown produces `AGENTS.md` (front door), `llms.txt` (agent index) and a static site in `.dewey/site/`.

## CLI Commands

| Command | Action |
|---------|--------|
| `dewey init` | Front door, `SKILL.md`, author skill, `.dewey/project.json`, draft guide and maps, first build |
| `dewey build` | `.dewey/site/` (HTML, `.md` copies, `llms.txt`, `llms-full.txt`, `nav.json`); marked regions of root `llms.txt` and `AGENTS.md` |
| `dewey check [--json]` | Exit 1 on drafts, coverage gaps, stale reviews, broken references/links, front-door budget, stale outputs |
| `dewey review <doc>` | Record hashes of a covered doc and its files in `.dewey/reviews.json` |
| `dewey new <map\|guide\|reference\|history> <name>` | Draft doc |
| `dewey which <path>` | Docs covering a file or directory |
| `dewey uncovered` | Source files no map covers |

Frozen (warn, still run, read `dewey.config.ts`): `audit`, `generate`, `agent`, `create`, `update`, `eject`.

## Loop

`init` once → author drafts (remove `draft: true`) → `review` each map → `build` → `check`. Covered code changes → `REVIEW_REQUIRED` → reread, fix, `review`.

## Doc kinds (frontmatter `kind`)

| Kind | Site | Notes |
|------|------|-------|
| guide | yes | task-shaped |
| reference | yes | API/CLI/config contracts |
| map | no | `covers: [globs]`; each source file in exactly one map; usually `docs/<area>.agent.md` |
| history | no | plans, decisions, reports |

## Settings

`.dewey/project.json`: `schemaVersion`, `name`, `purpose`, `rules[]`, `hosts[]`, `commands[]`, `skin`, `site{theme,accent,fonts,logo,css,home,links}`. Contract: `docs/cli.md`.

Skins: dewey (default), openscout, talkie, lattices, hudsonkit, ink. `site.theme` implies ink; refused with other skins.

ThemePreset: 'neutral' | 'ocean' | 'emerald' | 'purple' | 'dusk' | 'rose' | 'github' | 'warm' | 'midnight' | 'editorial' | 'mono' | 'hudson' | 'ink' | 'slate'

## Package extras

React components for embedding docs in an existing app (`docs/integrate-existing-site.md`), theme CSS, prompt templates (`docs/skills.md`), artifact APIs (`docs/api.md`).

## Key Files

| Path | Purpose |
|------|---------|
| packages/docs/src/index.ts | Main exports |
| packages/docs/src/cli/index.ts | CLI entry |
| packages/docs/src/cli/fresh/ | init/build/check/review/new/which/uncovered |
| packages/docs/src/skills/ | Prompt templates |

---

<!-- source: docs/agent/quickstart.agent.md -->

# Dewey quickstart contract

Requires Node.js 18+ or Bun 1.3+. Run from the project root.

| Step | Command | Expected |
|---|---|---|
| Install | `bun add -d @deweydocs/dewey` | local `dewey` bin; one-off: `bunx @deweydocs/dewey <cmd>` |
| Init | `bunx dewey init --purpose "…" --rule "…"` (or `--no-rules`) | files below; first build |
| Author | edit drafts in `docs/`, remove `draft: true` | no `DOC_DRAFT` |
| Review | `bunx dewey review docs/<area>.agent.md` | `.dewey/reviews.json` |
| Build | `bunx dewey build` | `.dewey/site/`, root `llms.txt` region, `AGENTS.md` region |
| Check | `bunx dewey check` / `--json` | exit 0 and `Dewey check passed: …` |

## Init inputs

- `--purpose` default: `package.json` description, then README first paragraph.
- No TTY and missing rules → fails: `Supply --purpose and either --rule or --no-rules in non-interactive use.`
- `--host <file.md>` repeatable: pointer file redirecting to `AGENTS.md`.

## Init writes

`AGENTS.md`, `SKILL.md`, `llms.txt`, `.agents/skills/dewey-author/SKILL.md`, `.dewey/project.json`, `.dewey/outputs.json`, `.dewey/site/`, `docs/quickstart.md` (draft guide), one draft map per uncovered source area (`docs/src.agent.md` covers `src/*`; `docs/src-sync.agent.md` covers `src/sync/*`).

Existing repos: marked region appended to existing `AGENTS.md`/`llms.txt`; existing guides, maps, `SKILL.md`, host files kept; missing `kind` guessed from path; all-or-nothing restore on failure.

## Fresh check

Fails with `DOC_DRAFT` and `REVIEW_REQUIRED` until drafts are finished and maps reviewed.

## Later

`dewey new guide|reference|history|map <name>`, `dewey which <path>`, `dewey uncovered`. Commit `.dewey/project.json` and `.dewey/reviews.json`; run `build` + `check` in CI.

---

<!-- source: docs/agent/skills.agent.md -->

# Agent Skills.agent

<!-- dewey:generated owner=dewey -->
