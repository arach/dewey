# Core Documentation

| Kind | Title | Source | Raw markdown |
|------|-------|--------|--------------|
| doc | Overview | `docs/overview.md` | /agent/raw/docs/overview.md |
| doc | Quickstart | `docs/quickstart.md` | /agent/raw/docs/quickstart.md |
| doc | API Reference | `docs/api.md` | /agent/raw/docs/api.md |

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

The `@arach/dewey` package also exports React components for rendering docs inside an existing app ([Integrate into an existing site](./integrate-existing-site.md)), theme CSS, and prompt templates ([Skills](./skills.md)).

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
| 1. Install | `bun add -d @arach/dewey` | Local `dewey` binary |
| 2. Init | `bunx dewey init --purpose "…" --rule "…"` | Front door, drafts, skills, first site build |
| 3. Author | Edit the drafts in `docs/` | Real guide and maps |
| 4. Review | `bunx dewey review docs/src.agent.md` | Review recorded for each map |
| 5. Build | `bunx dewey build` | `.dewey/site/` and `llms.txt` |
| 6. Check | `bunx dewey check` | Pass, or a list of issues with fixes |

### 1. Install

```bash
bun add -d @arach/dewey
```

`npm install -D @arach/dewey` and `npx dewey` work the same. For a one-off run without installing, use `bunx @arach/dewey <command>`.

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

<!-- source: docs/api.md -->

# API Reference

Dewey’s primary product surface is the CLI: `dewey init`, `build` and `check` (see [CLI Reference](./cli.md)). The TypeScript API supports typed configuration for the frozen 0.4 pipeline, programmatic artifact retrieval, theme CSS, prompt templates, and an optional React presentation layer. The public module is defined by `packages/docs/src/index.ts`; package subpaths are defined by `packages/docs/package.json`.

## Choose the right surface

| Goal | Surface | Import or command |
|---|---|---|
| Set up docs, front door and site | CLI | `bunx dewey init` |
| Build the site, `llms.txt`, `.md` copies and `llms-full.txt` | CLI | `bunx dewey build` |
| Check maps, reviews, references and outputs | CLI | `bunx dewey check` |
| Collect or build 0.4 retrieval artifacts in code | Artifact subpath | `@arach/dewey/agent-artifacts` |
| Render Markdown in an existing React app | Optional UI | `@arach/dewey` + CSS subpaths |
| Style a site with a house skin | CSS subpath | `@arach/dewey/css/skins/<name>.css` |
| Type-check a `dewey.config.ts` for the frozen commands | Main TypeScript module | `@arach/dewey` |

The React components render Markdown for people inside an app you already have. They do not replace `dewey build`, which writes its own static site.

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
| `@arach/dewey/css/skins/<name>.css` | One site skin: `dewey`, `openscout`, `talkie`, `lattices`, `hudsonkit`, `atlas`, `endpoint`, `terminal` |
| `@arach/dewey/tailwind` | Tailwind preset module |

There is no wildcard color export. `<theme>` must be one of the fourteen published names listed under [Themes](#themes).

## Configuration API

`defineConfig` parses and returns a `DeweyConfig`; it is not just a TypeScript identity helper. `dewey.config.ts` is read only by the frozen commands (`audit`, `generate`, `agent`, `create`, `update`, `eject`); `init`, `build` and `check` use `.dewey/project.json` instead. Invalid values throw a Zod validation error. Its source is `packages/docs/src/cli/schema.ts`.

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
