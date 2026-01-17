/**
 * Docs Review Agent
 *
 * A Dewey skill for reviewing documentation quality page-by-page.
 * Cross-references docs against codebase to catch drift.
 * Creates a standard review structure in .dewey/reviews/.
 *
 * @example
 * import { docsReviewAgent } from '@arach/dewey'
 *
 * // Review a single page
 * const prompt = docsReviewAgent.reviewPage
 *   .replace('{DOC_FILE}', 'docs/api.md')
 *   .replace('{SOURCE_FILES}', 'src/utils/constants.ts, src/types/index.ts')
 *   .replace('{OUTPUT_FILE}', '.dewey/reviews/api.md')
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
  purpose: `Review documentation quality page-by-page, cross-referencing against codebase to catch drift between docs and implementation. Creates structured reviews in .dewey/reviews/.`,

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
   * Standard file structure for Dewey artifacts
   */
  fileStructure: `
.dewey/                     # All Dewey-generated artifacts (gitignore-friendly)
├── reviews/                # Documentation quality assessments
│   ├── summary.md          # Overview table + critical issues
│   └── [page-name].md      # Individual page reviews
├── prompts/                # Generated PromptSlideout configs
├── drift/                  # Codebase drift reports
└── config.json             # Dewey project settings
`,

  /**
   * Initialize .dewey folder for a project
   */
  init: `Create the .dewey folder structure for this project.

1. Create directories:
   \`\`\`
   mkdir -p .dewey/reviews .dewey/prompts .dewey/drift
   \`\`\`

2. Add to .gitignore (optional):
   \`\`\`
   # Dewey generated artifacts
   .dewey/
   \`\`\`

3. Create \`.dewey/reviews/summary.md\` with this template:

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

  /**
   * Generate summary.md from individual review files
   */
  generateSummary: `You are a Dewey documentation review agent. Generate a summary report.

**Review files directory:** {REVIEWS_DIR}
**Run number:** {RUN_NUMBER}
**Date:** {DATE}

**Instructions:**

1. Read all individual review files in {REVIEWS_DIR}/*.md (except summary.md)
2. Extract scores from each review
3. Generate summary.md with this exact format:

\`\`\`markdown
# Documentation Reviews

Dewey documentation quality assessments.

## Criteria

1. **Grounding** - Does the page explain its purpose clearly?
2. **Completeness** - Are all relevant details included?
3. **Clarity** - Is the writing clear and technical?
4. **Examples** - Are there useful code examples?
5. **Agent-Friendliness** - Can an AI use this page effectively?

---

## Review Summary

| Run | Date | Pages | Avg Score | Pass | Fail | Issues | Remediations |
|-----|------|-------|-----------|------|------|--------|--------------|
| #{RUN_NUMBER} | {DATE} | {PAGE_COUNT} | {AVG}/25 | {PASS_COUNT} | {FAIL_COUNT} | {ISSUE_COUNT} | {REMEDIATION_COUNT} |

---

## Pages

| Page | G | C | Cl | E | AF | Total | Status | Review |
|------|---|---|----|----|----|----|--------|--------|
| {page} | {g} | {c} | {cl} | {e} | {af} | {total}/25 | {status} | [review](./{page}.md) |

**Legend:** G=Grounding, C=Completeness, Cl=Clarity, E=Examples, AF=Agent-Friendliness

---

## Critical Issues ({ISSUE_COUNT} total)

[List all issues from all reviews, numbered]

---

## Remediations ({REMEDIATION_COUNT} recommended)

### Priority 1: [Category]
- [ ] [Remediation from reviews]

### Priority 2: [Category]
- [ ] [Remediation]

---

## Progress Tracking

\\\`\\\`\\\`
Run #{RUN_NUMBER}: {AVG}/25 avg {PROGRESS_BAR} {PERCENT}% ({STATUS})
Target: 18/25 avg ██████████████░░░░░░ 72% (PASS)
\\\`\\\`\\\`

---

*Last updated: {DATE}*
\`\`\`

**Calculations:**
- PASS threshold: 18+/25 (72%)
- Avg Score: Sum of all totals / number of pages
- Progress bar: 20 chars, filled proportionally to avg/25`,

  /**
   * Update summary after a new review iteration
   */
  updateSummary: `You are a Dewey documentation review agent. Update the summary after improvements.

**Current summary:** {SUMMARY_FILE}
**New review files:** {REVIEWS_DIR}
**Previous run number:** {PREV_RUN}

**Instructions:**

1. Read the current summary.md
2. Read all updated review files
3. Add a new row to the Review Summary table:
   - Increment run number
   - Calculate new averages
   - Count new pass/fail
4. Update the Pages table with new scores
5. Update Critical Issues (remove fixed, add new)
6. Update Remediations (check off completed, add new)
7. Update Progress Tracking with new run

**Key:** Show score deltas from previous run:
- If score improved: "+2" in notes
- If score decreased: "-1" in notes
- Track which remediations were completed

**Goal:** Iterate until Avg Score >= 18/25 (PASS threshold)`,

  /**
   * Fix documentation based on review
   */
  fixFromReview: `You are a Dewey documentation improvement agent.

**Review file:** {REVIEW_FILE}
**Doc file to fix:** {DOC_FILE}
**Source files for reference:** {SOURCE_FILES}

**Instructions:**

1. Read the review file to understand issues and recommendations
2. Read the source files to get accurate values
3. Edit the documentation file to fix issues:

   For each issue:
   - If DRIFT: Update documented values to match source code
   - If MISSING: Add the missing documentation
   - If UNCLEAR: Rewrite for clarity
   - If NO_EXAMPLES: Add working code examples

4. After fixes, the page should score higher on:
   - Completeness: All features documented with correct values
   - Agent-Friendliness: Structured data, explicit valid values

**Critical:**
- Use actual values from source code, never guess
- Add tables for enums with all valid values
- Add prop tables with types, defaults, required markers
- Ensure examples are copy-pasteable and work

**Output:** The fixed documentation content.`,

  /**
   * Self-review cycle for iterative improvement
   */
  iterateCycle: `You are running a Dewey documentation improvement cycle.

**Project root:** {PROJECT_ROOT}
**Docs location:** {DOCS_DIR}
**Source location:** {SRC_DIR}
**Reviews location:** {REVIEWS_DIR}

**The Cycle:**

1. **REVIEW** - Run reviewAll to score all doc pages
   - Generate individual review files
   - Generate summary.md with aggregate metrics

2. **ANALYZE** - Identify highest-impact fixes
   - Pages with lowest scores
   - Issues blocking agent-friendliness
   - Drift from codebase (critical)

3. **FIX** - Apply fixes using fixFromReview
   - Start with lowest-scoring page
   - Fix drift issues first (accuracy)
   - Then completeness (coverage)
   - Then agent-friendliness (structure)

4. **RE-REVIEW** - Score the fixed pages
   - Update individual reviews
   - Update summary with new run
   - Track score deltas

5. **ITERATE** - Repeat until target met
   - Target: All pages >= 18/25
   - Or: Avg score >= 18/25
   - Stop when no more improvements possible

**Success criteria:**
- All DRIFT issues resolved
- All pages have PASS verdict
- Summary shows positive trend across runs`,
}

export default docsReviewAgent
