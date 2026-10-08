# dewey - Agent Context

## Package
@arach/dewey

## Purpose
Keeps a project's docs usable by people and coding agents and checks they still match the code. One folder of Markdown produces `AGENTS.md` (front door), `llms.txt` (agent index) and a static site in `.dewey/site/`.

## CLI Commands

| Command | Action |
|---------|--------|
| `dewey init` | Front door, `SKILL.md`, author skill, `.dewey/project.json`, draft guide and maps, first build |
| `dewey build` | `.dewey/site/` (HTML, `.md` copies, `llms.txt`, `llms-full.txt`, `nav.json`); marked regions of root `llms.txt` and `AGENTS.md` |
| `dewey check [--json]` | Exit 1 on drafts, coverage gaps, stale reviews, broken references/links, front-door budget, stale outputs |
| `dewey review <doc>` | Record hashes of a covered doc and its files in `.dewey/reviews.json` |
| `dewey new <map\|guide\|reference\|history> <name>` | Draft doc |
| `dewey which <path>` | Docs covering a file or directory |
| `dewey uncovered` | Source files no map covers |

Frozen (warn, still run, read `dewey.config.ts`): `audit`, `generate`, `agent`, `create`, `update`, `eject`.

## Loop

`init` once → author drafts (remove `draft: true`) → `review` each map → `build` → `check`. Covered code changes → `REVIEW_REQUIRED` → reread, fix, `review`.

## Doc kinds (frontmatter `kind`)

| Kind | Site | Notes |
|------|------|-------|
| guide | yes | task-shaped |
| reference | yes | API/CLI/config contracts |
| map | no | `covers: [globs]`; each source file in exactly one map; usually `docs/<area>.agent.md` |
| history | no | plans, decisions, reports |

## Settings

`.dewey/project.json`: `schemaVersion`, `name`, `purpose`, `rules[]`, `hosts[]`, `commands[]`, `skin`, `site{theme,accent,fonts,logo,css,home,links}`. Contract: `docs/cli.md`.

Skins: dewey (default), openscout, talkie, lattices, hudsonkit, ink. `site.theme` implies ink; refused with other skins.

ThemePreset: 'neutral' | 'ocean' | 'emerald' | 'purple' | 'dusk' | 'rose' | 'github' | 'warm' | 'midnight' | 'editorial' | 'mono' | 'hudson' | 'ink' | 'slate'

## Package extras

React components for embedding docs in an existing app (`docs/integrate-existing-site.md`), theme CSS, prompt templates (`docs/skills.md`), artifact APIs (`docs/api.md`).

## Key Files

| Path | Purpose |
|------|---------|
| packages/docs/src/index.ts | Main exports |
| packages/docs/src/cli/index.ts | CLI entry |
| packages/docs/src/cli/fresh/ | init/build/check/review/new/which/uncovered |
| packages/docs/src/skills/ | Prompt templates |
