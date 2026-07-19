---
title: CLI Reference
description: Dewey commands and their main options
order: 3
group: Reference
groupId: reference
---

Dewey audits documentation, generates agent-facing artifacts, and publishes the same Markdown through optional site templates.

## Run Dewey

Install Dewey in a project and use its local binary:

```bash
bun add -d @arach/dewey
bunx dewey --help
```

For a one-off run without installing it first, address the scoped package directly:

```bash
bunx @arach/dewey@latest --help
```

## Commands

| Command | Purpose |
|---|---|
| `dewey init` | Create a documentation structure and `dewey.config.ts` |
| `dewey audit` | Check documentation completeness and quality |
| `dewey generate` | Generate `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and `agent/` artifacts |
| `dewey agent` | Evaluate agent-readiness and recommend improvements |
| `dewey create <dir>` | Publish Markdown with a Next.js or Astro site template |
| `dewey update [dir]` | Refresh Dewey-owned files in a generated site |
| `dewey eject <component> [dir]` | Take ownership of a generated component |

## Recommended order

`init` → author docs → `generate` → `audit` → `agent` → optional human UI.

| Goal | Path |
|---|---|
| Agent-ready artifacts only | Stop after `generate` / `audit` / `agent` |
| Docs UI inside an existing React/Next.js app | [Integrate into an existing site](./integrate-existing-site.md) |
| New standalone docs site | `dewey create <dir> --source ./docs --template nextjs` |

See [Quickstart](./quickstart.md) for the full onboarding sequence.

## Generate options

```bash
dewey generate --source ./docs --output ./generated
dewey generate --agents-md
dewey generate --llms-txt
dewey generate --docs-json
dewey generate --install-md
dewey generate --agent-artifacts
dewey generate --dry-run
dewey generate --overwrite
```

`--source` overrides `docs.path` for a run. An empty `agent.sections` array includes every human-readable Markdown document recursively; provide section IDs only when you want an explicit allowlist.

Before writing, `generate` prints a plan containing every create, update, preserve, and stale-file deletion. Use `--dry-run` to preview the same plan without creating the output directory or changing files. Dewey tracks owned outputs in `.dewey-generated.json`; unknown or edited desired files block the write. After reviewing the preview, `--overwrite` can explicitly replace those conflicts and adopt the resulting outputs.

## Machine-readable checks

Both audit commands can emit JSON for CI and other tooling:

```bash
dewey audit --json
dewey agent --json
```

`audit` is deterministic structural validation. `agent` is evidence-based readiness coaching: it scores the documentation surface and recommends next actions, but does not write files.
