# Changelog

All notable changes to Dewey are recorded here. Versions follow the published `@arach/dewey` package.

## Unreleased

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
