---
title: API Reference
description: Dense contract for Dewey's public TypeScript, React, theme, and artifact APIs
order: 5
group: Reference
groupId: reference
---

# Dewey API - Agent Context

## Purpose

Public contracts for `@arach/dewey`. CLI generation/audit is the primary product; TypeScript artifact APIs enable retrieval automation; React/theme APIs are optional presentation.

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
| Generate agent artifacts | `bunx dewey generate` |
| Deterministic structural validation | `bunx dewey audit` |
| Evidence-based readiness score | `bunx dewey agent` |
| Typed config | `defineConfig` from `@arach/dewey` |
| Programmatic retrieval/build/write | `@arach/dewey/agent-artifacts` |
| Existing React/Next UI | components from `@arach/dewey` + CSS subpaths |
| Standalone docs UI | `bunx dewey create` |

Invariant: CLI/artifact generation is the product contract. React components and generated sites are optional human-facing layers. Maintain human `.md` + dense `.agent.md` pairs.

## Package subpaths

| Import | Contract |
|---|---|
| `@arach/dewey` | Main JS/types |
| `@arach/dewey/react` | Exact compatibility alias of main JS/types |
| `@arach/dewey/agent-artifacts` | Artifact JS/types |
| `@arach/dewey/css` | Full CSS |
| `@arach/dewey/styles` | Full CSS alias |
| `@arach/dewey/css/base.css` | Base CSS |
| `@arach/dewey/css/tokens` | Semantic token CSS |
| `@arach/dewey/css/tailwind` | Tailwind-oriented CSS |
| `@arach/dewey/css/colors/{theme}.css` | Explicit per-theme CSS export; no wildcard |
| `@arach/dewey/tailwind` | Tailwind preset JS/types |

## Config

```ts
import { defineConfig } from '@arach/dewey'

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

Import only from `@arach/dewey/agent-artifacts`.

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
} from '@arach/dewey/agent-artifacts'

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
'warm' | 'midnight' | 'editorial' | 'mono' | 'hudson'
```

| Export | Contract |
|---|---|
| `THEME_REGISTRY` | canonical name -> `{cssFile,generatedSite}` |
| `PUBLISHED_CSS_THEMES` | readonly presets with CSS |
| `VALID_THEMES` | readonly presets accepted by generated sites |
| `isThemeName(string)` | type guard |
| `resolveTheme(string?)` | valid theme or `'neutral'` fallback |

All current themes are published and generated-site-valid. Pair `theme="ocean"` with `@arach/dewey/css/colors/ocean.css`.

Custom `ThemeConfig`: `preset?: ThemePreset`; `colors?: {primary?,background?,foreground?,accent?}`; `fonts?: {sans?,mono?}`.

## React minimal example

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
- Twelve themes × light/dark resolve one `--dw-*` semantic contract across runtime CSS, components, Tailwind, and generated sites.
- Required categories: surface/foreground; primary/secondary/accent pairs; border/ring; info/warning/error/success pairs; code/syntax; sidebar/header; fonts/radii/shadows/motion.
- Automated proof: token completeness/dead-token rejection, WCAG AA text pairs, focus, reduced motion, semantic/component checks, and 24 Playwright screenshots.

## Structured agent content

```ts
import { agentContent, renderAgentMarkdown } from '@arach/dewey'

const content = agentContent('api', 'API', 'Public contracts')
  .enums('Themes', { ThemePreset: ['neutral', 'ocean'] })
  .code('Import', 'ts', "import { defineConfig } from '@arach/dewey'")
  .build()

const markdown = renderAgentMarkdown(content)
```

Runtime: `agentContent`, `AgentContentBuilder`, `renderAgentMarkdown`, `renderAgentJson`, `renderAgentPlainText`.

Types: `AgentContent`, `AgentSection`, `TableSection`, `EnumSection`, `CodeSection`, `TextSection`, `ListSection`.
