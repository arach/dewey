# dewey - Agent Context

## Package
@arach/dewey

## Purpose
Documentation toolkit that prepares docs for AI agents. Generates standard agent files, recursive retrieval artifacts, and optional static docs sites.

## CLI Commands

| Command | Action |
|---------|--------|
| `dewey init` | Create docs/ + dewey.config.ts |
| `dewey audit` | Validate completeness |
| `dewey generate` | Create AGENTS.md, llms.txt, docs.json, install.md, agent/ artifacts |
| `dewey agent` | Score agent-readiness (0-100 pts) |
| `dewey create` | Optional static docs site from markdown |

## Onboarding path

`init` → author → `generate` → `audit` → `agent` → optional UI

| Optional UI | Doc |
|-------------|-----|
| Embed existing React/Next | `docs/integrate-existing-site.md` |
| Standalone scaffold | `dewey create` |

Public TypeScript, React, theme, and artifact contracts: `docs/api.md`.

## Generated Files

| File | Purpose |
|------|---------|
| AGENTS.md | Combined docs with critical context |
| llms.txt | Plain text for LLMs |
| docs.json | Structured JSON |
| install.md | LLM-executable installation (installmd.org) |

## Retrieval Artifacts

| File | Purpose |
|------|---------|
| agent/manifest.json | Discovery index |
| agent/docs.json | Document entries with non-prompt content |
| agent/prompts.json | Prompt registry with prompt content |
| agent/context.md | Compact retrieval index |
| agent/context.json | JSON retrieval index |
| agent/raw/docs/ | Raw markdown mirror |

## Skills (LLM Prompts)

| Skill | Purpose |
|-------|---------|
| docsReviewAgent | Review quality, catch drift |
| docsDesignCritic | Critique page structure and visual design |
| promptSlideoutGenerator | Generate prompt configs |
| installMdGenerator | Create install.md |
| improveAIPrompts | Iterative prompt discovery/draft/review/refinement; public name |
| improveAIPromptsSkill | Deprecated alias of `improveAIPrompts` |

## Components (22)

Entry: DocsApp, DocsIndex
Layout: DocsLayout, Header, Sidebar, TableOfContents
Content: MarkdownContent, CodeBlock, Callout, Tabs, Steps, Card, FileTree, ApiTable, Badge
Agent: AgentContext, PromptSlideout, CopyButtons
Provider: DeweyProvider

## Config Schema

```typescript
{
  project: { name, tagline, type },
  agent: { criticalContext[], entryPoints{}, rules[], sections[] },
  docs: { path, output, required[] },
  install: { objective, doneWhen, prerequisites[], steps[] }
}
```

## Valid Values

ProjectType: 'npm-package' | 'cli-tool' | 'macos-app' | 'react-library' | 'monorepo' | 'generic'
CalloutType: 'info' | 'warning' | 'tip' | 'danger'
BadgeVariant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
ThemePreset: 'neutral' | 'ocean' | 'emerald' | 'purple' | 'dusk' | 'rose' | 'github' | 'warm' | 'midnight' | 'editorial' | 'mono' | 'hudson'

## Judgment and generation model

- Project type changes paired scaffold, required docs, install defaults, verification, and evidence checks.
- `audit` + `agent` JSON include `projectType` and `drift`.
- Drift checks pairing/cited paths/literal union-enum contracts; regex/evidence only, not semantic/executable proof.
- `generate`, `create`, artifact API share canonical recursive discovery/frontmatter.
- One manifest drives retrieval indexes/link tables/bundles.
- Full content is separated: docs JSON, prompts JSON, raw Markdown, bundles.

Generated-site ownership/recovery/release: `docs/maintenance.md` and `docs/agent/maintenance.agent.md`.

## Key Files

| Path | Purpose |
|------|---------|
| packages/docs/src/index.ts | Main exports |
| packages/docs/src/cli/index.ts | CLI entry |
| packages/docs/src/cli/schema.ts | Config schema |
| packages/docs/src/skills/ | LLM prompt templates |
