# dewey

> Documentation toolkit for AI-agent-ready docs - generates AGENTS.md, llms.txt, install.md

## Critical Context

**IMPORTANT:** Read these rules before making any changes:

- Dewey generates 4 agent files: AGENTS.md, llms.txt, docs.json, install.md
- Skills are LLM prompts, NOT deterministic code - they guide agents
- Each doc page should have TWO versions: human (.md) and agent (.agent.md)
- The `.dewey/` folder contains generated artifacts (reviews, prompts, drift reports)
- Never hardcode values that exist in source code - always cross-reference

## Project Structure

| Component | Path | Purpose |
|-----------|------|---------|
| React Components | `packages/docs/src/components/` | 22 UI components |
| CLI Commands | `packages/docs/src/cli/commands/` | init, audit, generate, agent |
| Skills | `packages/docs/src/skills/` | LLM prompt templates |
| Documentation Site | `www/src/pages/` | Live docs at dewey site |

## Quick Navigation

- Entry point: `packages/docs/src/index.ts`
- CLI entry: `packages/docs/src/cli/index.ts`
- Config schema: `packages/docs/src/cli/schema.ts`
- Main layout: `packages/docs/src/components/DocsLayout.tsx`

## CLI Commands

| Command | Purpose |
|---------|---------|
| `dewey init` | Scaffold docs structure + dewey.config.ts |
| `dewey audit` | Validate documentation completeness |
| `dewey generate` | Create AGENTS.md, llms.txt, docs.json, install.md |
| `dewey agent` | Score agent-readiness (100 pts scale) |

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
import { docsReviewAgent } from '@arach/dewey'

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

## Configuration (dewey.config.ts)

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
`'neutral'` | `'ocean'` | `'emerald'` | `'purple'` | `'dusk'` | `'rose'` | `'github'` | `'warm'`

## File Generation

`dewey generate` creates:

| File | Format | Purpose |
|------|--------|---------|
| AGENTS.md | Markdown | Combined docs with critical context |
| llms.txt | Plain text | General software context |
| docs.json | JSON | Structured documentation |
| install.md | Markdown | LLM-executable installation (installmd.org) |

## Agent Content Pattern

Each doc page should have two versions:

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
