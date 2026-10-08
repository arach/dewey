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
