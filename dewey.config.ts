/** @type {import('@deweydocs/dewey').DeweyConfig} */
export default {
  project: {
    name: 'dewey',
    version: '0.5.1',
    tagline: 'Documentation toolkit for AI-agent-ready docs',
    type: 'npm-package',
  },

  agent: {
    criticalContext: [
      'Dewey is a docs AGENT, not a docs framework - focus on preparation and judgment, not presentation',
      'Skills are LLM prompts, not deterministic code - they guide agents',
      'Each doc page should have TWO versions: .md for humans, .agent.md for AI agents',
      'Agent versions should be dense, structured, self-contained - prefer tables over prose',
      'The www/ folder is the canonical Next.js site; www-astro/ is archived Astro reference only',
      'The primary CLI commands are init, build and check; audit, generate, agent, create, update and eject are frozen and print a warning',
    ],

    entryPoints: {
      'cli': 'packages/docs/src/cli/',
      'components': 'packages/docs/src/components/',
      'skills': '.agents/skills/',
    },

    rules: [
      { pattern: 'cli', instruction: 'Check packages/docs/src/cli/ for CLI commands' },
      { pattern: 'component', instruction: 'Check packages/docs/src/components/ for React components' },
      { pattern: 'skill', instruction: 'Check .agents/skills/ for LLM prompt templates' },
      { pattern: 'config', instruction: 'Check dewey.config.ts for project configuration' },
      { pattern: 'agent artifacts', instruction: 'Check packages/docs/src/cli/agent-artifacts.ts and `dewey generate --agent-artifacts`' },
    ],

    sections: ['overview', 'quickstart', 'cli', 'skills', 'api', 'integrate-existing-site', 'maintenance'],
  },

  docs: {
    path: './docs',
    output: './',
    required: ['overview', 'quickstart', 'api'],
  },

  install: {
    objective: 'Install Dewey, set up a project, and get a passing dewey check.',

    doneWhen: {
      command: 'bunx dewey check',
      expectedOutput: 'Dewey check passed',
    },

    prerequisites: [
      'Node.js >= 18',
      'Bun >= 1.3 (recommended) or npm',
    ],

    steps: [
      { description: 'Install the package', command: 'bun add -d @deweydocs/dewey' },
      { description: 'Set up the project; repeat --rule for each hard rule, or pass --no-rules', command: 'bunx dewey init --purpose "What this project is for" --rule "A hard rule for agents"' },
      { description: 'Finish the drafts in docs/ and remove draft: true from each' },
      { description: 'Record a review for each map after checking it against the code', command: 'bunx dewey review docs/src.agent.md' },
      { description: 'Build the site and llms.txt', command: 'bunx dewey build' },
      { description: 'Check docs against the code', command: 'bunx dewey check' },
    ],
  },
}
