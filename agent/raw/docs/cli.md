---
title: CLI Reference
description: Dewey commands and their main options
order: 3
group: Reference
groupId: reference
---

# CLI Reference

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

## Generate options

```bash
dewey generate --source ./docs --output ./generated
dewey generate --agents-md
dewey generate --llms-txt
dewey generate --docs-json
dewey generate --install-md
dewey generate --agent-artifacts
```

`--source` overrides `docs.path` for a run. An empty `agent.sections` array includes every human-readable Markdown document recursively; provide section IDs only when you want an explicit allowlist.

## Machine-readable checks

Both audit commands can emit JSON for CI and other tooling:

```bash
dewey audit --json
dewey agent --json
```
