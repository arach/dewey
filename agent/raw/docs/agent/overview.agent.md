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
| `dewey create` | Optional static docs site from markdown |
| `dewey agent` | Score agent-readiness (0-100 pts) |

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
| agent/docs.json | Full docs manifest with markdown |
| agent/prompts.json | Prompt registry |
| agent/context.md | Compact markdown bundle |
| agent/context.json | JSON context bundle |
| agent/raw/docs/ | Raw markdown mirror |

## Skills (LLM Prompts)

| Skill | Purpose |
|-------|---------|
| docsReviewAgent | Review quality, catch drift |
| docsDesignCritic | Critique page structure and visual design |
| promptSlideoutGenerator | Generate prompt configs |
| installMdGenerator | Create install.md |

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

## Key Files

| Path | Purpose |
|------|---------|
| packages/docs/src/index.ts | Main exports |
| packages/docs/src/cli/index.ts | CLI entry |
| packages/docs/src/cli/schema.ts | Config schema |
| packages/docs/src/skills/ | LLM prompt templates |
