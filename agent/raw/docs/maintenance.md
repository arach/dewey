---
title: Maintaining generated sites
description: Safely adopt, update, eject, recover, and release Dewey-generated sites
order: 7
group: Guides
groupId: guides
---

Dewey separates source documentation from the optional generated site. `dewey generate` owns agent-facing artifacts through `.dewey-generated.json`; `dewey create`, `update`, and `eject` maintain the standalone site through `.dewey-manifest.json`. Review those ownership boundaries before forcing a write.

## Safe update workflow

Commit the site before an update so every scaffold change is reviewable.

```bash
bunx dewey update ./my-docs --dry-run
bunx dewey update ./my-docs
```

`update` classifies each current template file as current, safely updatable, missing/new, or modified. It updates Dewey-owned files whose recorded hash is unchanged and skips consumer-owned, ejected, or locally modified files. It never rewrites `package.json` or `docs/*.md` as part of normal scaffold maintenance.

Use `--force` only after inspecting the dry run:

```bash
bunx dewey update ./my-docs --dry-run
bunx dewey update ./my-docs --force
```

Forced, locally modified Dewey-owned scaffold files are copied into a timestamped `.dewey-backup/<snapshot>/...` tree before replacement. Consumer-owned and ejected files remain protected even with `--force`. Dewey keeps the five newest timestamped snapshots and removes older snapshots after a forced update.

## Recover or adopt a missing manifest

If `.dewey-manifest.json` is absent but the directory still has the recognizable generated structure, the first `dewey update` adopts it:

- Astro: detects `astro.config.mjs` plus `src/layouts/BaseLayout.astro`.
- Next.js: detects `next.config.js`, `next.config.mjs`, or `next.config.ts` plus `<site-root>/src/lib/dewey.tsx`.

The adoption pass records current hashes, template type, detected project/theme/default page where available, and consumer-owned settings. It writes `.dewey-manifest.json`, stops, and asks you to run `update` again. Review the adopted manifest before that second run. Unknown recorded themes produce a warning and resolve to `neutral`.

## Eject a Next.js component

Ejection transfers a component from Dewey-managed defaults to an explicit override:

```bash
# Compose the packaged default (recommended starting point)
bunx dewey eject Header ./my-docs

# Replace it completely
bunx dewey eject Header ./my-docs --full
```

Supported components are `Header`, `Sidebar`, `TableOfContents`, and `MarkdownContent`. Ejection is currently Next.js-only.

Before writing, Dewey verifies in memory that it can add the custom import and replace the component map in `<site-root>/src/lib/dewey.tsx`. If either rewrite cannot be proven, it reports the failed step and creates no override. Successful writes use temporary files and report the status of the override, wiring, and manifest if an I/O failure interrupts the operation.

The manifest records the override and its wiring as `owner: "ejected"` with a content hash, Dewey version, component name, and `wrap` or `full` mode. `update` will not reclaim these entries, including with `--force`; remove or deliberately revise the ejected ownership entries only when you want to restore Dewey defaults.

## Recovery checklist

1. Stop if the update/eject summary reports a partial write.
2. Inspect `git diff`, `.dewey-manifest.json`, and the latest timestamp under `.dewey-backup/`.
3. Restore from Git first when the site was committed; otherwise copy only the affected file from the newest backup snapshot.
4. For a missing manifest, run adoption once and review it before applying templates.
5. Run the site build and the relevant route/component smoke check after recovery.

## Release workflow

Releases use `packages/docs/package.json` as the package-version source of truth and require an exact matching `v<version>` tag. From a clean checkout:

1. Finalize `CHANGELOG.md`, package version, `dewey.config.ts`, and lockfile.
2. Run `bun run check`.
3. Regenerate artifacts and confirm `.dewey-generated.json`, root artifacts, and `agent/` have no drift.
4. Run `bun run verify:package`.
5. Commit the release candidate so the checkout is clean and the tested package is reviewable.
6. Run `bun run verify:release-smoke` to pack, install in an isolated consumer, import the public API, exercise packed CLI `init`/`generate`, and build a generated Next.js site. If it fails, fix and commit, then rerun.
7. Create the exact tag only after the smoke passes, then let the publish workflow repeat package and smoke verification.

The release smoke script requires a clean checkout and removes its isolated temporary directory whether it passes or fails. See `RELEASING.md` for the authoritative repository checklist.

## Related

- [CLI Reference](./cli.md) — command flags and generation semantics
- [Integrate into an existing site](./integrate-existing-site.md) — use components without a standalone scaffold
- [API Reference](./api.md) — package, component, theme, and artifact contracts
