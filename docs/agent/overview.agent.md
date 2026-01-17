# dewey - Agent Context

## Package
@arach/dewey

## Purpose
Documentation toolkit that generates AI-agent-ready files (AGENTS.md, llms.txt, install.md) and provides React components for docs sites.

## CLI Commands

| Command | Action |
|---------|--------|
| `dewey init` | Create docs/ + dewey.config.ts |
| `dewey audit` | Validate completeness |
| `dewey generate` | Create AGENTS.md, llms.txt, docs.json, install.md |
| `dewey agent` | Score agent-readiness (0-100 pts) |

## Generated Files

| File | Purpose |
|------|---------|
| AGENTS.md | Combined docs with critical context |
| llms.txt | Plain text for LLMs |
| docs.json | Structured JSON |
| install.md | LLM-executable installation (installmd.org) |

## Skills (LLM Prompts)

| Skill | Purpose |
|-------|---------|
| docsReviewAgent | Review quality, catch drift |
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
ThemePreset: 'neutral' | 'ocean' | 'emerald' | 'purple' | 'dusk' | 'rose' | 'github' | 'warm'

## Key Files

| Path | Purpose |
|------|---------|
| packages/docs/src/index.ts | Main exports |
| packages/docs/src/cli/index.ts | CLI entry |
| packages/docs/src/cli/schema.ts | Config schema |
| packages/docs/src/skills/ | LLM prompt templates |
