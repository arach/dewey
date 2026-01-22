# Dewey - Agent Instructions

## What is Dewey

Documentation toolkit for AI-agent-ready docs. Audits, scores, and generates optimized documentation.

## Critical Rules

- Dewey is a **docs agent**, not a docs framework
- Focus on **preparation and judgment**, not presentation
- The `www/` folder is a reference implementation - do not invest in UI polish
- Skills are LLM prompts, not deterministic code

## Key Entry Points

| Area | Path |
|------|------|
| CLI commands | `packages/docs/src/cli/` |
| React components | `packages/docs/src/components/` |
| Skills | `.claude/skills/` |
| Config | `dewey.config.ts` |

## Common Tasks

### Add a CLI command
1. Create command in `packages/docs/src/cli/commands/`
2. Register in `packages/docs/src/cli/index.ts`
3. Add to docs/cli.md

### Add a skill
1. Create `.md` file in `.claude/skills/`
2. Document in docs/skills.md

### Test changes
```bash
pnpm build
node packages/docs/dist/cli/index.js <command>
```

## Agent Content Pattern

Every doc page should have two versions:
- `page.md` - Human-readable, narrative
- `page.agent.md` - Dense, structured, tables over prose
