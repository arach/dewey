# Components Page Review

**File:** `www/src/pages/Docs.tsx` (componentsContent)
**Reviewed:** 2026-01-16

## Scores

| Criterion | Score | Notes |
|-----------|-------|-------|
| Grounding | 3/5 | Jumps into components without overview |
| Completeness | 1/5 | Only 4 of 22 components documented |
| Clarity | 3/5 | Good for what's there |
| Examples | 2/5 | Basic examples, no advanced patterns |
| Agent-Friendliness | 2/5 | Missing prop tables with valid values |
| **Total** | **11/25** | |

## Verdict: NEEDS_WORK (worst score)

---

## Issues Found

1. **18 components missing** - Only DocsLayout, MarkdownContent, CodeBlock, HeadingLink shown
2. **No component categories** - Should group by purpose
3. **BadgeColor incomplete** - Shows 5, actual has 'neutral' too
4. **Props tables incomplete** - Missing defaults, required markers
5. **No agent-friendly components** - PromptSlideout, AgentContext, CopyButtons missing
6. **No UI components** - Callout, Tabs, Steps, Card, FileTree, ApiTable, Badge missing

## Drift from Codebase

### Documented Components (4)
- DocsLayout ✓
- MarkdownContent ✓
- CodeBlock ✓
- HeadingLink ✓

### Missing Components (18)
| Category | Components |
|----------|------------|
| Entry Points | DocsApp, DocsIndex |
| Provider | DeweyProvider |
| Layout | Header, Sidebar, TableOfContents |
| UI | Callout, Tabs, Steps, Card, CardGrid, FileTree, ApiTable, Badge |
| Agent | CopyButtons, AgentContext, PromptSlideout |

### Type Drift
| Type | Documented | Actual | Status |
|------|------------|--------|--------|
| BadgeColor | 5 values | 6 values (+ neutral) | DRIFT |
| NavItem.icon | shown | correct | OK |
| DocSection.level | `2 \| 3` | correct | OK |

## Recommendations

1. Add all 22 components organized by category
2. Add complete props tables with types, defaults, required
3. List all valid enum values
4. Add agent-friendly components section
5. Add import examples for each component
6. Add visual examples or screenshots

---

## History

| Run | Score | Delta |
|-----|-------|-------|
| #1 | 11/25 | - |
