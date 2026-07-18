# Changelog

All notable changes to Dewey are recorded here. Versions follow the published `@arach/dewey` package.

## Unreleased

### Added

- Canonical registry and generated-site support for all twelve themes, including Editorial.
- Reproducible, schema-versioned agent artifacts and a committed recursive retrieval surface.
- Packed-package, release-version, generation, audit, theme, and eject contract tests.
- Pull-request CI and release verification gates.

### Fixed

- Machine-readable audit output, audit score bounds, recursive document discovery, custom theme overrides, and ejected component prop contracts.
- Runtime dependency and license packaging gaps.

### Changed

- Standardized local, generated-site, CI, and deployment commands on Bun.
- Made `packages/docs/package.json` the release-version source of truth; release workflows no longer mutate versions.
