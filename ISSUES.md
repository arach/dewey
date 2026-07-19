# Dewey improvement backlog

This is the canonical, deduplicated backlog from the July 2026 repository audit. It is organized around Dewey's product pillars: judgment, generation, themes/publishing, trust, and dogfooding.

## Completed in the current pass

- [x] Make `audit --json` and `agent --json` emit one parseable JSON value with no banners.
- [x] Correct audit scoring so a clean section is 50/50 and duplicate H1s reduce the score.
- [x] Add focused tests for scoring and machine-readable command output.
- [x] Make `generate` and `create` discover nested markdown deterministically.
- [x] Exclude `.agent.md` files from human-document discovery while associating them with their human page.
- [x] Create missing output directories and add `generate --source`.
- [x] Default `agent.sections` to all documentation rather than a narrow scaffold list.
- [x] Fix generated config imports and export `defineConfig` plus configuration types from `@arach/dewey`.
- [x] Add CLI documentation, including the shipped `update` and `eject` commands.
- [x] Replace broken direct-run examples with package-qualified commands.
- [x] Add the MIT license to the repository and published package.
- [x] Move `clsx`, `tailwind-merge`, and config-loading TypeScript support to runtime dependencies.
- [x] Report malformed frontmatter with the exact source document before writing generated output.
- [x] Align runtime theme overrides with the component token contract.
- [x] Ship and wire the advertised editorial theme for components and generated sites.
- [x] Export ejected component prop types so generated source type-checks.
- [x] Add package tests and pull-request CI; gate publishing on lint, tests, and build.
- [x] Standardize repository scripts and workflows on Bun.
- [x] Repair current site type errors so the reference implementation can be checked non-interactively.

## P0 — release blockers

- [x] Regenerate and verify Dewey's committed `AGENTS.md`, `llms.txt`, `docs.json`, and agent retrieval artifacts.
- [x] Expand package-contract coverage from CSS sources to the CLI binary, README, license, and final `npm pack` contents.
- [x] Make `packages/docs/package.json` the release source of truth, require matching tags, and maintain release notes in `CHANGELOG.md`.

## P1 — audit and judgment

- [x] Define the distinct jobs of `audit` (deterministic structure) and `agent` (quality judgment) in product copy and output.
- [x] Detect API documentation by evidence rather than filename conventions.
- [x] Generate quick wins from actual unmet checks instead of a fixed list.
- [x] Make `agent --fix` perform documented safe fixes or remove the promise.
- [x] Resolve `agent` from the project root and replace hardcoded filename allow-lists.
- [ ] Validate project types and make each type change the checks or scaffold meaningfully.
- [x] Add score fixtures for sparse, malformed, nested, duplicated-heading, and fully documented projects.
- [ ] Add drift checks between source code, human docs, and `.agent.md` counterparts.

## P1 — generation

- [ ] Unify `generate` and `create` on one document-discovery and metadata pipeline.
- [x] Make generated output reproducible by removing wall-clock timestamps or honoring `SOURCE_DATE_EPOCH`.
- [x] Add `schemaVersion` to public JSON manifests.
- [x] Warn when a source directory is missing or discovery finds no documents.
- [x] Protect user-edited generated files with ownership markers, dry-run previews, or explicit overwrite consent.
- [x] Prune artifacts for deleted and renamed documents without touching user-owned files.
- [x] Make the agent-artifact output directory explicit and safely scoped.
- [ ] Derive artifact link tables and bundles from a single canonical manifest.
- [ ] Avoid repeatedly materializing full document content in every artifact.
- [ ] Improve `llms.txt` summary extraction for frontmatter, lists, headings, and short pages.
- [ ] Fix fallback prompt URLs that can contain a duplicated `prompts/` segment.
- [ ] Preserve scoped package names in generated installation instructions.
- [ ] Make `create` and `generate` compose intentionally instead of maintaining parallel output models.
- [ ] Pin scaffold dependencies or record a tested compatibility range.

## P1 — themes and publishing

- [x] Establish one canonical theme registry used by package exports, runtime types, the CLI, site generation, and documentation.
- [ ] Define and test one complete token contract across runtime components, exported CSS, Tailwind, and generated sites.
- [ ] Audit every preset for missing, renamed, or dead tokens.
- [ ] Replace hardcoded component palettes with semantic tokens where customization is expected.
- [ ] Add contrast, focus, reduced-motion, keyboard, and screen-reader checks to every theme and shell.
- [ ] Add visual regression coverage for each theme in light/dark and representative content states.
- [ ] Make `eject` verify every rewrite and report partial or failed rewrites.
- [ ] Record ejected file ownership and version in a manifest so updates can be reviewed safely.
- [ ] Support recovery or adoption of generated manifests in Next.js/React sites, not only Astro.
- [ ] Warn on unknown theme names instead of silently falling back.
- [ ] Remove the dead refresh-navigation mechanism or implement its intended behavior.

## P1 — adoption through clarity

- [x] Add a complete “embed Dewey in an existing React/Next.js site” guide.
- [x] Document the server-to-client wrapper and static export pattern for Next.js.
- [x] Present one coherent onboarding sequence across `init`, `audit`, `generate`, `agent`, and optional `create`.
- [x] Explain the human `.md` / agent `.agent.md` pairing with concrete retrieval examples.
- [x] Document or differentiate the redundant `@arach/dewey/react` export.
- [ ] Decide whether `improveAIPrompts` is public and align code, exports, and docs.
- [x] Make output locations and produced files explicit before commands write them.
- [x] Add copy-paste examples for monorepos, custom source directories, and CI enforcement.

## P2 — maintenance and dogfooding

- [x] Give every Dewey documentation page a maintained `.agent.md` counterpart.
- [ ] Remove duplicated site documentation and dead archived content.
- [ ] Dogfood all public skills and generated artifacts in this repository's CI.
- [ ] Reconcile stale ROADMAP entries and close issues that are already fixed.
- [ ] Fix unanchored `.md` filename replacement so only the final extension changes.
- [ ] Rotate update backups rather than accumulating them indefinitely.
- [ ] Clarify the purpose of the current no-op TypeScript build step.
- [ ] Reconsider whether router support must be a required peer dependency.
- [ ] Reconsider whether all markdown/rendering dependencies belong in the core package.
- [ ] Populate or remove the empty Purpose column in generated project-structure tables.
- [ ] Add accessibility regression tests for navigation, search, copy buttons, tables of contents, and mobile menus.
- [ ] Add a release checklist covering clean checkout, pack inspection, install smoke test, CLI smoke test, and generated-site smoke test.
