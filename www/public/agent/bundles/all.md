# All Documentation

| Kind | Title | Source | Raw markdown |
|------|-------|--------|--------------|
| doc | dewey | `docs/AGENTS.md` | /agent/raw/docs/AGENTS.md |
| doc | Overview | `docs/overview.md` | /agent/raw/docs/overview.md |
| doc | Quickstart | `docs/quickstart.md` | /agent/raw/docs/quickstart.md |
| doc | Skills | `docs/skills.md` | /agent/raw/docs/skills.md |
| agent | dewey - Agent Context | `docs/agent/overview.agent.md` | /agent/raw/docs/agent/overview.agent.md |
| prompt | Audit Docs | `docs/prompts/audit-docs.md` | /agent/raw/docs/prompts/audit-docs.md |
| prompt | Create Agent Md | `docs/prompts/create-agent-md.md` | /agent/raw/docs/prompts/create-agent-md.md |

---

<!-- source: docs/AGENTS.md -->

# dewey

> Documentation toolkit for AI-agent-ready docs and retrieval artifacts

## Critical Context

**IMPORTANT:** Read these rules before making any changes:

- Dewey generates standard files plus the `agent/` retrieval surface: manifests, raw markdown, prompts, and bundles
- Skills are LLM prompts, NOT deterministic code - they guide agents
- Each doc page should have TWO versions: human (.md) and agent (.agent.md)
- The `.dewey/` folder contains generated artifacts (reviews, prompts, drift reports)
- Never hardcode values that exist in source code - always cross-reference

## Project Structure

| Component | Path | Purpose |
|-----------|------|---------|
| React Components | `packages/docs/src/components/` | Optional docs UI components |
| CLI Commands | `packages/docs/src/cli/commands/` | init, audit, generate, agent |
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
| `dewey init` | Scaffold docs structure + dewey.config.ts |
| `dewey audit` | Validate documentation completeness |
| `dewey generate` | Create AGENTS.md, llms.txt, docs.json, install.md, and `agent/` artifacts |
| `dewey create` | Optional static docs site from markdown |
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

---

<!-- source: docs/overview.md -->

# Dewey

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
dewey create    Optional static docs site from markdown
dewey agent     Score agent-readiness (0-100)
```

## Quick Links

- [Quickstart](./quickstart.md) - Get started in 5 minutes
- [CLI Reference](./cli.md) - All commands and options
- [Skills](./skills.md) - Built-in LLM prompt templates

---

<!-- source: docs/quickstart.md -->

# Quickstart

Requires Node.js 18+ and pnpm (recommended) or npm.

### 1. Install

```bash
pnpm add -D @arach/dewey
```

### 2. Initialize

```bash
npx dewey init
```

Creates a `docs/` folder with starter templates and a `dewey.config.ts` configuration file.

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
      { description: 'Install', command: 'pnpm add your-project' },
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
  overview.agent.md    # Agent-optimized version
```

### 5. Generate agent files

```bash
npx dewey generate
```

Outputs `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and an `agent/` retrieval surface with raw markdown, prompt registries, manifests, and context bundles.

### 6. Check your score

<div class="doc-file-block">
<div class="doc-file-bar">npx dewey agent</div>

```
Agent Readiness Report
Overall Score: 75/100 (Grade: C)

Categories:
✓ Project Context: 20/25
○ Agent-Optimized Files: 20/30
...
```

</div>

### 7. Optional: create a doc site

```bash
npx dewey create my-docs --source ./docs --theme ocean
cd my-docs && pnpm install && pnpm dev
```

Generates a static docs site from the same markdown when you want a human-facing site alongside the agent artifacts.

---

## Next steps

- Create `.agent.md` versions of your docs for denser, structured content
- Add skills to `.claude/skills/` for custom agent-guided reviews
- Run `npx dewey audit` to check documentation completeness
- Use `dewey create` when you want to publish the same docs as a static site

---

<!-- source: docs/skills.md -->

Skills are LLM prompts, not code. They're expert instructions that tell AI agents exactly how to perform a task — what to check, what to produce, and what success looks like.

## Built-in Skills

| Skill | Purpose | Usage |
|-------|---------|-------|
| `docsReviewAgent` | Reviews doc quality page-by-page — catches stale content, missing sections, unclear explanations, broken links | `Use the docsReviewAgent skill to review docs/overview.md` |
| `promptSlideoutGenerator` | Generates AI-consumable prompt configurations for documentation pages | `Use promptSlideoutGenerator to create prompt config for the API page` |
| `docsDesignCritic` | Critiques page structure and visual design — heading hierarchy, component usage, information density | `Use docsDesignCritic to critique docs/quickstart.md` |
| `installMdGenerator` | Creates install.md files following the [installmd.org](https://installmd.org) spec | `Use installMdGenerator to create install.md from dewey.config.ts` |

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

---

<!-- source: docs/agent/overview.agent.md -->

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
ThemePreset: 'neutral' | 'ocean' | 'emerald' | 'purple' | 'dusk' | 'rose' | 'github' | 'warm'

## Key Files

| Path | Purpose |
|------|---------|
| packages/docs/src/index.ts | Main exports |
| packages/docs/src/cli/index.ts | CLI entry |
| packages/docs/src/cli/schema.ts | Config schema |
| packages/docs/src/skills/ | LLM prompt templates |

---

<!-- source: docs/prompts/audit-docs.md -->

# Audit Docs

Use this prompt to audit a project's documentation for agent-readiness.

```
Review the documentation in this project for AI-agent readiness:

1. Check for completeness:
   - Does overview.md explain what the project does?
   - Does quickstart.md have working code examples?
   - Is there API documentation?

2. Check for agent-optimized versions:
   - Are there .agent.md files alongside .md files?
   - Do agent versions use structured data (tables, lists) over prose?

3. Check for critical context:
   - Is there an AGENTS.md with entry points and rules?
   - Is there an llms.txt for quick context loading?

4. Check for install.md:
   - Does it follow installmd.org format?
   - Are steps executable as a TODO checklist?

Output a score 0-100 and specific recommendations.
```

---

## Expected Output

A report with:
- Overall score
- Category breakdown
- Specific files to create or improve
- Quick wins for score improvement

---

<!-- source: docs/prompts/create-agent-md.md -->

# Create Agent Md

Use this prompt to convert human documentation to agent-optimized format.

```
Convert this documentation to agent-optimized format (.agent.md):

Input: [paste human-readable .md content]

Requirements for agent-optimized version:
1. Remove narrative prose - use bullet points and tables
2. Make it self-contained - no "see other page" references
3. Include all parameters, types, and return values
4. Use structured data:
   - Tables for options/parameters
   - Code blocks for examples
   - Lists for steps
5. Front-load critical information
6. Keep it dense but complete

Output the .agent.md content.
```

---

## Example

<div class="doc-file-block">
<div class="doc-file-bar">Human-readable docs</div>

```markdown
The `init` command helps you get started with Dewey. It creates
the necessary configuration files and folder structure. You'll
want to run this first before using other commands.
```

</div>

<div class="doc-file-block">
<div class="doc-file-bar">Agent-optimized output</div>

```markdown
## init

| Aspect | Value |
|--------|-------|
| Purpose | Create config and folder structure |
| Run when | First time setup |
| Creates | dewey.config.ts, docs/ |
| Prereqs | None |
```

</div>
