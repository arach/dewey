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
| `dewey agent` | `--verbose`, `--json` | none | Evaluate agent-readiness and recommend improvements |
| `dewey create <dir>` | `--source`, `--template`, `--theme`, `--name` | generated site | Publish Markdown through Next.js or Astro |
| `dewey update [dir]` | `--dry-run`, `--force` | Dewey-owned site files | Upgrade or adopt a generated site |
| `dewey eject <component> [dir]` | `--full` | consumer-owned component | Transfer ownership for customization |

## Direct execution

```bash
bunx @arach/dewey@latest <command>
```

## Recommended order

`init` → author → `generate` → `audit` → `agent` → optional UI (`docs/integrate-existing-site.md` or `create`).

## Generation selection

- Default: all standard files plus `agent/` retrieval artifacts.
- `agent.sections: []`: recursively include every human-readable `.md` file.
- Non-empty `agent.sections`: exact doc-ID allowlist, including nested IDs such as `guides/install`.
- `--source <path>`: override `docs.path` for one run.
- `--output <path>`: override `docs.output`; directory is created recursively.
- `--dry-run`: print create/update/preserve/delete operations without writing.
- `--overwrite`: explicitly replace reviewed desired-output conflicts, including modified or unowned targets; use only after `--dry-run`.

## Audit versus agent

| Command | Contract |
|---|---|
| `audit` | Deterministic structural validation of every discovered human page |
| `agent` | Evidence-based readiness coaching; reports a score and next actions; writes nothing |

## Project type contract

`ProjectType = 'macos-app' | 'npm-package' | 'cli-tool' | 'react-library' | 'monorepo' | 'generic'`

| Type | `init` focus pair | Evidence required by audit/agent |
|---|---|---|
| `generic` | `architecture.md` + agent pair | Architecture/system structure; interface or integration boundary |
| `npm-package` | `api.md` + agent pair | Package-manager installation; typed public API |
| `cli-tool` | `commands.md` + agent pair | Commands/options; executable shell usage |
| `react-library` | `components.md` + agent pair | Components/props; JSX/TSX example |
| `macos-app` | `architecture.md` + agent pair | macOS lifecycle; Swift/SwiftUI/Xcode evidence |
| `monorepo` | `packages.md` + agent pair | Workspaces/monorepo; `packages/` or `apps/` paths |

`init --type` changes required docs, paired scaffold content, install defaults, and verification commands. Invalid values fail and list every valid value.

## Canonical generation contract

- One recursive discovery/frontmatter pipeline serves `generate`, `create`, and `@arach/dewey/agent-artifacts`.
- One `AgentManifest` drives retrieval links, read order, context indexes, and bundle selection.
- `agent/context.md` + `agent/context.json`: retrieval metadata/indexes; no repeated full document corpus.
- `agent/docs.json`: content for doc/agent/reference/proposal entries.
- `agent/prompts.json`: prompt content.
- `agent/raw/docs/**` + `agent/bundles/**`: intentional full Markdown retrieval surfaces.
- `llms.txt`: description → prose → list → heading → title summary fallback.
- Prompt fallback URLs remove exactly one leading `prompts/` segment.
- Scoped install name such as `@scope/package` remains scoped.
- `create` composes the artifact writer after scaffold creation.
- Generated Next.js/Astro dependencies are exact tested versions; Pagefind is declared.
- Unknown theme: warn, then resolve to `neutral`.

## JSON evidence and drift

Both `audit --json` and `agent --json` contain `projectType` and `drift`.

| Drift field | Contract |
|---|---|
| `status` | `clean` / `issues` / `not-applicable` |
| Counts | `checkedPairs`, `checkedSourceFiles`, `checkedSourceReferences`, `checkedContracts` |
| Issue codes | `MISSING_AGENT_COUNTERPART`, `ORPHAN_AGENT_DOCUMENT`, `MISSING_SOURCE_REFERENCE`, `AGENT_CONTRACT_MISSING`, `HUMAN_AGENT_CONTRACT_MISMATCH`, `DOC_SOURCE_CONTRACT_MISMATCH` |

Human summary always prints project-type and drift status; `--verbose` prints evidence and issue details. `audit` adds recommendations but retains structural page scoring. `agent` uses project evidence and unresolved contract drift in readiness scoring.

Limitations: regex/evidence analysis only; conventional/configured TS/TSX/JS/JSX/Swift source trees; no example execution, semantic prose equivalence, or arbitrary computed-type analysis.

## Maintenance contract

- `update` flags: `--dry-run`, `--force`; no `--refresh-nav`.
- First `update` can adopt manifest-less generated Astro or Next.js sites, writes `.dewey-manifest.json`, then asks for a second run.
- `eject` supports Next.js `Header`, `Sidebar`, `TableOfContents`, `MarkdownContent`; mode `wrap` or `full`.
- Exact ownership/recovery/backup behavior: `docs/agent/maintenance.agent.md`.

## Automation error contract

- Invalid configuration or command input is rejected with a non-zero exit status.
- For `--json`, check process success before parsing stdout.
- Shell pattern: `if ! report="$(bunx dewey audit --json)"; then echo "Dewey audit failed" >&2; exit 1; fi`.
