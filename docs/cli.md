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

## Project-aware initialization

`init --type` accepts `generic`, `npm-package`, `cli-tool`, `react-library`, `macos-app`, or `monorepo`. Invalid values fail with the complete valid-value list. The selected type changes the generated human/agent page pair, required-document configuration, installation defaults, verification command, and evidence that `audit` / `agent` expect.

```bash
bunx dewey init --type cli-tool
bunx dewey init --type react-library
bunx dewey init --type monorepo
```

| Type | Focus page | Evidence expected |
|---|---|---|
| `generic` | `architecture` | System structure plus a public interface or integration boundary |
| `npm-package` | `api` | Package-manager install command plus typed public API |
| `cli-tool` | `commands` | Commands/options plus executable shell usage |
| `react-library` | `components` | Component props plus JSX/TSX rendering example |
| `macos-app` | `architecture` | macOS lifecycle plus Swift/SwiftUI/Xcode evidence |
| `monorepo` | `packages` | Workspace organization plus package/application paths |

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

`generate`, `create`, and the programmatic artifact API share one recursive discovery/frontmatter pipeline. A default `generate` builds the retrieval manifest once, derives link tables and bundles from that manifest, and keeps full content in purpose-built surfaces: raw Markdown and bundles, document content in `agent/docs.json`, and prompt content in `agent/prompts.json`. `agent/context.md` and `agent/context.json` are retrieval indexes, not additional full-content copies.

`llms.txt` summaries prefer frontmatter descriptions, then prose, lists, headings, and finally the page title. Prompt URLs normalize the `prompts/` prefix once. Generated installation commands preserve scoped package names such as `@scope/package`.

`create` uses the same discovered documents and then composes the agent-artifact writer into the new site. Generated Next.js and Astro package manifests pin the tested dependency versions; Pagefind is a declared dependency rather than an unpinned `bunx` download. Unknown themes emit a warning before falling back to `neutral`.

## Machine-readable checks

Both audit commands can emit JSON for CI and other tooling:

```bash
dewey audit --json
dewey agent --json
```

`audit` is deterministic structural validation. `agent` is evidence-based readiness coaching: it scores the documentation surface and recommends next actions, but does not write files.

Both JSON reports add:

- `projectType`: selected profile, label, pass/fail state, and the evidence found for each requirement.
- `drift`: `clean`, `issues`, or `not-applicable`, counts for checked pairs/source files/references/contracts, and structured issues.

Human output always summarizes project-type evidence and drift. Add `--verbose` for matched documents and issue codes. `audit` reports these findings as recommendations without changing its structural page score; `agent` uses project-type evidence in Project Context and uses unresolved contract drift when judging valid-value quality.

Drift checks cover missing/orphan `.agent.md` counterparts, missing cited source paths, human/agent literal-union mismatches, and literal union/enum differences between docs and conventional or configured source trees. The analysis is regex/evidence based: it does not prove semantic prose equivalence, execute examples, or understand arbitrary computed TypeScript types. Treat a clean report as a focused consistency check, not a substitute for review.

## Generated-site maintenance

`update` and `eject` have an ownership contract; see [Maintaining generated sites](./maintenance.md) for adoption, dry runs, ejected ownership, backups, and recovery. The obsolete `--refresh-nav` option has been removed: regenerate source artifacts with `dewey generate`, while `update` only refreshes Dewey-owned scaffold files.

## Error handling in automation

Commands reject invalid configuration and return a non-zero exit status. In CI, capture JSON only after checking the command succeeded:

```bash
if ! report="$(bunx dewey audit --json)"; then
  echo "Dewey audit failed before producing a valid report" >&2
  exit 1
fi
printf '%s\n' "$report"
```
