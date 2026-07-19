# Core Documentation

| Kind | Title | Source | Raw markdown |
|------|-------|--------|--------------|
| doc | Overview | `docs/overview.md` | /agent/raw/docs/overview.md |
| doc | Quickstart | `docs/quickstart.md` | /agent/raw/docs/quickstart.md |
| doc | API Reference | `docs/api.md` | /agent/raw/docs/api.md |

---

<!-- source: docs/overview.md -->

# Overview

Dewey is a documentation toolkit that prepares your docs for AI agents. It audits, scores, and exports structured documentation artifacts without requiring a specific rendering framework.

## What Dewey Does

Dewey is a **docs agent**, not a docs framework. It focuses on:

- **Auditing** - Validates documentation completeness and quality
- **Scoring** - Rates agent-readiness on a 0-100 scale
- **Generating** - Creates AGENTS.md, llms.txt, docs.json, install.md, and the `agent/` retrieval surface
- **Exporting** - Publishes recursive raw markdown, manifests, prompt registries, and context bundles
- **Publishing** - Optionally scaffolds a static doc site from your markdown
- **Reviewing** - Skills that catch drift between docs and codebase

## Key Concepts

### Agent Content Pattern

Each documentation page should have two versions:

| Version | Audience | Style |
|---------|----------|-------|
| `.md` | Humans | Narrative, explanatory |
| `.agent.md` | AI agents | Dense, structured, self-contained |

### Skills System

Skills are LLM prompts, not code. Built-in skills:

- `docsReviewAgent` - Reviews docs quality page-by-page
- `docsDesignCritic` - Critiques page structure and visual design
- `promptSlideoutGenerator` - Generates AI-consumable prompt configs
- `installMdGenerator` - Creates install.md following installmd.org
- `improveAIPrompts` - Iterative discovery, drafting, review, and refinement prompts; `improveAIPromptsSkill` remains as a deprecated alias

### install.md Standard

