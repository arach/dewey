/**
 * Install.md Generator Skill
 *
 * A Dewey skill for creating and maintaining install.md files
 * following the installmd.org standard for LLM-executable installation.
 *
 * @see https://installmd.org
 * @see https://github.com/mintlify/install-md
 *
 * @example
 * import { installMdGenerator } from '@arach/dewey'
 *
 * // Generate install.md for a project
 * const prompt = installMdGenerator.generate
 *   .replace('{PROJECT_NAME}', 'my-cli')
 *   .replace('{PROJECT_TYPE}', 'cli-tool')
 */

export interface InstallMdConfig {
  /** Product name (lowercase, hyphenated) */
  productName: string
  /** Short product description */
  description: string
  /** Installation objective */
  objective: string
  /** Verification criteria */
  doneWhen: {
    command: string
    expectedOutput?: string
  }
  /** Prerequisites list */
  prerequisites: string[]
  /** Installation steps */
  steps: Array<{
    description: string
    command?: string
    alternatives?: Array<{
      condition: string
      command: string
    }>
  }>
}

export const installMdGenerator = {
  /**
   * What this skill does
   */
  purpose: `Generate and maintain install.md files following the installmd.org standard.
These files are optimized for LLM consumption, allowing AI agents to autonomously detect environments,
adapt configurations, and execute installations. Complements llms.txt which provides general software context.`,

  /**
   * The install.md standard specification
   */
  specification: {
    url: 'https://installmd.org',
    repo: 'https://github.com/mintlify/install-md',
    format: 'markdown',
    keyPrinciples: [
      'Outcomes over exact commands - describe what should be achieved',
      'Environment-adaptive - LLMs adapt based on detected context (npm vs pnpm, macOS vs Linux)',
      'Verification-first - clear success criteria with testable commands',
      'Plain markdown - no HTML, ensures clean model input',
      'Predictable URL - host at /install.md on documentation sites',
    ],
  },

  /**
   * Standard file structure
   */
  fileStructure: `
# {product-name}

> {One-line product description}

You are an expert at installing {product-name}. Execute these steps autonomously
and inform the user of any decisions made. Request approval before running
installation commands.

## OBJECTIVE

{Concise statement of what gets installed and configured}

## DONE WHEN

\`{verification-command}\` returns {expected-output}

## TODO

- [ ] Step 1: {description}
- [ ] Step 2: {description}
- [ ] ...

## Step 1: {title}

{Detailed instructions with code blocks}

\`\`\`bash
{command}
\`\`\`

**Alternative for {condition}:**
\`\`\`bash
{alternative-command}
\`\`\`

## Step 2: {title}

...

## EXECUTE NOW

Proceed with installation following the TODO checklist above.
`,

  /**
   * Generate install.md from scratch
   */
  generate: `You are a Dewey install.md generator following the installmd.org standard.

**Project info:**
- Name: {PROJECT_NAME}
- Type: {PROJECT_TYPE}
- Description: {PROJECT_DESCRIPTION}
- Repository: {REPOSITORY_URL}

**Instructions:**

1. Analyze the project to understand:
   - What package manager(s) are supported
   - What environment requirements exist
   - What configuration steps are needed
   - How to verify successful installation

2. Generate an install.md file with this exact structure:

\`\`\`markdown
# {project-name-lowercase-hyphenated}

> {One-line description}

You are an expert at installing {project-name}. Execute these steps autonomously
and inform the user of any decisions made. Request approval before running
installation commands.

## OBJECTIVE

Install and configure {project-name} {with any key integrations}.

## DONE WHEN

\`{verification-command}\` returns {expected-output-or-description}

## TODO

- [ ] Verify prerequisites
- [ ] Install the package
- [ ] Configure initial settings
- [ ] Verify installation

## Step 1: Prerequisites

{List any requirements}

## Step 2: Install

\`\`\`bash
# Using pnpm (recommended)
pnpm add {package-name}

# Using npm
npm install {package-name}

# Using yarn
yarn add {package-name}
\`\`\`

## Step 3: Configure

{Configuration steps with code blocks}

## Step 4: Verify

Run the verification command:
\`\`\`bash
{verification-command}
\`\`\`

Expected output: {expected-output}

## EXECUTE NOW

Proceed with installation following the TODO checklist above.
\`\`\`

**Key requirements:**
- Use lowercase, hyphenated product name in H1
- Describe outcomes, not exact commands (let LLM adapt to environment)
- Include alternatives for different package managers/platforms
- Make verification criteria specific and testable
- Keep instructions self-contained (no external URL fetching required)`,

  /**
   * Review an existing install.md for compliance
   */
  review: `You are a Dewey install.md reviewer checking compliance with the installmd.org standard.

**File to review:** {INSTALL_MD_PATH}

**Review criteria (score 1-5 each):**

1. **Structure Compliance**
   - Has H1 with lowercase, hyphenated product name
   - Has blockquote description
   - Has OBJECTIVE section
   - Has DONE WHEN with verification command
   - Has TODO checklist
   - Has detailed step sections
   - Has EXECUTE NOW call-to-action

2. **Outcome-Oriented**
   - Describes what should be achieved, not just exact commands
   - Allows LLM adaptation for different environments
   - Includes alternatives for different platforms/package managers

3. **Verification Quality**
   - DONE WHEN has a specific, testable command
   - Expected output is clear
   - Verification actually confirms successful installation

4. **Self-Contained**
   - All information needed is in the file
   - No required URL fetching
   - No assumptions about prior knowledge

5. **Agent-Friendliness**
   - Clear instruction for autonomous execution
   - Explicit approval request for destructive commands
   - Logical step order

**Output format:**

\`\`\`markdown
# install.md Review

## Scores

| Criterion | Score |
|-----------|-------|
| Structure Compliance | X/5 |
| Outcome-Oriented | X/5 |
| Verification Quality | X/5 |
| Self-Contained | X/5 |
| Agent-Friendliness | X/5 |
| **Total** | **X/25** |

## Issues Found

1. [Specific issue]
2. [Another issue]

## Recommendations

1. [Actionable fix]
2. [Another fix]

## Verdict: [PASS or NEEDS_WORK]

PASS = 18+/25, NEEDS_WORK = below 18
\`\`\``,

  /**
   * Improve an existing install.md based on review feedback
   */
  improve: `You are a Dewey install.md improver.

**Current install.md:** {INSTALL_MD_PATH}
**Review feedback:** {REVIEW_FEEDBACK}

**Instructions:**

1. Read the current install.md
2. Address each issue from the review feedback
3. Ensure the improved version:
   - Follows installmd.org structure exactly
   - Emphasizes outcomes over exact commands
   - Has clear, testable verification criteria
   - Includes environment alternatives
   - Is fully self-contained

4. Output the complete improved install.md

**Focus areas:**
- If Structure Compliance was low: Ensure all required sections exist
- If Outcome-Oriented was low: Replace exact commands with outcome descriptions
- If Verification Quality was low: Add specific, testable verification
- If Self-Contained was low: Remove external dependencies, add all needed context
- If Agent-Friendliness was low: Add clear autonomous execution instructions`,

  /**
   * Generate install.md from existing quickstart.md
   */
  fromQuickstart: `You are a Dewey install.md converter.

**Input:** {QUICKSTART_MD_PATH}
**Output:** {OUTPUT_PATH}

**Instructions:**

1. Read the quickstart documentation
2. Extract:
   - Prerequisites
   - Installation commands
   - Configuration steps
   - Verification steps (infer if not explicit)

3. Convert to installmd.org format:
   - Transform human-readable prose to LLM-executable steps
   - Add environment detection hints
   - Add alternative commands for different package managers
   - Create clear DONE WHEN verification criteria
   - Structure as TODO checklist with detailed step sections

4. Key transformations:
   - "Install the package" → "Install {package} using the detected package manager (pnpm/npm/yarn)"
   - Generic instructions → Specific, executable commands
   - Implicit verification → Explicit DONE WHEN criteria

5. Write the converted install.md to {OUTPUT_PATH}`,

  /**
   * Project type-specific templates
   */
  templates: {
    'npm-package': `# {package-name}

> {description}

You are an expert at installing {package-name}. Execute these steps autonomously
and inform the user of any decisions made. Request approval before running
installation commands.

## OBJECTIVE

Install {package-name} as a dependency in the current project.

## DONE WHEN

\`npm list {package-name}\` shows the package installed at the expected version.

## TODO

- [ ] Detect package manager (pnpm, npm, yarn, bun)
- [ ] Install the package
- [ ] Verify installation

## Step 1: Detect Package Manager

Check for lock files to determine the package manager:
- \`pnpm-lock.yaml\` → pnpm
- \`package-lock.json\` → npm
- \`yarn.lock\` → yarn
- \`bun.lockb\` → bun

## Step 2: Install

\`\`\`bash
# Using pnpm
pnpm add {package-name}

# Using npm
npm install {package-name}

# Using yarn
yarn add {package-name}

# Using bun
bun add {package-name}
\`\`\`

## Step 3: Verify

\`\`\`bash
# Check installation
npm list {package-name}
\`\`\`

## EXECUTE NOW

Proceed with installation following the TODO checklist above.
`,

    'cli-tool': `# {cli-name}

> {description}

You are an expert at installing {cli-name}. Execute these steps autonomously
and inform the user of any decisions made. Request approval before running
installation commands.

## OBJECTIVE

Install {cli-name} globally and verify it's accessible from the command line.

## DONE WHEN

\`{cli-name} --version\` returns a version number.

## TODO

- [ ] Check if already installed
- [ ] Install globally
- [ ] Verify CLI is accessible
- [ ] (Optional) Configure shell completion

## Step 1: Check Existing Installation

\`\`\`bash
{cli-name} --version
\`\`\`

If this returns a version, the CLI is already installed.

## Step 2: Install Globally

\`\`\`bash
# Using pnpm
pnpm add -g {package-name}

# Using npm
npm install -g {package-name}

# Using Homebrew (macOS)
brew install {brew-formula}
\`\`\`

## Step 3: Verify

\`\`\`bash
{cli-name} --version
\`\`\`

Expected: Version number (e.g., \`{cli-name}/1.0.0\`)

## EXECUTE NOW

Proceed with installation following the TODO checklist above.
`,

    'macos-app': `# {app-name}

> {description}

You are an expert at installing {app-name}. Execute these steps autonomously
and inform the user of any decisions made. Request approval before running
installation commands.

## OBJECTIVE

Install and configure {app-name} on macOS.

## DONE WHEN

The app is installed in /Applications and can be launched.

## TODO

- [ ] Check macOS version compatibility
- [ ] Install the application
- [ ] Grant required permissions
- [ ] Verify installation

## Step 1: Verify macOS Version

Requires macOS {min-version} or later.

\`\`\`bash
sw_vers -productVersion
\`\`\`

## Step 2: Install

**Option A: Homebrew (recommended)**
\`\`\`bash
brew install --cask {cask-name}
\`\`\`

**Option B: Direct Download**
Download from {download-url} and drag to /Applications.

**Option C: Build from Source**
\`\`\`bash
git clone {repo-url}
cd {repo-name}
swift build -c release
\`\`\`

## Step 3: Grant Permissions

The app may request these permissions on first launch:
- {permission-1}
- {permission-2}

## Step 4: Verify

\`\`\`bash
open -a "{app-name}"
\`\`\`

## EXECUTE NOW

Proceed with installation following the TODO checklist above.
`,
  },
}

export default installMdGenerator
