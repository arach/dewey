/** @type {import('@dewey/cli').DeweyConfig} */
export default {
  project: {
    name: 'dewey',
    tagline: 'Documentation toolkit for AI-agent-ready docs',
    type: 'npm-package',
  },

  agent: {
    criticalContext: [
      'Dewey is a docs AGENT, not a docs framework - focus on preparation and judgment, not presentation',
      'Skills are LLM prompts, not deterministic code - they guide agents',
      'Each doc page should have TWO versions: .md for humans, .agent.md for AI agents',
      'Agent versions should be dense, structured, self-contained - prefer tables over prose',
      'The www/ folder is a reference implementation only - do not invest in UI polish',
    ],

    entryPoints: {
      'cli': 'packages/docs/src/cli/',
      'components': 'packages/docs/src/components/',
      'skills': '.claude/skills/',
    },

    rules: [
      { pattern: 'cli', instruction: 'Check packages/docs/src/cli/ for CLI commands' },
      { pattern: 'component', instruction: 'Check packages/docs/src/components/ for React components' },
      { pattern: 'skill', instruction: 'Check .claude/skills/ for LLM prompt templates' },
      { pattern: 'config', instruction: 'Check dewey.config.ts for project configuration' },
    ],

    sections: ['overview', 'quickstart', 'cli', 'skills'],
  },

  docs: {
    path: './docs',
    output: './',
    required: ['overview', 'quickstart'],
  },

  install: {
    objective: 'Install Dewey and generate agent-ready documentation for your project.',

    doneWhen: {
      command: 'npx dewey agent',
      expectedOutput: 'Agent Readiness Report with score',
    },

    prerequisites: [
      'Node.js >= 18',
      'pnpm (recommended) or npm',
    ],

    steps: [
      { description: 'Install the package', command: 'pnpm add -D @arach/dewey' },
      { description: 'Initialize documentation structure', command: 'npx dewey init' },
      { description: 'Edit dewey.config.ts with your project context' },
      { description: 'Write documentation in docs/', command: 'ls docs/' },
      { description: 'Generate agent files', command: 'npx dewey generate' },
      { description: 'Check agent-readiness score', command: 'npx dewey agent' },
    ],
  },
}
