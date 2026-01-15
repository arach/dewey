/**
 * PromptSlideout Generator
 *
 * Dewey creates good documentation for humans.
 * This skill creates the meta-layer: PromptSlideout content that helps
 * users hand off context to their AI assistants.
 *
 * The PromptSlideout is the bridge between human docs and AI consumption.
 * When a user clicks "AI Prompt" on a docs page, they get a self-contained
 * prompt they can paste into Claude, ChatGPT, Copilot, or any LLM.
 *
 * This skill helps you generate that content:
 * - info: grounds the AI on what this system does
 * - params: variables the user fills in
 * - starterTemplate: the prompt they'll copy
 * - examples: in-context learning for the AI
 * - expectedOutput: validation rules for the AI
 *
 * @example
 * import { promptSlideoutGenerator } from '@arach/dewey'
 *
 * // Generate PromptSlideout content for a docs page
 * const prompt = promptSlideoutGenerator.generate
 *   .replace('{PAGE_PURPOSE}', 'Help users create diagram configs')
 *   .replace('{CODEBASE_CONTEXT}', findings)
 */

export interface PromptSlideoutConfig {
  title: string
  description: string
  info: string
  params: Array<{ name: string; description: string; example?: string }>
  starterTemplate: string
  examples?: string
  expectedOutput?: string
}

export const promptSlideoutGenerator = {
  /**
   * What the PromptSlideout is for
   */
  purpose: `Dewey creates documentation for humans. The PromptSlideout is the meta-layer that makes those docs AI-consumable. When users click "AI Prompt", they get a self-contained prompt to paste into any AI assistant. The AI should produce valid output using ONLY what's in the prompt - no URL fetching, no guessing values.`,

  /**
   * The structure of PromptSlideout content
   */
  structure: {
    info: 'One technical sentence grounding the AI on what this system does and outputs',
    params: 'Man-page style parameters with {VAR} badges and realistic examples',
    starterTemplate: 'Pre-filled prompt with {VARIABLES} the user customizes',
    examples: 'Good/bad patterns with // WHY comments for in-context learning',
    expectedOutput: 'Validation checklist the AI should verify before responding',
  },

  /**
   * Generate initial PromptSlideout content for a page
   */
  generate: `Generate PromptSlideout content for a documentation page.

**Page purpose:** {PAGE_PURPOSE}

**What I found in the codebase:**
{CODEBASE_CONTEXT}

**Generate these sections:**

1. **info** (one sentence):
   Format: "[System] outputs [format] with [structure]. [Key insight about usage]."
   - Be technical, not marketing
   - Mention the output format
   - Include one actionable insight

2. **params** (2-4 parameters):
   Each param needs:
   - name: ALL_CAPS_VAR_NAME
   - description: What this parameter is for
   - example: A realistic example value

   Cover the main use cases (create, modify, configure, etc.)

3. **starterTemplate**:
   - Start with a clear ask
   - Include all {PARAM} variables
   - Add constraints/requirements that help the AI succeed
   - Keep it focused on the primary use case

4. **examples** (in-context learning):
   \`\`\`
   // GOOD: [pattern name]
   {
     // WHY: [why this works]
     "key": "actual_valid_value"
   }

   // BAD: [anti-pattern]
   {
     // WHY BAD: [the specific mistake]
     "key": "invalid_value"
   }

   // VALID VALUES (from codebase):
   // [concept]: value1, value2, value3
   \`\`\`

5. **expectedOutput**:
   \`\`\`
   Before responding, verify:
   1. [Structure check]
   2. [Valid values check]
   3. [Relationship check]
   \`\`\`

**Return as a PromptSlideout config object.**`,

  /**
   * Refine existing PromptSlideout content
   */
  refine: `Refine this PromptSlideout content based on feedback.

**Current content:**
{CURRENT_CONFIG}

**Feedback/issues:**
{FEEDBACK}

**Refinement guidelines:**
- If info is too vague → Add specific output format and structure
- If params lack examples → Add realistic examples from actual usage
- If examples lack WHY → Add // WHY: comments explaining the reasoning
- If values are guessed → Replace with actual values from codebase
- If template is too generic → Add specific constraints with numbers

**Return the refined config with a summary of changes.**`,

  /**
   * Review PromptSlideout content quality
   */
  review: `Review this PromptSlideout content. Score each criterion 1-5.

**Content to review:**
{CONFIG}

**Criteria:**

1. **Grounding** - Does info explain the system in one technical sentence?
2. **Completeness** - Are ALL valid values from codebase included (not guessed)?
3. **In-Context Learning** - Do examples show WHY, not just WHAT?
4. **Self-Contained** - Can an AI produce valid output with ONLY this prompt?
5. **Actionable** - Is the template ready to use with clear {VARIABLES}?

**Return:**
- Score for each (1-5)
- Specific issues found
- Overall: PASS (18+/25) or NEEDS_REFINEMENT`,

  /**
   * Extract valid values from a codebase for PromptSlideout examples
   */
  extractValues: `Find all valid values for PromptSlideout examples.

**What to find:** {CONCEPT}

**Search locations:**
- src/utils/ - constants, helpers
- src/types/ - TypeScript types, interfaces
- src/constants/ - enums, config values

**Return format:**
\`\`\`
// VALID {CONCEPT}:
// Found in: [file path]
// Values: value1, value2, value3 (N total)
\`\`\`

Extract ACTUAL values from code, not documentation descriptions.`,
}

export default promptSlideoutGenerator
