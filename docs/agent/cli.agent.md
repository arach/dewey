---
title: CLI Reference
description: Dense Dewey CLI contract for agents
order: 3
group: Reference
groupId: reference
---

# Dewey CLI

| Command | Inputs | Writes | Purpose |
|---|---|---|---|
| `dewey init` | `--type`, `--force` | `docs/`, `dewey.config.ts` | Initialize Dewey |
| `dewey audit` | `--verbose`, `--json` | none | Check documentation quality |
| `dewey generate` | `--source`, `--output`, artifact selectors | root artifacts, `agent/` | Compile docs for humans, agents, and tooling |
| `dewey agent` | `--verbose`, `--json`, `--fix` | optional missing-file fixes | Evaluate agent-readiness |
| `dewey create <dir>` | `--source`, `--template`, `--theme`, `--name` | generated site | Publish Markdown through Next.js or Astro |
| `dewey update [dir]` | `--dry-run`, `--force`, `--refresh-nav` | Dewey-owned site files | Upgrade a generated site |
| `dewey eject <component> [dir]` | `--full` | consumer-owned component | Transfer ownership for customization |

## Direct execution

```bash
bunx @arach/dewey@latest <command>
```

## Generation selection

- Default: all standard files plus `agent/` retrieval artifacts.
- `agent.sections: []`: recursively include every human-readable `.md` file.
- Non-empty `agent.sections`: exact doc-ID allowlist, including nested IDs such as `guides/install`.
- `--source <path>`: override `docs.path` for one run.
- `--output <path>`: override `docs.output`; directory is created recursively.
