# Changelog

All notable changes to Dewey are recorded here. Versions follow the published `@deweydocs/dewey` package (`@arach/dewey` up to 0.5.0).

## Unreleased

## 0.5.1 - 2026-10-08

### Changed

- Published as `@deweydocs/dewey`. The CLI is still `dewey`. To migrate, replace the `@arach/dewey` dependency and imports (including subpaths) with `@deweydocs/dewey`.

### Fixed

- Frozen commands no longer tell you to run `dewey init` when `dewey.config.ts` is missing; they point to `dewey build` and `dewey check`.

## 0.5.0 - 2026-10-08

### Added

- New project loop: `dewey init`, `build`, `check`, `review`, `new`, `which` and `uncovered`. `init` adopts existing docs and rolls back if it fails.
- Static docs site built from the same Markdown as `llms.txt`, with `.md` copies of every page, `llms-full.txt` and a size-budgeted `llms.txt`.
- Site block in `.dewey/project.json` for theme, accent, fonts, logo, CSS and header links.
- Slate and Ink themes, plus skins matching the openscout, talkie, lattices and hudsonkit docs.
- Copy page menu: copy for an agent, copy or view as Markdown, `llms.txt`, and open the page in a hosted assistant chat.
- Powered by Dewey badge at the foot of the sidebar.
- Checks for path#symbol citations, doc commands, front-door size, map coverage and frontmatter (`status`, `applies`, `supersedes`).

### Changed

- Docs sites look like deweydocs.com by default and ship one small script instead of the full client.
- `audit`, `generate`, `agent`, `create`, `update` and `eject` are frozen: they still run but print a warning.

### Fixed

- Importing `@arach/dewey` in Node no longer touches `document`.
- README raw HTML and GitHub alerts render; shell fences with trailing backslashes are checked correctly.

## 0.4.0 - 2026-08-28

### Added

- Canonical registry and generated-site support for all twelve themes, including Editorial.
- Reproducible, schema-versioned agent artifacts and a committed recursive retrieval surface.
- Packed-package, release-version, generation, audit, theme, and eject contract tests.
- Pull-request CI and release verification gates.
- Embed-in-existing-site guide, plus CLI `update` and `eject` documentation.

### Fixed

- Machine-readable audit output, audit score bounds, recursive document discovery, custom theme overrides, and ejected component prop contracts.
- Runtime dependency and license packaging gaps.
- Agent outputs now prefer `.agent.md` counterparts; readiness scoring checks real content; retrieval artifacts prune deleted pages.
- `www` typecheck on a clean checkout by building `@arach/dewey` before the site compiles.
- Visual CI installs Playwright `chromium-headless-shell`, which 1.61 actually launches.

### Changed

- Standardized local, generated-site, CI, and deployment commands on Bun.
- Made `packages/docs/package.json` the release-version source of truth; release workflows no longer mutate versions.
