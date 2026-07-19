# dewey

> Documentation toolkit for AI-agent-ready docs

## Critical Context

**IMPORTANT:** Read these rules before making any changes:

- Dewey is a docs AGENT, not a docs framework - focus on preparation and judgment, not presentation
- Skills are LLM prompts, not deterministic code - they guide agents
- Each doc page should have TWO versions: .md for humans, .agent.md for AI agents
- Agent versions should be dense, structured, self-contained - prefer tables over prose
- The www/ folder is a reference implementation only - do not invest in UI polish

## Project Structure

| Component | Path |
|-----------|------|
| Cli | `packages/docs/src/cli/` |
| Components | `packages/docs/src/components/` |
| Skills | `.claude/skills/` |

## Quick Navigation

- Working with **cli**? → Check packages/docs/src/cli/ for CLI commands
- Working with **component**? → Check packages/docs/src/components/ for React components
- Working with **skill**? → Check .claude/skills/ for LLM prompt templates
- Working with **config**? → Check dewey.config.ts for project configuration
- Working with **agent artifacts**? → Check packages/docs/src/cli/agent-artifacts.ts and `dewey generate --agent-artifacts`

## Overview

> Documentation toolkit for AI-agent-ready docs

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

## Quickstart

> Get your documentation agent-ready in under 5 minutes

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

## CLI Reference

> Dewey commands and their main options

Dewey audits documentation, generates agent-facing artifacts, and publishes the same Markdown through optional site templates.

## Run Dewey

Install Dewey in a project and use its local binary:

```bash
bun add -d @arach/dewey
bunx dewey --help
```

For a one-off run without installing it first, address the scoped package directly:

```bash
bunx @arach/dewey@latest --help
```

## Commands

