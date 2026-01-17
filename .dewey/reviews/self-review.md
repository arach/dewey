# Dewey Self-Review: Documentation vs Codebase

**Date:** 2026-01-16
**Reviewer:** Dewey docsReviewAgent (dogfooding)

## Scores

| Criterion | Score |
|-----------|-------|
| Grounding | 4/5 |
| Completeness | 2/5 |
| Clarity | 4/5 |
| Examples | 3/5 |
| Agent-Friendliness | 2/5 |
| **Total** | **15/25** |

## Verdict: NEEDS_WORK

The documentation covers the basics well but is significantly behind the actual codebase. Many major features are undocumented.

---

## Drift Report: Documentation vs Codebase

### CLI Commands

| Command | Documented | Actual | Status |
|---------|------------|--------|--------|
| `dewey init` | Yes | Yes | OK |
| `dewey audit` | Yes | Yes | OK |
| `dewey generate` | Partial | Yes | **DRIFT** |
| `dewey agent` | No | Yes | **MISSING** |

**Issues:**
1. `dewey generate` docs mention AGENTS.md, llms.txt, docs.json but **NOT install.md**
2. `dewey agent` command (agent-coach) is completely undocumented

### Components

| Component | Documented | Exported | Status |
|-----------|------------|----------|--------|
| DocsLayout | Yes | Yes | OK |
| MarkdownContent | Yes | Yes | OK |
| CodeBlock | Yes | Yes | OK |
| HeadingLink | Yes | Yes | OK |
| DocsApp | No | Yes | **MISSING** |
| DocsIndex | No | Yes | **MISSING** |
| DeweyProvider | No | Yes | **MISSING** |
| Header | No | Yes | **MISSING** |
| Sidebar | No | Yes | **MISSING** |
| TableOfContents | No | Yes | **MISSING** |
| Callout | No | Yes | **MISSING** |
| Tabs | No | Yes | **MISSING** |
| Steps | No | Yes | **MISSING** |
| Card/CardGrid | No | Yes | **MISSING** |
| FileTree | No | Yes | **MISSING** |
| ApiTable | No | Yes | **MISSING** |
| Badge | No | Yes | **MISSING** |
| CopyButtons | No | Yes | **MISSING** |
| AgentContext | No | Yes | **MISSING** |
| PromptSlideout | No | Yes | **MISSING** |

**Summary:** 4 documented, 16 undocumented

### Skills System

| Skill | Documented | Exported | Status |
|-------|------------|----------|--------|
| docsReviewAgent | No | Yes | **MISSING** |
| promptSlideoutGenerator | No | Yes | **MISSING** |
| installMdGenerator | No | Yes | **MISSING** |

The entire skills system is undocumented. This is a major feature gap.

### Configuration

| Config Section | Documented | Actual | Status |
|----------------|------------|--------|--------|
| project | Yes | Yes | OK |
| agent | Yes | Yes | OK |
| docs | Yes | Yes | OK |
| install | No | Yes | **MISSING** |

The new `install` config section for install.md generation is undocumented.

### Theming System

| Feature | Documented | Actual | Status |
|---------|------------|--------|--------|
| DeweyProvider | No | Yes | **MISSING** |
| ThemePreset | No | Yes | **MISSING** |
| Color themes (8) | No | Yes | **MISSING** |
| CSS custom properties | No | Yes | **MISSING** |
| Tailwind preset | No | Yes | **MISSING** |

### Hooks

| Hook | Documented | Exported | Status |
|------|------------|----------|--------|
| useDarkMode | No | Yes | **MISSING** |
| useTableOfContents | No | Yes | **MISSING** |
| useActiveSection | No | Yes | **MISSING** |

### Types

The docs show simplified types. Actual types include:
- PageTree, PageNode, PageItem, PageFolder, PageSeparator
- FlatPage, NavigationConfig, NavigationGroup, NavigationItem
- Many component prop types

---

## Critical Issues

### 1. Skills System Completely Undocumented
The skills system (`docsReviewAgent`, `promptSlideoutGenerator`, `installMdGenerator`) is a major differentiator for Dewey but has zero documentation. An AI agent cannot discover or use these features.

### 2. install.md Feature Just Added, Not Documented
We just added install.md generation following installmd.org standard. The docs don't mention:
- `dewey generate --install-md`
- `install` config section in dewey.config.ts
- The installMdGenerator skill

### 3. Agent-Friendly Components Not Showcased
Components specifically designed for AI agents (`AgentContext`, `PromptSlideout`, `CopyButtons`) are exported but not documented. This undermines Dewey's core value proposition.

### 4. `dewey agent` Command Missing
The agent-coach command that scores agent-readiness is completely undocumented.

### 5. Theming System Hidden
8 color presets, CSS variables, and Tailwind preset exist but aren't documented.

---

## Recommendations

### Priority 1: Document New Features
1. Add install.md section to quickstart
2. Document `install` config in configuration page
3. Add `dewey agent` to CLI docs

### Priority 2: Skills System Docs
Create a new "Skills" page documenting:
- docsReviewAgent
- promptSlideoutGenerator
- installMdGenerator

### Priority 3: Component Reference
Expand components page to cover all 22 components, not just 4.

### Priority 4: Agent Features Page
Create dedicated page for:
- AgentContext component
- PromptSlideout component
- CopyButtons component
- "Copy for Agent" workflow

### Priority 5: Theming Guide
Document:
- DeweyProvider
- Theme presets
- CSS customization
- Tailwind preset

---

## Files Reviewed

- `www/src/pages/Docs.tsx` - Main documentation content
- `packages/docs/src/index.ts` - All exports
- `packages/docs/src/cli/` - CLI commands
- `packages/docs/src/skills/` - Skills system
- `ROADMAP.md` - Feature tracking

---

*Generated by Dewey docsReviewAgent | Self-review dogfooding*
