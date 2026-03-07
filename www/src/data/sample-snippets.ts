// Plain-text code snippets + prose for template previews.
// Syntax highlighting is applied at build time via Shiki.

export interface CodeSnippet {
  code: string
  lang: string
}

export interface StandardSection {
  id: string
  heading: string
  /** HTML prose before code blocks */
  prose: string
  codeSnippets: CodeSnippet[]
  /** HTML prose after code blocks (optional) */
  afterProse?: string
}

export interface SplitpaneSection {
  id: string
  heading: string
  prose: string
  codeSnippets: CodeSnippet[]
}

export const tocHeadings = [
  { depth: 2, slug: 'installation', text: 'Installation' },
  { depth: 2, slug: 'quick-setup', text: 'Quick Setup' },
  { depth: 2, slug: 'core-concepts', text: 'Core Concepts' },
  { depth: 3, slug: 'cli-commands', text: 'CLI Commands' },
  { depth: 3, slug: 'agent-readiness', text: 'Agent Readiness' },
  { depth: 2, slug: 'whats-next', text: "What's Next" },
]

export const standardSections: StandardSection[] = [
  {
    id: 'installation',
    heading: 'Installation',
    prose: '<p>Install the package using your preferred package manager:</p>',
    codeSnippets: [
      { code: 'npm install -D @arach/dewey', lang: 'bash' },
    ],
    afterProse: '<p>Or with pnpm:</p>',
  },
  {
    id: 'installation-alt',
    heading: '',
    prose: '',
    codeSnippets: [
      { code: 'pnpm add -D @arach/dewey', lang: 'bash' },
    ],
  },
  {
    id: 'quick-setup',
    heading: 'Quick Setup',
    prose: '<p>Initialize your documentation structure:</p>',
    codeSnippets: [
      {
        code: `npx dewey init

# This creates docs/ and dewey.config.ts
# Edit the config with your project context:

import { defineConfig } from '@arach/dewey'

export default defineConfig({
  name: 'my-project',
  docs: './docs',
})`,
        lang: 'typescript',
      },
    ],
  },
  {
    id: 'core-concepts',
    heading: 'Core Concepts',
    prose: `<p>Dewey is built around three key ideas:</p>
<ol>
  <li><strong>Agent Content Pattern</strong> — Each page has human (<code>.md</code>) and agent (<code>.agent.md</code>) versions</li>
  <li><strong>Skills System</strong> — LLM prompts that guide AI agents through specific tasks</li>
  <li><strong>install.md Standard</strong> — LLM-executable install instructions following installmd.org</li>
</ol>`,
    codeSnippets: [],
  },
  {
    id: 'cli-commands',
    heading: 'CLI Commands',
    prose: `<p>Dewey provides these commands:</p>
<table>
  <thead>
    <tr><th>Command</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>dewey init</code></td><td>Create docs/ folder and config</td></tr>
    <tr><td><code>dewey audit</code></td><td>Check documentation completeness</td></tr>
    <tr><td><code>dewey generate</code></td><td>Create agent-ready files</td></tr>
    <tr><td><code>dewey agent</code></td><td>Score agent-readiness (0-100)</td></tr>
  </tbody>
</table>`,
    codeSnippets: [],
  },
  {
    id: 'agent-readiness',
    heading: 'Agent Readiness',
    prose: '<p>Check how well your docs serve AI agents:</p>',
    codeSnippets: [
      {
        code: `npx dewey agent

# Agent Readiness Report
# Score: 82/100
#
# ✓ AGENTS.md found
# ✓ llms.txt found
# ✓ install.md found
# ✗ Missing .agent.md variants for 3 pages`,
        lang: 'bash',
      },
    ],
  },
  {
    id: 'whats-next',
    heading: "What's Next",
    prose: `<ul>
  <li>Read the <a href="#">Configuration</a> guide for advanced setup</li>
  <li>Explore the built-in skills for docs review and improvement</li>
  <li>Check the components library for building doc sites</li>
</ul>
<hr />
<p><em>Built with care by the Dewey team.</em></p>`,
    codeSnippets: [],
  },
]

export const splitpaneSections: SplitpaneSection[] = [
  {
    id: 'installation',
    heading: 'Installation',
    prose: `<p>Install Dewey using your preferred package manager. Requires Node.js 18 or later.</p>
<p>The package includes TypeScript definitions out of the box — no need to install separate <code>@types</code> packages.</p>`,
    codeSnippets: [
      {
        code: `# npm
npm install -D @arach/dewey

# pnpm
pnpm add -D @arach/dewey

# yarn
yarn add -D @arach/dewey`,
        lang: 'bash',
      },
    ],
  },
  {
    id: 'quick-setup',
    heading: 'Quick Setup',
    prose: `<p>Initialize your docs structure with <code>dewey init</code>. This creates the docs folder and config file.</p>
<p>Edit <code>dewey.config.ts</code> with your project context to customize output generation.</p>`,
    codeSnippets: [
      {
        code: `import { defineConfig } from '@arach/dewey'

export default defineConfig({
  name: 'my-project',
  docs: './docs',
  output: {
    agentsMd: true,
    llmsTxt: true,
    installMd: true,
  },
})`,
        lang: 'typescript',
      },
    ],
  },
  {
    id: 'generating-files',
    heading: 'Generating Files',
    prose: `<p>Generate agent-ready output files from your documentation. Dewey creates AGENTS.md, llms.txt, docs.json, and install.md.</p>
<p>Use <code>--agents-md</code>, <code>--llms-txt</code>, or <code>--install-md</code> flags to generate specific files only.</p>`,
    codeSnippets: [
      {
        code: `# Generate all agent-ready files
npx dewey generate

# Generate specific files
npx dewey generate --agents-md
npx dewey generate --llms-txt
npx dewey generate --install-md`,
        lang: 'bash',
      },
    ],
  },
  {
    id: 'auditing',
    heading: 'Auditing Docs',
    prose: `<p>Audit your documentation for completeness and agent-readiness. The audit checks for missing sections, broken links, and structural issues.</p>
<p>Use <code>--json</code> for machine-readable output or <code>--verbose</code> for detailed results.</p>`,
    codeSnippets: [
      {
        code: `# Run audit
npx dewey audit --verbose

# Output as JSON
npx dewey audit --json`,
        lang: 'bash',
      },
    ],
  },
  {
    id: 'agent-score',
    heading: 'Agent Readiness Score',
    prose: `<p>Score your documentation's agent-readiness from 0 to 100. The score measures how well your docs can be consumed by AI agents and LLMs.</p>
<p>Use <code>--fix</code> to auto-create missing files and folders.</p>`,
    codeSnippets: [
      {
        code: `# Check score
npx dewey agent

# Auto-fix missing files
npx dewey agent --fix`,
        lang: 'bash',
      },
    ],
  },
]
