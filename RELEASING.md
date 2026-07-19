# Releasing Dewey

`packages/docs/package.json` is the source of truth for the published `@arach/dewey` version. Git tags mirror that version exactly as `v<version>`; workflows never mutate versions.

## Release checklist

1. Start from a clean checkout of the intended release commit: `git status --short` must be empty.
2. Move the relevant entries in `CHANGELOG.md` from Unreleased to the new version and date.
3. Update `packages/docs/package.json` to the same version.
4. Update `dewey.config.ts` so generated project metadata reports that version.
5. Run `bun install` to refresh the lockfile.
6. Run `bun run check`.
7. Run `bun packages/docs/src/cli/index.ts generate`, then verify `.dewey-generated.json`, `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, and `agent/` have no uncommitted drift.
8. Run `bun run verify:package` to inspect the exact packed file/export/CLI contract.
9. Commit the release candidate so the checkout is clean and the package under test has a reviewable commit.
10. Run `bun run verify:release-smoke`. It creates a real tarball, installs it in an isolated consumer, imports the public API, runs the packed CLI through `init` and `generate`, and builds a generated Next.js site against that tarball. If it fails, fix and commit the candidate, then rerun the smoke.
11. After the smoke passes, create and push the exact matching tag: `v<version>`.
12. Let the tag-triggered publish workflow repeat package verification and smoke coverage before publishing.

The smoke script uses an isolated temporary directory and removes it whether the run passes or fails. A dirty checkout is a hard failure so the tested tarball always corresponds to a reviewable commit.

The manual workflow publishes the version already committed in `packages/docs/package.json`; it never performs a version bump. Use its dry-run option to inspect the publish path safely.
