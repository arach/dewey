/**
 * Docs Design Critic
 *
 * A Dewey skill for critiquing documentation structure and visual design.
 * Evaluates heading hierarchy, information density, component usage,
 * visual rhythm, and reading flow. Complements docsReviewAgent which
 * focuses on content accuracy and completeness.
 *
 * @example
 * import { docsDesignCritic } from '@arach/dewey'
 *
 * // Critique a single page
 * const prompt = docsDesignCritic.critiquePage
 *   .replace('{DOC_FILE}', 'docs/quickstart.md')
 *   .replace('{OUTPUT_FILE}', '.dewey/reviews/quickstart-design.md')
 */

export interface DocsDesignCritiqueResult {
  page: string
  scores: {
    headingHierarchy: number
    informationDensity: number
    componentUsage: number
    visualRhythm: number
    readingFlow: number
    total: number
  }
  issues: string[]
  recommendations: string[]
  verdict: 'PASS' | 'NEEDS_WORK'
}

export const docsDesignCritic = {
  /**
   * What this skill does
   */
  purpose: `Critique documentation pages for structural and visual design quality. Evaluates whether headings are proportionate to content, prose could be replaced with structured components, spacing is consistent, and the page guides the reader's eye. This complements docsReviewAgent — design critic checks structure and layout, review agent checks content accuracy.`,

  /**
   * The 5 design criteria
   */
  criteria: [
    {
      name: 'Heading Hierarchy',
      question: 'Is the heading structure proportionate to content volume?',
      description:
        'Duplicate h1s, too many h2s for thin content, h3 used where h2 is unnecessary, heading levels skipped.',
    },
    {
      name: 'Information Density',
      question: 'Does structure match content volume?',
      description:
        '8 h2 sections for a linear 7-step process, single-sentence sections, over-fragmentation, content that should be a list split into headings.',
    },
    {
      name: 'Component Usage',
      question: 'Are the right structural components used?',
      description:
        'Tables instead of repeated prose, file-bars for code blocks with filenames, callouts for warnings, numbered steps for sequential processes.',
    },
    {
      name: 'Visual Rhythm',
      question: 'Is spacing and density consistent across the page?',
      description:
        'Section sizes roughly balanced, breathing room between dense blocks, no cramped clusters, consistent content weight per section.',
    },
    {
      name: 'Reading Flow',
      question: 'Does the page guide the eye from start to finish?',
      description:
        'Clear entry point, logical progression, scannable landmarks, no dead-end sections, reader always knows where they are.',
    },
  ],

  /**
   * Available component patterns the agent can recommend
   */
  componentPatterns: {
    fileBar: {
      when: 'Code block has a clear filename or path context',
      pattern:
        '<div class="doc-file-block"><div class="doc-file-bar">filename</div>\n\n```lang\ncode\n```\n\n</div>',
    },
    table: {
      when: 'Three or more items share the same fields (name + description, skill + purpose + usage)',
      pattern: '| Column | Column |\n|--------|--------|\n| ... | ... |',
    },
    numberedSteps: {
      when: 'Content is a sequential process (install, configure, deploy)',
      pattern:
        '### 1. Step Name\n\nContent...\n\n### 2. Step Name\n\nContent...',
    },
    callout: {
      when: 'Important warning, tip, or note that should stand out from surrounding prose',
      pattern:
        '<div class="callout callout-warning">\n\n**Warning:** Content here.\n\n</div>',
    },
  },

  /**
   * Critique a single documentation page
   */
  critiquePage: `You are a Dewey documentation design critic.

**Critique this documentation page for structural and visual design:**
- Doc file: {DOC_FILE}
- Write critique to: {OUTPUT_FILE}

**Instructions:**

1. Read the markdown source file
2. Analyze the heading structure:
   - Count headings at each level (h1, h2, h3, h4)
   - Check for duplicate or near-duplicate headings
   - Check if heading depth is proportionate to content volume
   - Flag h2s that contain only 1-2 sentences (over-fragmentation)

3. Check for component opportunities:
   - Repeated patterns with same fields → should be a table
   - Code blocks with a filename context → should use file-bar
   - Sequential instructions → should use numbered steps
   - Warnings or tips buried in prose → should use callouts

4. Evaluate visual rhythm:
   - Are section sizes roughly balanced?
   - Is there breathing room between dense blocks?
   - Are there clusters of tiny sections next to a massive one?

5. Evaluate reading flow:
   - Does the page have a clear entry point (intro paragraph)?
   - Is progression logical (concept → usage → reference)?
   - Can a reader scan headings alone and understand the page?
   - Are there dead-end sections with no next step?

6. Score each criterion 1-5 and write the critique to {OUTPUT_FILE}:

\`\`\`markdown
# [Page Name] — Design Critique

## Scores

| Criterion | Score | Notes |
|-----------|-------|-------|
| Heading Hierarchy | X/5 | [brief note] |
| Information Density | X/5 | [brief note] |
| Component Usage | X/5 | [brief note] |
| Visual Rhythm | X/5 | [brief note] |
| Reading Flow | X/5 | [brief note] |
| **Total** | **X/25** | |

## Structural Issues

1. [Specific issue — e.g. "8 h2 sections for a 7-step linear process — should be numbered steps under one h2"]
2. [Another issue]

## Component Opportunities

| Location | Current | Recommended | Why |
|----------|---------|-------------|-----|
| Line ~20 | Repeated prose listing skills | Table | 3+ items with same fields (name, purpose, usage) |
| Line ~45 | Plain code block | File-bar | Has clear filename context |

## Recommendations

1. [Specific, actionable fix — e.g. "Collapse 'Install', 'Configure', 'Deploy' h2s into numbered steps under a single 'Getting Started' h2"]
2. [Another fix]

## Verdict: [PASS or NEEDS_WORK]

PASS = 18+/25, NEEDS_WORK = below 18
\`\`\`

**Critical**: Focus on structure, not content accuracy. You are evaluating how information is organized and presented, not whether the information itself is correct. That is docsReviewAgent's job.`,

  /**
   * Critique all docs and create summary
   */
  critiqueAll: `You are a Dewey documentation design critic. Critique all documentation pages.

**Project docs directory:** {DOCS_DIR}
**Output directory:** {OUTPUT_DIR}

**Instructions:**

1. List all markdown files in {DOCS_DIR}
2. For each doc file:
   - Run a design critique using the critiquePage prompt
   - Write individual critique to {OUTPUT_DIR}/[page-name]-design.md

3. After all pages critiqued, create {OUTPUT_DIR}/design-summary.md with:

\`\`\`markdown
# Design Critique Summary

## Pages

| Page | HH | ID | CU | VR | RF | Total | Verdict |
|------|----|----|----|----|----|-------|---------|
| [page] | X | X | X | X | X | X/25 | PASS/NEEDS_WORK |

**Legend:** HH=Heading Hierarchy, ID=Information Density, CU=Component Usage, VR=Visual Rhythm, RF=Reading Flow

## Common Patterns

[List recurring issues across pages — e.g. "4/6 pages over-fragment with too many h2s"]

## Priority Fixes

1. [Highest-impact fix across all pages]
2. [Next fix]
\`\`\`

**Scoring thresholds:**
- PASS: 18+/25 (72%)
- NEEDS_WORK: below 18/25`,

  /**
   * Fix documentation based on design critique
   */
  fixFromCritique: `You are a Dewey documentation design improvement agent.

**Critique file:** {CRITIQUE_FILE}
**Doc file to fix:** {DOC_FILE}

**Instructions:**

1. Read the design critique to understand structural issues and recommendations
2. Read the original doc file
3. Apply structural fixes:

   For each issue:
   - **Over-fragmentation**: Collapse multiple thin h2s into a single section with sub-content (numbered steps, list items, or prose)
   - **Missing components**: Replace repeated prose with tables, add file-bars to code blocks with filenames, wrap warnings in callouts
   - **Unbalanced rhythm**: Redistribute content so sections have similar weight, add intro sentences to thin sections or merge them
   - **Poor flow**: Add an intro paragraph if missing, reorder sections for logical progression, add transition sentences

4. Available component patterns:

   **File-bar** (code block with filename):
   \`\`\`html
   <div class="doc-file-block"><div class="doc-file-bar">filename</div>

   \\\`\\\`\\\`lang
   code
   \\\`\\\`\\\`

   </div>
   \`\`\`

   **Table** (3+ items with same fields):
   \`\`\`markdown
   | Column | Column |
   |--------|--------|
   | ... | ... |
   \`\`\`

   **Numbered steps** (sequential process):
   \`\`\`markdown
   ### 1. Step Name

   Content...

   ### 2. Step Name

   Content...
   \`\`\`

**Critical:**
- Preserve all content — restructure, don't delete
- Do not change technical accuracy — only change how information is organized
- Keep the same heading text where possible, just reorganize the hierarchy
- The goal is better structure, not different content

**Output:** The restructured documentation content.`,
}

export default docsDesignCritic