Follows the [installmd.org](https://installmd.org) specification. LLM-executable:

```bash
curl https://your-project.com/install.md | claude
```

## CLI Commands

```
dewey init      Create docs/ folder and dewey.config.ts
dewey audit     Check documentation completeness
dewey generate  Create agent-ready files and retrieval artifacts
dewey agent     Score agent-readiness (0-100)
dewey create    Optional static docs site from markdown
```

## Onboarding path

Use one sequence for every project (details in [Quickstart](./quickstart.md)):

**init → author → generate → audit → agent → (optional UI)**

| Optional UI | Guide |
|-------------|--------|
| Embed in an existing React/Next.js app | [Integrate into an existing site](./integrate-existing-site.md) |
| Scaffold a standalone docs site | `dewey create` (see [CLI](./cli.md)) |

Agent artifacts from `generate` are the product contract. Components and `create` are presentation options on top of that contract.

`init` and the judgment commands are project-aware. The selected project type changes the scaffold and the evidence expected from docs. `audit` and `agent` also report focused source/human/agent drift: paired-file coverage, cited paths, and literal union/enum contracts. These checks are evidence based and do not replace semantic review or executable examples.

Generation and optional site creation share one recursive document model. Retrieval indexes are derived from one manifest, while full content stays in purpose-built document, prompt, raw, and bundle surfaces instead of being cloned into every JSON file.

## Quick Links

- [Quickstart](./quickstart.md) - Coherent init → generate → audit → agent sequence
- [Integrate into an existing site](./integrate-existing-site.md) - React/Next.js embed guide
- [CLI Reference](./cli.md) - All commands and options
- [API Reference](./api.md) - Public TypeScript, React, theme, and artifact contracts
- [Skills](./skills.md) - Built-in LLM prompt templates
- [Maintaining generated sites](./maintenance.md) - Ownership, upgrades, ejection, recovery, and release verification

---

<!-- source: docs/quickstart.md -->

Requires Node.js 18+ and Bun 1.3+ (recommended) or npm.

## Onboarding sequence

One path from empty docs to agent-ready artifacts. Optional steps are marked.

| Step | Command / action | What you get |
|------|------------------|--------------|
| 1. Install | `bun add -d @arach/dewey` | Local CLI |
| 2. Init | `bunx dewey init` | `docs/` + `dewey.config.ts` |
| 3. Configure | Edit `dewey.config.ts` | Project context, agent rules, install steps |
| 4. Author | Write `.md` and `.agent.md` | Human + agent source pages |
| 5. Generate | `bunx dewey generate` | `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, `agent/` |
| 6. Audit | `bunx dewey audit` | Deterministic completeness checks |
| 7. Score | `bunx dewey agent` | Agent-readiness score (0–100) and recommendations |
| 8a. Embed (optional) | Components in your React/Next app | Human UI on an **existing** site — [integration guide](./integrate-existing-site.md) |
| 8b. Create (optional) | `bunx dewey create my-docs --source ./docs --theme ocean` | **Standalone** static docs site |

Core contract is steps 1–7 (especially **generate**). Publishing a site is optional.

### 1. Install

```bash
bun add -d @arach/dewey
```

When you will import React components into an app, install as a runtime dependency instead: `bun add @arach/dewey`. See [Integrate into an existing site](./integrate-existing-site.md).

### 2. Initialize

```bash
bunx dewey init
```

Creates a `docs/` folder with starter templates and a `dewey.config.ts` configuration file.

Choose a project type so the scaffold and later evidence checks match the product:

```bash
bunx dewey init --type npm-package
# generic | npm-package | cli-tool | react-library | macos-app | monorepo
```

Every type creates paired human and agent pages. The focus page and defaults vary: API for npm packages, command reference for CLIs, component reference for React libraries, architecture for generic/macOS projects, and workspace mapping for monorepos. An invalid type fails instead of silently using `generic`.

### 3. Configure

<div class="doc-file-block">
<div class="doc-file-bar">dewey.config.ts</div>

```typescript
export default {
  project: {
    name: 'your-project',
    tagline: 'What your project does',
    type: 'npm-package', // or cli-tool, react-library, etc.
  },

  agent: {
    criticalContext: [
      // Rules AI agents MUST know
      'NEVER do X when Y',
    ],
    entryPoints: {
      'main': 'src/',
    },
  },

  install: {
    objective: 'Install and configure your-project.',
    steps: [
      { description: 'Install', command: 'bun add your-project' },
    ],
  },
}
```

</div>

### 4. Write docs

Create pages in the `docs/` folder:

```
docs/
  overview.md          # Project introduction
  quickstart.md        # Getting started guide
  api.md               # API reference
  overview.agent.md    # Agent-optimized version (or docs/agent/overview.agent.md)
```

### 5. Generate agent files

```bash
bunx dewey generate
```

Outputs `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and an `agent/` retrieval surface with raw markdown, prompt registries, manifests, and context bundles.

The same canonical document discovery powers `generate`, the optional `create` scaffold, and the artifact API. Full content is materialized deliberately: document bodies in `agent/docs.json`, prompts in `agent/prompts.json`, and Markdown in `agent/raw/docs/` plus bundles. Context files remain compact retrieval indexes.

### 6. Audit

```bash
bunx dewey audit
# CI-friendly:
bunx dewey audit --json
```

Structural and completeness checks plus project-type evidence and focused documentation drift. JSON output includes structured `projectType` and `drift` objects. Prefer fixing audit findings before treating the score as a release gate.

### 7. Check your score

<div class="doc-file-block">
<div class="doc-file-bar">bunx dewey agent</div>

```
Agent Readiness Report
Overall Score: 75/100 (Grade: C)

Categories:
✓ Project Context: 20/25
○ Agent-Optimized Files: 20/30
...
```

</div>

```bash
bunx dewey agent --json   # machine-readable for CI
```

### 8. Optional: human-facing docs UI

**Already have a React or Next.js site?** Embed Dewey components under a `/docs` route:

→ [Integrate into an existing site](./integrate-existing-site.md)

**Want a standalone docs site from the same Markdown?**

```bash
bunx dewey create my-docs --source ./docs --theme ocean
cd my-docs && bun install && bun run dev
```

Generates a static docs site when you want a separate publishing path alongside agent artifacts.

The scaffold pins tested Next.js/Astro dependencies and runs the same agent-artifact writer, so it starts with both a human site and the retrieval contract. For later adoption, updates, ejection, backups, and recovery, see [Maintaining generated sites](./maintenance.md).

---

## Next steps

- Create `.agent.md` versions of your docs for denser, structured content
- Add skills to `.claude/skills/` for custom agent-guided reviews
- Run `bunx dewey audit` and `bunx dewey agent` in CI (`--json`)
- Embed components or use `dewey create` only when you need a human site
- [CLI Reference](./cli.md) · [Skills](./skills.md) · [Existing-site guide](./integrate-existing-site.md)
- [Maintaining generated sites](./maintenance.md) — ownership, update, eject, recovery, and release checks

---

<!-- source: docs/api.md -->

# API Reference

Dewey’s primary product surface is the CLI: use it to audit documentation and generate agent-ready artifacts. The TypeScript API supports typed configuration, programmatic artifact retrieval, and an optional React presentation layer. The public module is defined by `packages/docs/src/index.ts`; package subpaths are defined by `packages/docs/package.json`.

## Choose the right surface

| Goal | Surface | Import or command |
|---|---|---|
| Generate `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and `agent/` | CLI | `bunx dewey generate` |
| Validate structure or score readiness | CLI | `bunx dewey audit` / `bunx dewey agent` |
| Author a type-checked `dewey.config.ts` | Main TypeScript module | `@arach/dewey` |
| Collect or build retrieval artifacts in code | Artifact subpath | `@arach/dewey/agent-artifacts` |
| Render Markdown in an existing React app | Optional UI | `@arach/dewey` + CSS subpaths |
| Scaffold a standalone docs site | Optional UI | `bunx dewey create` |

The React components do not replace generation. Keep `.md` and `.agent.md` source pairs, run the CLI pipeline, and add UI only when humans need a rendered site.

## Package entry points

| Package path | Contents |
|---|---|
| `@arach/dewey` | Configuration helper, themes, React components, hooks, skills, utilities, and types |
| `@arach/dewey/react` | Compatibility alias for the same module as `@arach/dewey` |
| `@arach/dewey/agent-artifacts` | Markdown collection, manifests, bundles, and ownership-safe artifact writing |
| `@arach/dewey/css` | Full CSS bundle |
| `@arach/dewey/styles` | Alias for the full CSS bundle |
| `@arach/dewey/css/base.css` | Base component styles |
| `@arach/dewey/css/tokens` | Semantic `--dw-*` tokens |
| `@arach/dewey/css/tailwind` | Tailwind-oriented CSS |
| `@arach/dewey/css/colors/<theme>.css` | One published color preset |
| `@arach/dewey/tailwind` | Tailwind preset module |

There is no wildcard color export. `<theme>` must be one of the twelve published names listed under [Themes](#themes).

## Configuration API

`defineConfig` parses and returns a `DeweyConfig`; it is not just a TypeScript identity helper. Invalid values throw a Zod validation error. Its source is `packages/docs/src/cli/schema.ts`.

```ts
// dewey.config.ts
import { defineConfig } from '@arach/dewey'

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

Import this surface from `@arach/dewey/agent-artifacts`, implemented in `packages/docs/src/cli/agent-artifacts.ts`.

```ts
import {
  buildAgentManifest,
  collectMarkdownArtifacts,
  getMarkdownArtifact,
  writeAgentArtifacts,
} from '@arach/dewey/agent-artifacts'

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
} from '@arach/dewey'
import '@arach/dewey/css/base.css'
import '@arach/dewey/css/tokens'
import '@arach/dewey/css/colors/ocean.css'

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
} from '@arach/dewey'

const input = process.env.DOCS_THEME
const theme: ThemeName = resolveTheme(input) // invalid or missing -> 'neutral'

if (input && !isThemeName(input)) {
  console.warn(`Choose one of: ${VALID_THEMES.join(', ')}`)
}

console.log(THEME_REGISTRY[theme].cssFile)
```

`ThemeName` and `ThemePreset` contain the same values:

`'neutral' | 'ocean' | 'emerald' | 'purple' | 'dusk' | 'rose' | 'github' | 'warm' | 'midnight' | 'editorial' | 'mono' | 'hudson'`

`PUBLISHED_CSS_THEMES` lists presets with CSS exports; `VALID_THEMES` lists presets accepted by generated sites. Every current registry entry belongs to both lists. `resolveTheme` falls back to `'neutral'`.

All twelve presets resolve the same semantic contract in light and dark: surfaces/foregrounds, primary/secondary/accent pairs, border/ring, info/warning/error/success pairs, code and syntax colors, sidebar/header colors, typography, radii, shadows, and motion. Runtime components and generated sites consume semantic `--dw-*` variables; public components do not own literal color palettes.

Contract tests verify every preset and generated-site theme in both modes, reject missing/dead tokens, require WCAG AA text pairs and visible focus, and check reduced-motion behavior. `bun run --cwd packages/docs test:visual` renders representative navigation, prose, controls, semantic states, code, and tables for 12 themes × light/dark and compares 24 Playwright screenshots.

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
} from '@arach/dewey'

const api = agentContent('api', 'API', 'Public package contracts')
  .enums('Themes', { ThemePreset: ['neutral', 'ocean'] })
  .code('Import', 'ts', "import { defineConfig } from '@arach/dewey'")
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

<!-- dewey:generated owner=dewey -->
