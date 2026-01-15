/**
 * AI Prompt Improvement Skill
 *
 * A general-purpose, iterative system for improving documentation AI prompts.
 * Works for any codebase. Each pass extracts more value and refines output.
 *
 * @example
 * import { improveAIPromptsSkill } from '@arach/dewey'
 *
 * // Use pass 1 to discover what exists
 * const discoveryPrompt = improveAIPromptsSkill.passes.discovery.prompt
 *
 * // Use pass 3 to review a draft
 * const reviewPrompt = improveAIPromptsSkill.passes.review.prompt
 *   .replace('{PASTE_DRAFT}', myDraft)
 */

export interface PromptImprovementPass {
  name: string
  description: string
  prompt: string
  whenToUse: string
}

export interface PromptQualityCriteria {
  name: string
  description: string
  maxScore: number
}

export const improveAIPromptsSkill = {
  /**
   * The goal of AI prompts in documentation
   */
  goal: `AI prompts should act as context injectors - giving an AI assistant everything it needs to produce valid output WITHOUT fetching external URLs or guessing values. The prompt should be self-contained.`,

  /**
   * What a complete AI prompt config should include
   */
  sections: [
    {
      name: 'Grounding',
      description: 'What this tool/system does (one technical sentence)',
      format: '[System] outputs [format] with [N] required keys: [list]. [One key insight].',
    },
    {
      name: 'Schema',
      description: 'The actual data structure with types',
      format: 'TypeScript-style interface or JSON schema inline',
    },
    {
      name: 'Valid Values',
      description: 'Real values extracted from code, not documentation guesses',
      format: '// Valid [concept]: value1, value2, value3 (N total)',
    },
    {
      name: 'Examples',
      description: 'Good/bad patterns with WHY explanations (in-context learning)',
      format: '// GOOD: [pattern]\\n{ /* WHY: explanation */ }\\n// BAD: [anti-pattern]\\n{ /* WHY BAD: explanation */ }',
    },
    {
      name: 'Validation',
      description: 'Checklist for the AI to verify its output',
      format: 'Before responding, verify:\\n1. [check]\\n2. [check]',
    },
  ],

  /**
   * The four passes for iterative improvement
   */
  passes: {
    discovery: {
      name: 'Pass 1: Discovery',
      description: 'Understand what exists in the codebase',
      whenToUse: 'First time improving prompts, or when codebase changes significantly',
      prompt: `I'm improving AI prompts for documentation. Help me discover:

1. **What does this system output?**
   - What format? (JSON, YAML, code, etc.)
   - What's the schema/structure?
   - Where is the schema defined in code?

2. **What are the valid values?**
   - Search for enums, constants, type unions
   - Look in: src/utils/, src/constants/, src/types/
   - Extract ACTUAL values, not documentation descriptions

3. **What are common patterns?**
   - Look at existing examples in the codebase
   - What makes a "good" vs "bad" output?

4. **What do users need help with?**
   - Creating new [X] from scratch
   - Modifying existing [X]
   - Debugging invalid [X]
   - Converting/exporting [X]

Return findings as structured notes I can use for the next pass.`,
    } as PromptImprovementPass,

    draft: {
      name: 'Pass 2: Draft',
      description: 'Create the prompt config from discovery findings',
      whenToUse: 'After discovery, or when creating prompts for new pages',
      prompt: `Based on these findings, draft an AI prompt config:

**Findings:**
{DISCOVERY_FINDINGS}

**Required sections:**

1. **Info** (1 sentence): What this is and key concepts
   - Format: "[System] outputs [format] with [N] required keys: [list]. [One key insight]."

2. **Params** (man-page style):
   - {VAR_NAME} — Description — e.g., "example value"
   - Include 2-4 parameters covering main use cases

3. **Starter Template**:
   - Pre-filled with {VARIABLES}
   - Includes constraints/requirements
   - Handles the primary use case

4. **Examples** (in-context learning):
   \`\`\`
   // GOOD: [pattern name]
   {
     // WHY: [explanation of why this is correct]
     "key": "value"
   }

   // BAD: [anti-pattern name]
   {
     // WHY BAD: [explanation of the mistake]
     "key": "wrong_value"
   }

   // VALID VALUES:
   // [concept]: [actual values from codebase]
   \`\`\`

5. **Expected Output** (validation checklist):
   \`\`\`
   Before responding, verify:
   1. [Structural check]
   2. [Value validity check]
   3. [Relationship check]
   4. [Format check]
   \`\`\`

Return the complete prompt config.`,
    } as PromptImprovementPass,

    review: {
      name: 'Pass 3: Review',
      description: 'Evaluate the draft against quality criteria',
      whenToUse: 'After drafting, or for periodic quality checks',
      prompt: `Review this AI prompt against the gold standard criteria:

**Prompt to review:**
{DRAFT}

**Criteria (score 1-5 each):**

1. **Grounding**: Does the info box explain the system in one technical sentence?
   - Contains key concepts, not marketing language
   - Mentions the output format and structure

2. **Completeness**: Does it include ALL valid values from the codebase?
   - Not "any X" but actual list of valid X
   - Values match what the code accepts

3. **In-Context Learning**: Do examples show WHY, not just WHAT?
   - Good examples explain the reasoning
   - Bad examples explain the mistake
   - Patterns are realistic, not trivial

4. **Self-Contained**: Can an AI produce valid output with ONLY this prompt?
   - No external URLs needed
   - No assumptions about prior knowledge
   - Schema is inline, not referenced

5. **Actionable**: Is the starter template ready to use?
   - Variables are clearly marked
   - Constraints are specific (not "make it good")
   - Covers the primary use case

**Output:**
- Score for each criterion (1-5)
- Specific improvements needed
- Overall: PASS (18+/25) or NEEDS_WORK`,
    } as PromptImprovementPass,

    refine: {
      name: 'Pass 4: Refine',
      description: 'Apply review feedback and verify improvement',
      whenToUse: 'After review identifies issues, or for incremental polish',
      prompt: `Refine this AI prompt based on review feedback:

**Current prompt:**
{CURRENT}

**Review feedback:**
{FEEDBACK}

**Refinement rules:**
1. If values are missing → Search codebase for complete list
2. If examples lack WHY → Add // WHY: comments
3. If not self-contained → Inline the schema
4. If too vague → Add specific constraints with numbers
5. If too long → Compress to essential information

**Return:**
- Refined prompt config
- Summary of changes made
- Confidence score (1-10) that an AI can now produce valid output`,
    } as PromptImprovementPass,
  },

  /**
   * Quality criteria for evaluating prompts
   */
  criteria: [
    {
      name: 'Grounding',
      description: 'Info box explains system in one technical sentence',
      maxScore: 5,
    },
    {
      name: 'Completeness',
      description: 'Includes ALL valid values from codebase',
      maxScore: 5,
    },
    {
      name: 'In-Context Learning',
      description: 'Examples show WHY, not just WHAT',
      maxScore: 5,
    },
    {
      name: 'Self-Contained',
      description: 'AI can produce valid output with ONLY this prompt',
      maxScore: 5,
    },
    {
      name: 'Actionable',
      description: 'Starter template is ready to use with clear variables',
      maxScore: 5,
    },
  ] as PromptQualityCriteria[],

  /**
   * When to re-run the improvement cycle
   */
  rerunTriggers: {
    fullCycle: [
      'Schema changes (new required fields)',
      'Valid values change (new colors, icons, etc.)',
      'User feedback indicates confusion',
      'New use cases emerge (new skill needed)',
    ],
    reviewOnly: [
      'Making incremental improvements',
      'A/B testing different phrasings',
      'Polishing before release',
    ],
  },

  /**
   * Success criteria - prompt is "done" when all are met
   */
  successCriteria: [
    'All valid values are from codebase, not guesses',
    'Examples include WHY comments',
    'An AI can produce valid output without additional context',
    'Review score is 18+/25',
    'Running another pass produces no changes (converged)',
  ],
}

export default improveAIPromptsSkill
