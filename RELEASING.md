# Releasing Dewey

`packages/docs/package.json` is the source of truth for the published `@arach/dewey` version. Git tags mirror that version exactly as `v<version>`; workflows never mutate versions.

## Release checklist

1. Move the relevant entries in `CHANGELOG.md` from Unreleased to the new version and date.
2. Update `packages/docs/package.json` to the same version.
3. Update `dewey.config.ts` so generated project metadata reports that version.
4. Run `bun install` to refresh the lockfile.
5. Run `bun run check`.
6. Run `bun packages/docs/src/cli/index.ts generate` and commit any generated artifact changes.
7. Commit the release, then create and push the exact matching tag: `v<version>`.
8. Let the tag-triggered publish workflow verify, pack, and publish the package.

The manual workflow publishes the version already committed in `packages/docs/package.json`; it never performs a version bump. Use its dry-run option to inspect the publish path safely.