| Command | Purpose |
|---|---|
| `dewey init` | Create a documentation structure and `dewey.config.ts` |
| `dewey audit` | Check documentation completeness and quality |
| `dewey generate` | Generate `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and `agent/` artifacts |
| `dewey agent` | Evaluate agent-readiness and recommend improvements |
| `dewey create <dir>` | Publish Markdown with a Next.js or Astro site template |
| `dewey update [dir]` | Refresh Dewey-owned files in a generated site |
| `dewey eject <component> [dir]` | Take ownership of a generated component |

## Project-aware initialization

`init --type` accepts `generic`, `npm-package`, `cli-tool`, `react-library`, `macos-app`, or `monorepo`. Invalid values fail with the complete valid-value list. The selected type changes the generated human/agent page pair, required-document configuration, installation defaults, verification command, and evidence that `audit` / `agent` expect.

```bash
bunx dewey init --type cli-tool
bunx dewey init --type react-library
bunx dewey init --type monorepo
```

| Type | Focus page | Evidence expected |
|---|---|---|
| `generic` | `architecture` | System structure plus a public interface or integration boundary |
| `npm-package` | `api` | Package-manager install command plus typed public API |
| `cli-tool` | `commands` | Commands/options plus executable shell usage |
| `react-library` | `components` | Component props plus JSX/TSX rendering example |
| `macos-app` | `architecture` | macOS lifecycle plus Swift/SwiftUI/Xcode evidence |
| `monorepo` | `packages` | Workspace organization plus package/application paths |

## Recommended order

`init` → author docs → `generate` → `audit` → `agent` → optional human UI.

| Goal | Path |
|---|---|
| Agent-ready artifacts only | Stop after `generate` / `audit` / `agent` |
| Docs UI inside an existing React/Next.js app | [Integrate into an existing site](./integrate-existing-site.md) |
| New standalone docs site | `dewey create <dir> --source ./docs --template nextjs` |

See [Quickstart](./quickstart.md) for the full onboarding sequence.

## Generate options

```bash
dewey generate --source ./docs --output ./generated
dewey generate --agents-md
dewey generate --llms-txt
dewey generate --docs-json
dewey generate --install-md
dewey generate --agent-artifacts
dewey generate --dry-run
dewey generate --overwrite
```

`--source` overrides `docs.path` for a run. An empty `agent.sections` array includes every human-readable Markdown document recursively; provide section IDs only when you want an explicit allowlist.

Before writing, `generate` prints a plan containing every create, update, preserve, and stale-file deletion. Use `--dry-run` to preview the same plan without creating the output directory or changing files. Dewey tracks owned outputs in `.dewey-generated.json`; unknown or edited desired files block the write. After reviewing the preview, `--overwrite` can explicitly replace those conflicts and adopt the resulting outputs.

`generate`, `create`, and the programmatic artifact API share one recursive discovery/frontmatter pipeline. A default `generate` builds the retrieval manifest once, derives link tables and bundles from that manifest, and keeps full content in purpose-built surfaces: raw Markdown and bundles, document content in `agent/docs.json`, and prompt content in `agent/prompts.json`. `agent/context.md` and `agent/context.json` are retrieval indexes, not additional full-content copies.

`llms.txt` summaries prefer frontmatter descriptions, then prose, lists, headings, and finally the page title. Prompt URLs normalize the `prompts/` prefix once. Generated installation commands preserve scoped package names such as `@scope/package`.

`create` uses the same discovered documents and then composes the agent-artifact writer into the new site. Generated Next.js and Astro package manifests pin the tested dependency versions; Pagefind is a declared dependency rather than an unpinned `bunx` download. Unknown themes emit a warning before falling back to `neutral`.

## Machine-readable checks

Both audit commands can emit JSON for CI and other tooling:

```bash
dewey audit --json
dewey agent --json
```

`audit` is deterministic structural validation. `agent` is evidence-based readiness coaching: it scores the documentation surface and recommends next actions, but does not write files.

Both JSON reports add:

- `projectType`: selected profile, label, pass/fail state, and the evidence found for each requirement.
- `drift`: `clean`, `issues`, or `not-applicable`, counts for checked pairs/source files/references/contracts, and structured issues.

Human output always summarizes project-type evidence and drift. Add `--verbose` for matched documents and issue codes. `audit` reports these findings as recommendations without changing its structural page score; `agent` uses project-type evidence in Project Context and uses unresolved contract drift when judging valid-value quality.

Drift checks cover missing/orphan `.agent.md` counterparts, missing cited source paths, human/agent literal-union mismatches, and literal union/enum differences between docs and conventional or configured source trees. The analysis is regex/evidence based: it does not prove semantic prose equivalence, execute examples, or understand arbitrary computed TypeScript types. Treat a clean report as a focused consistency check, not a substitute for review.

## Generated-site maintenance

`update` and `eject` have an ownership contract; see [Maintaining generated sites](./maintenance.md) for adoption, dry runs, ejected ownership, backups, and recovery. The obsolete `--refresh-nav` option has been removed: regenerate source artifacts with `dewey generate`, while `update` only refreshes Dewey-owned scaffold files.

## Error handling in automation

Commands reject invalid configuration and return a non-zero exit status. In CI, capture JSON only after checking the command succeeded:

```bash
if ! report="$(bunx dewey audit --json)"; then
  echo "Dewey audit failed before producing a valid report" >&2
  exit 1
fi
printf '%s\n' "$report"
```

## Skills

> Expert instructions that guide AI agents through specific documentation tasks

Skills are LLM prompts, not code. They're expert instructions that tell AI agents exactly how to perform a task — what to check, what to produce, and what success looks like.

## Built-in Skills

| Skill | Purpose | Usage |
|-------|---------|-------|
| `docsReviewAgent` | Reviews doc quality page-by-page — catches stale content, missing sections, unclear explanations, broken links | `Use the docsReviewAgent skill to review docs/overview.md` |
| `promptSlideoutGenerator` | Generates AI-consumable prompt configurations for documentation pages | `Use promptSlideoutGenerator to create prompt config for the API page` |
| `docsDesignCritic` | Critiques page structure and visual design — heading hierarchy, component usage, information density | `Use docsDesignCritic to critique docs/quickstart.md` |
| `installMdGenerator` | Creates install.md files following the [installmd.org](https://installmd.org) spec | `Use installMdGenerator to create install.md from dewey.config.ts` |
| `improveAIPrompts` | Iteratively discovers prompt opportunities, drafts self-contained contracts, reviews them, and refines the result | `Use improveAIPrompts.passes.discovery.prompt`, then draft/review/refine passes |

`improveAIPrompts` is the public name. `improveAIPromptsSkill` is exported only as a deprecated compatibility alias and references the same object.

```ts
import { improveAIPrompts } from '@arach/dewey'

