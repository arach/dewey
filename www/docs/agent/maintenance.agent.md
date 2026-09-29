---
title: Maintaining generated sites
description: Dense ownership, update, ejection, recovery, backup, and release contract
order: 7
group: Guides
groupId: guides
---

# Dewey generated-site maintenance contract

## Ownership manifests

| Surface | Manifest | Owner |
|---|---|---|
| Agent artifacts from `generate` | `.dewey-generated.json` | Generation planner/scopes |
| Standalone Astro/Next.js scaffold | `.dewey-manifest.json` | `create` / `update` / `eject` |

Do not conflate the manifests. Source `docs/*.md` and consumer `package.json` are not normal `update` targets.

## Update

```bash
bunx dewey update ./my-docs --dry-run
bunx dewey update ./my-docs
bunx dewey update ./my-docs --force
```

| State | Default behavior |
|---|---|
| Dewey-owned, recorded hash unchanged | Update safely |
| Already equal to current template | Leave current; refresh manifest metadata |
| Missing/new template file | Create |
| Consumer/ejected/locally modified | Skip |
| Modified Dewey-owned scaffold with `--force` | Back up, replace, remain `owner: dewey` |
| Consumer/ejected entry with `--force` | Stay protected; never reclaimed by `update` |

Backup contract: timestamped `.dewey-backup/<snapshot>/...`; retain five newest timestamped snapshots after forced updates.

## Manifest adoption

First `update` with no manifest:

| Template | Detection |
|---|---|
| Astro | `astro.config.mjs` + `src/layouts/BaseLayout.astro` |
| Next.js | one of `next.config.js` / `.mjs` / `.ts` + `<site-root>/src/lib/dewey.tsx` |

Action: write `.dewey-manifest.json`; infer template/current hashes and available project/theme/default-page settings; stop; require a second `update` run. Unknown theme warns and becomes `neutral`.

## Ejection

Supported Next.js components: `Header`, `Sidebar`, `TableOfContents`, `MarkdownContent`.

Modes:

- `wrap`: override composes packaged default.
- `full`: complete consumer implementation.

Pre-write proof: custom import exists in candidate `<site-root>/src/lib/dewey.tsx`; component mapping points to custom import. Proof failure => no override write. Successful file replacement uses temporary-file rename.

Manifest entries for override and wiring:

```text
owner: ejected
hash: content hash
version: Dewey version
component: component name
mode: wrap | full
```

`update` never reclaims consumer/ejected entries, including with `--force`. Restoring a default is an explicit ownership decision outside the update path.

## Recovery

1. Inspect command partial-write status and `git diff`.
2. Prefer Git restore from a committed pre-update state.
3. Otherwise restore only affected file from newest `.dewey-backup/<snapshot>/`.
4. Missing manifest: adopt once, inspect, rerun.
5. Build and smoke-check affected route/component.

## Release gate

| Order | Check |
|---|---|
| 1 | Clean checkout; changelog/package version/config/lock aligned |
| 2 | `bun run check` |
| 3 | Generate; no `.dewey-generated.json`, root-artifact, or `agent/` drift |
| 4 | `bun run verify:package` |
| 5 | Commit release candidate; checkout becomes clean/reviewable |
| 6 | `bun run verify:release-smoke`; fix + commit + rerun on failure |
| 7 | Exact `v<version>` tag only after smoke; publish workflow repeats verification |

Release smoke: real tarball; isolated consumer install/import; packed CLI `init` + `generate`; generated Next.js build; clean-checkout precondition; temporary directory removed on pass/fail.

Authoritative repository procedure: `RELEASING.md`.
