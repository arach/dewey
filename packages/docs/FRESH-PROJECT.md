# Fresh-project slice

Dewey now has a fresh-project CLI path. It does not load or execute `dewey.config.ts` as configuration, migrate existing consumers, or deploy a site.

## Try the complete proof

From the Dewey checkout:

```sh
bun packages/docs/scripts/fresh-project-smoke.ts
```

This creates a new temporary project, authors its scaffold, runs the full CLI loop, verifies deliberate failures and recovery, and retrieves the generated site over HTTP. It leaves the project and `proof.log` in place and prints their absolute paths. The temporary HTTP server stops after verification.

To exercise the built CLI under Node:

```sh
bun run --cwd packages/docs build
DEWEY_RUNTIME=node DEWEY_CLI="$PWD/packages/docs/dist/cli/index.js" \
  bun packages/docs/scripts/fresh-project-smoke.ts
```

## Use it in a new project

Run these commands from the new project's root. The examples address this checkout's CLI; nothing needs publishing first.

```sh
bun /Users/arach/dev/dewey/packages/docs/src/cli/index.ts init \
  --purpose 'Describe the project purpose' \
  --rule 'State a real hard rule'
```

Repeat `--rule` as needed. Use `--no-rules` to explicitly declare none. Purpose defaults to the package description. Interactive init asks only for missing purpose/rules; non-interactive init requires flags for missing information.

Init creates:

- `AGENTS.md`, with authored rules and a marked observed-facts region, capped at 150 lines.
- `CLAUDE.md`, pointing to that front door.
- Draft task guide and source-area maps in `docs/`.
- `SKILL.md`, for agents using the project from outside.
- `.agents/skills/dewey-author/SKILL.md`, for agents maintaining the docs.
- `.dewey/project.json`, containing basic project identity, not a TypeScript config.
- `.dewey/site/` and `llms.txt`, built immediately from the same Markdown model.

The site is usable immediately, but drafts are **not** a passing documentation check. Author the guide and maps, verify their claims, and remove `draft: true`. Then:

```sh
bun /Users/arach/dev/dewey/packages/docs/src/cli/index.ts review docs/src.agent.md
bun /Users/arach/dev/dewey/packages/docs/src/cli/index.ts build
bun /Users/arach/dev/dewey/packages/docs/src/cli/index.ts check --json
python3 -m http.server 4387 --bind 127.0.0.1 --directory .dewey/site
```

Review each document that declares `covers`. `review` explicitly records document/source hashes after the author has checked the document. `build` never records review or clears source drift. Keep `.dewey/project.json` and `.dewey/reviews.json` with the project if CI will use the same reviewed baseline.

## Source contract

```yaml
---
kind: map
covers: [src/sync/**]
title: Sync implementation
---
```

Kinds: `guide`, `reference`, `map`, `history`. Maps declare coverage. Guides and references produce human pages. Maps and history do not appear in the site or default agent index. Root `README.md` is a guide by default. `nav: false` explicitly marks an intentionally unlisted human page. Relative Markdown links and heading anchors are rewritten into site links.

Coverage accepts `*`, `**`, and `?`, with project-relative paths. `src/*` does not cover `src/sync/index.ts`. Adding that area requires a map. A guide does not need a paired agent file.

## Checks and safety

`check` exits 1 and emits issue codes for:

- Drafts, invalid metadata, uncovered source, empty coverage patterns, or review-required source/document changes.
- Missing front door/skill/pointer, or a front door over 150 lines.
- Missing cited conventional paths, nonexistent package scripts, and missing simple shell commands.
- Missing local Markdown links/anchors, unpublished map/history links from human pages, stale outputs, broken rendered links, and human pages absent from navigation.

It does not execute documentation commands. External links are not fetched. Source changes request review; they are not proof that prose is false.

Init refuses existing scaffold targets. Rerunning it in an initialized project updates only the observed front-door region and generated outputs. Build updates only the marked region in root `llms.txt`; surrounding authored text survives. Generated site files have hash-based ownership: modified/unowned targets block a build before writes. Obsolete unchanged owned pages are pruned. Symlink output paths are refused.

## First-slice boundaries

- Source discovery covers conventional `src/`, `lib/`, `Sources/`, package/app `src` or `Sources` trees, root code files, and existing package main/module/types/bin entry files. It excludes dependency/build/test directories and symlinks. Arbitrary source-root policy is not implemented.
- Markdown `.md` is supported; MDX, remote assets, generated API extraction, and arbitrary renderer configuration are not implemented.
- Referenced local PNG/JPEG/GIF/WebP/AVIF/ICO/PDF/TXT assets are copied. Other local downloads are reported as broken rendered links until supported.
- Script checks validate named root package scripts; shell-fence command checks inspect simple line-leading executables against this host's PATH. This is not a shell parser, dependency resolver, or proof that a command succeeds.
- Review is an explicit author acknowledgment, not an automated semantic judgment. Deleting the review baseline cannot silently make a covered document pass.
- No deployment, cross-project discovery, migration, compatibility program, or automatic prose generation is included.
