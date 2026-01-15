/**
 * Docs Review Agent
 *
 * A Dewey skill for reviewing documentation quality page-by-page.
 * Cross-references docs against codebase to catch drift.
 * Creates a standard review structure in docs/reviews/.
 *
 * @example
 * import { docsReviewAgent } from '@arach/dewey'
 *
 * // Review a single page
 * const prompt = docsReviewAgent.reviewPage
 *   .replace('{DOC_FILE}', 'docs/api.md')
 *   .replace('{SOURCE_FILES}', 'src/utils/constants.ts, src/types/index.ts')
 *   .replace('{OUTPUT_FILE}', 'docs/reviews/api.md')
 */

export interface DocsReviewResult {
  page: string
  scores: {
    grounding: number
    completeness: number
    clarity: number
    examples: number
    agentFriendliness: number
    total: number
  }
  issues: string[]
  recommendations: string[]
  verdict: 'PASS' | 'NEEDS_WORK'
}

export const docsReviewAgent = {
  /**
   * What this skill does
   */
  purpose: `Review documentation quality page-by-page, cross-referencing against codebase to catch drift between docs and implementation. Creates structured reviews in docs/reviews/.`,

  /**
   * The 5 review criteria
   */
  criteria: [
    {
      name: 'Grounding',
      question: 'Does the page explain its purpose clearly?',
      description: 'First paragraph should orient the reader on what this page covers and why it matters.',
    },
    {
      name: 'Completeness',
      question: 'Are all relevant details included?',
      description: 'All features, options, and valid values should be documented. Cross-reference with source code.',
    },
    {
      name: 'Clarity',
      question: 'Is the writing clear and technical?',
      description: 'Concise, scannable, uses proper terminology. No ambiguity.',
    },
    {
      name: 'Examples',
      question: 'Are there useful code examples?',
      description: 'Copy-pasteable examples that actually work. Show common use cases.',
    },
    {
      name: 'Agent-Friendliness',
      question: 'Can an AI use this page effectively?',
      description: 'Structured data, explicit valid values, no assumptions about prior knowledge.',
    },
  ],

  /**
   * Standard file structure for reviews
   */
  fileStructure: `
docs/reviews/
├── README.md           # Summary table + critical issues
├── [page-name].md      # Individual page review
├── [page-name].md
└── ...
`,

  /**
   * Initialize reviews folder for a project
   */
  init: `Create the docs review structure for this project.

1. Create \`docs/reviews/\` directory
2. Create \`docs/reviews/README.md\` with this template:

\`\`\`markdown
# Documentation Reviews

Page-by-page quality assessments.

## Criteria

1. **Grounding** - Does the page explain its purpose clearly?
2. **Completeness** - Are all relevant details included?
3. **Clarity** - Is the writing clear and technical?
4. **Examples** - Are there useful code examples?
5. **Agent-Friendliness** - Can an AI use this page effectively?

## Pages

| Page | Score | Status |
|------|-------|--------|
| [page-name](./page-name.md) | pending | |

## Summary

_To be filled after reviews complete._
\`\`\`

3. List all doc pages that need review`,

  /**
   * Review a single documentation page
   */
  reviewPage: `You are a Dewey documentation review agent.

**Review this documentation page:**
- Doc file: {DOC_FILE}
- Source files to validate against: {SOURCE_FILES}
- Write review to: {OUTPUT_FILE}

**Instructions:**

1. Read the documentation file
2. Read the source files to find actual valid values, types, and implementations
3. Cross-reference: Are documented values accurate? Any drift from implementation?
4. Score each criterion 1-5:

   - **Grounding** - Does it explain purpose clearly in the first paragraph?
   - **Completeness** - All features documented? Valid values match source code?
   - **Clarity** - Writing is clear, scannable, technical?
   - **Examples** - Copy-pasteable code that works?
   - **Agent-Friendliness** - Can an AI use this effectively?

5. Write the review to {OUTPUT_FILE} with this format:

\`\`\`markdown
# [Page Name] Review

## Scores

| Criterion | Score |
|-----------|-------|
| Grounding | X/5 |
| Completeness | X/5 |
| Clarity | X/5 |
| Examples | X/5 |
| Agent-Friendliness | X/5 |
| **Total** | **X/25** |

## Issues Found

1. [Specific issue with file:line reference if applicable]
2. [Another issue]

## Drift from Codebase

[List any documented values that don't match source code]

## Recommendations

1. [Actionable fix]
2. [Another fix]

## Verdict: [PASS or NEEDS_WORK]

PASS = 18+/25, NEEDS_WORK = below 18
\`\`\`

**Critical**: Always validate documented enums, types, and valid values against actual source code. Documentation drift is the #1 cause of AI agents generating invalid output.`,

  /**
   * Review all docs and create summary
   */
  reviewAll: `You are a Dewey documentation review agent. Review all documentation pages.

**Project docs directory:** {DOCS_DIR}
**Source code directory:** {SRC_DIR}
**Output directory:** {OUTPUT_DIR}

**Instructions:**

1. List all markdown files in {DOCS_DIR}
2. For each doc file:
   - Identify relevant source files to validate against
   - Run a page review using the reviewPage prompt
   - Write individual review to {OUTPUT_DIR}/[page-name].md

3. After all pages reviewed, update {OUTPUT_DIR}/README.md with:
   - Summary table of all scores
   - Critical issues (any values that don't match source code)
   - Pages that PASS vs NEEDS_WORK
   - Priority fixes

**Scoring thresholds:**
- PASS: 18+/25 (72%)
- NEEDS_WORK: below 18/25

**Focus areas for cross-referencing:**
- Enums and valid values (colors, sizes, types)
- Function signatures and parameters
- Configuration options
- State shapes and data structures`,

  /**
   * Quick drift check - just validate values against source
   */
  driftCheck: `Check if documentation values match source code.

**Doc file:** {DOC_FILE}
**Source files:** {SOURCE_FILES}

**Instructions:**

1. Extract all documented enums, valid values, and type options from the doc
2. Find the actual values in source code
3. Report any drift:

\`\`\`markdown
## Drift Report: [doc file]

### Documented vs Actual

| Concept | Documented | Actual | Status |
|---------|------------|--------|--------|
| colors | violet, blue, rose | violet, blue, emerald | DRIFT |
| sizes | s, m, l | xs, s, m, l | DRIFT |
| anchors | top, right, bottom, left | top, right, bottom, left | OK |

### Summary
- X values match
- Y values have drift
- Action needed: [yes/no]
\`\`\`

This is a quick validation without full review scoring.`,
}

export default docsReviewAgent