const discovery = improveAIPrompts.passes.discovery.prompt
const review = improveAIPrompts.passes.review.prompt
  .replace('{PASTE_DRAFT}', draft)
```

The pass prompts guide an LLM; they do not inspect a repository or rewrite files by themselves. Supply the requested context, evaluate the model output against the included quality criteria, and retain human review for project-specific constraints.

---

## Creating Custom Skills

Skills live as markdown files in your project:

```
.claude/skills/
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

## API Reference

> Public TypeScript, React, theme, and agent-artifact APIs for @arach/dewey

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

## Integrate into an existing site

> Embed Dewey docs components in an existing React or Next.js app while keeping agent generation as the core contract

Dewey is a **docs agent** first: it audits, scores, and generates agent-ready artifacts (`AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and the `agent/` retrieval surface). The React components are an **optional presentation layer** so the same Markdown can power a human-facing docs UI inside a site you already own.

This guide is for teams that already have a React or Next.js app and want docs under a route such as `/docs` — without running `dewey create` as a separate site. For a greenfield docs site, see [Quickstart](./quickstart.md) and `dewey create`.

## When to embed vs scaffold

| Path | Use when |
|------|----------|
| **Embed components** (this guide) | You already have React/Next.js routing, layout, design system, or deploy pipeline |
| **`dewey create`** | You want a standalone docs site generated from Markdown |
| **Generate only** | You need agent artifacts and no docs UI |

Embedding does not replace `dewey init` / `audit` / `generate` / `agent`. Keep the CLI pipeline for judgment and retrieval; use components only to render Markdown for humans.

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| Node.js 18+ | |
| Bun 1.3+ (recommended) | Examples below use Bun |
| React 18 or 19 | Peer dependency of `@arach/dewey` |
| Next.js App Router | Patterns below target App Router; adapt for Pages Router if needed |
| Existing Markdown under `docs/` | Prefer the [agent content pattern](./overview.md#agent-content-pattern): `.md` + `.agent.md` |

## Package and CSS installation

```bash
bun add @arach/dewey gray-matter
```

- Runtime dependency (not only `-d`) when the site imports Dewey components.
- `gray-matter` is the usual choice for frontmatter when you load files from disk (same approach as `dewey create --template nextjs`).
- No router package is required by Dewey. `react-router-dom` is not a peer dependency; pass a framework link adapter where needed.

### CSS entry points

Import base styles, design tokens, and one color theme in a root layout or global CSS entry:

```tsx
// app/layout.tsx (or app/docs/layout.tsx)
import '@arach/dewey/css/base.css'
import '@arach/dewey/css/tokens'
import '@arach/dewey/css/colors/ocean.css'
```

| Export | Purpose |
|--------|---------|
| `@arach/dewey/css` | Full bundle (base + tokens + default theme wiring) |
| `@arach/dewey/css/base.css` | Reset and base rules |
| `@arach/dewey/css/tokens` | Semantic `--dw-*` CSS variables |
| `@arach/dewey/css/colors/<theme>.css` | Color preset |
| `@arach/dewey/styles` | Alias of the full CSS bundle |
| `@arach/dewey/tailwind` | Tailwind preset for `--dw-*` utilities |

**Themes:** `neutral`, `ocean`, `emerald`, `purple`, `dusk`, `rose`, `github`, `warm`, `midnight`, `editorial`, `mono`, `hudson`.

Tokens use the `--dw-*` prefix so they rarely collide with a host design system. Dark mode follows a `.dark` class on an ancestor (DeweyProvider manages this when you use the provider).

The complete semantic contract covers surfaces and foregrounds; primary, secondary, and accent pairs; border/ring; info, warning, error, and success pairs; code and syntax colors; sidebar/header colors; typography, radii, shadows, and motion. Every public component and generated theme consumes this contract. The package verifies WCAG AA pairs, focus and reduced motion, plus 24 representative Playwright screenshots (12 themes × light/dark).

### Import path note

`@arach/dewey` and `@arach/dewey/react` resolve to the **same** module surface. Prefer `@arach/dewey` in new code; treat `/react` as a compatibility alias, not a separate React-only package.

```tsx
import {
  DeweyProvider,
  Header,
  Sidebar,
  MarkdownContent,
  AutoTableOfContents,
  CopyButtons,
} from '@arach/dewey'
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

This mirrors what `dewey create --template nextjs` scaffolds, without forcing a separate project.

## Server-to-client wrapper

Dewey layout and content components use React hooks (theme, TOC scroll-spy, copy buttons). In the App Router they must run as **client** components. Static export and `generateStaticParams` must run on the **server**.

**Pattern:** server page loads and serializes doc data → client content component renders Dewey UI.

### 1. Client provider

```tsx
// app/providers.tsx
'use client'

import { DeweyProvider } from '@arach/dewey'
import type { DeweyProviderProps } from '@arach/dewey'
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
import '@arach/dewey/css/base.css'
import '@arach/dewey/css/tokens'
import '@arach/dewey/css/colors/ocean.css'
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

import { MarkdownContent, AutoTableOfContents, CopyButtons } from '@arach/dewey'
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
  transpilePackages: ['@arach/dewey'],
}

module.exports = nextConfig
```

| Setting | Why |
|---------|-----|
| `output: 'export'` | Emits a static `out/` directory |
| `images.unoptimized` | Required when using `output: 'export'` with Next Image |
| `transpilePackages: ['@arach/dewey']` | Ensures Dewey ESM ships correctly through Next’s bundler |

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

Match Dewey’s generate behavior: an empty `agent.sections` array includes every human-readable Markdown document recursively.

### Optional navigation from `docs.json`

After `bunx dewey generate`, import the generated manifest for sidebar groups:

```ts
// lib/navigation.ts
import docsJson from '../../docs.json'
import type { PageNode } from '@arach/dewey'

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

Regenerate `docs.json` whenever nav or page set changes so the UI and agent artifacts stay aligned.

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

Pair the CSS file (`@arach/dewey/css/colors/purple.css`) with the matching `theme` prop so tokens and components stay in sync.

Optional Tailwind:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import deweyPreset from '@arach/dewey/tailwind'

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
import { Header, Sidebar } from '@arach/dewey'
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
import { DocsLayout, MarkdownContent } from '@arach/dewey'

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

## Dewey generation alongside the site

Keep agent generation in the **same repository** as the host app. Components render Markdown; generation produces retrieval artifacts for agents and CI.

### Onboarding sequence (shared with greenfield)

| Step | Command | Role |
|------|---------|------|
| 1. Install | `bun add @arach/dewey gray-matter` | Package on the site; CLI available via `bunx` |
| 2. Init (once) | `bunx dewey init` | `docs/` + `dewey.config.ts` if missing |
| 3. Author | Write `.md` + `.agent.md` | Human and agent sources |
| 4. Generate | `bunx dewey generate` | Artifacts + `docs.json` for nav/retrieval |
| 5. Audit | `bunx dewey audit` | Deterministic structure/completeness checks |
| 6. Score | `bunx dewey agent` | Agent-readiness judgment (0–100) |
| 7. Render | Your Next/React routes | Optional human UI (this guide) |
| 8. Optional scaffold | `bunx dewey create …` | Only if you want a **separate** generated site |

Suggested `package.json` scripts:

```json
{
  "scripts": {
    "docs:generate": "bunx dewey generate",
    "docs:audit": "bunx dewey audit",
    "docs:agent": "bunx dewey agent",
    "prebuild": "bun run docs:generate",
    "dev": "next dev",
    "build": "next build"
  }
}
```

Custom paths:

```bash
bunx dewey generate --source ./content/docs --output ./public
```

`--source` overrides `docs.path` for one run. Empty `agent.sections: []` includes all human Markdown recursively.

### Serve agent files from the static host

Copy or generate into `public/` (or your static asset root) so agents can fetch:

| Artifact | Typical public URL |
|----------|-------------------|
| `llms.txt` | `/llms.txt` |
| `AGENTS.md` | `/AGENTS.md` |
| `install.md` | `/install.md` |
| `agent/**` | `/agent/**` |

Example: set `docs.output` (or `--output`) to `public` for files you want deployed with the site, or add a small copy step after generate.

## CI

Enforce documentation quality without blocking only on the UI build:

```yaml
# .github/workflows/docs.yml (illustrative)
name: docs
on:
  pull_request:
    paths: ['docs/**', 'dewey.config.ts', 'package.json']

jobs:
  dewey:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunx dewey generate
      - run: bunx dewey audit --json
      - run: bunx dewey agent --json
      # Optional: fail if score below policy by parsing agent JSON in a follow-up step
```

| Command | CI use |
|---------|--------|
| `dewey generate` | Ensure artifacts are reproducible and committed or built in-pipeline |
| `dewey audit --json` | Machine-readable structure checks |
| `dewey agent --json` | Machine-readable readiness score |

Run generate **before** `next build` when the app imports `docs.json` or serves files from `public/`.

## Monorepo notes

| Setup | Approach |
|-------|----------|
| Docs package + app package | Point `--source` at the docs package path; depend on `@arach/dewey` from the app |
| Shared `docs/` at repo root | `process.cwd()` in Next is the app package — set `docsDirectory` to a path relative to the monorepo root (or symlink `docs` into the app) |
| Generate once for many apps | Run `dewey generate` at the repo root; publish `agent/` and `docs.json` as static assets |

## Checklist

- [ ] `@arach/dewey` + CSS theme imported
- [ ] `DeweyProvider` in a client `Providers` wrapper with Next `Link` / `Image`
- [ ] Server `page.tsx` + client `content.tsx` split
- [ ] `generateStaticParams` covers recursive slugs (if static export)
- [ ] Recursive loader skips `.agent.md` for routes but loads agent siblings for `CopyButtons` / agent view
- [ ] `bunx dewey generate` (and optional audit/agent) in local and CI pipelines
- [ ] Agent artifacts reachable at stable URLs if you expose them publicly

## Related

- [Quickstart](./quickstart.md) — full init → generate → optional create sequence
- [CLI Reference](./cli.md) — flags for generate, audit, agent, create
- [Overview](./overview.md) — product positioning and agent content pattern
- [Skills](./skills.md) — LLM prompt skills for review and install.md
- [Maintaining generated sites](./maintenance.md) — update/eject ownership, adoption, backups, recovery, and release checks

For a ready-made Next.js project instead of embedding, use:

```bash
bunx dewey create my-docs --source ./docs --template nextjs --theme ocean
cd my-docs && bun install && bun run dev
```

## Maintaining generated sites

> Safely adopt, update, eject, recover, and release Dewey-generated sites

Dewey separates source documentation from the optional generated site. `dewey generate` owns agent-facing artifacts through `.dewey-generated.json`; `dewey create`, `update`, and `eject` maintain the standalone site through `.dewey-manifest.json`. Review those ownership boundaries before forcing a write.

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
6. Run `bun run verify:release-smoke` to pack, install in an isolated consumer, import the public API, exercise packed CLI `init`/`generate`, and build a generated Next.js site. If it fails, fix and commit, then rerun.
7. Create the exact tag only after the smoke passes, then let the publish workflow repeat package and smoke verification.

The release smoke script requires a clean checkout and removes its isolated temporary directory whether it passes or fails. See `RELEASING.md` for the authoritative repository checklist.

## Related

- [CLI Reference](./cli.md) — command flags and generation semantics
- [Integrate into an existing site](./integrate-existing-site.md) — use components without a standalone scaffold
- [API Reference](./api.md) — package, component, theme, and artifact contracts

---
Generated by [Dewey 0.3.7](https://github.com/arach/dewey)

<!-- dewey:generated owner=dewey -->
