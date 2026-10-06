# Fresh-project slice

Dewey now has a fresh-project CLI path. It does not load or execute `dewey.config.ts` as configuration, migrate existing consumers, or deploy a site.

## Try the complete proof

From the Dewey checkout:

```sh
bun run --cwd packages/docs build
bun packages/docs/scripts/fresh-project-smoke.ts
bun packages/docs/scripts/fresh-site-browser-smoke.ts
```

This creates Relaylog, a working append-only JSONL journal with eight authored overview, guide, and reference pages, authors its scaffold, runs the full CLI loop, verifies deliberate failures and recovery, and retrieves the generated site over HTTP. It leaves the project and `proof.log` in place and prints their absolute paths. The temporary HTTP server stops after verification.

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

- `AGENTS.md`, with authored rules and a marked observed-facts region. With any host files, it is capped at 150 lines and about 2,000 tokens in total.
- One pointer file per `--host <file>`, each redirecting to that front door. Use it for tools that read their own instruction file instead of `AGENTS.md`.
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

## Agent outputs

`build` writes, next to each HTML page in `.dewey/site/`, a `.md` copy whose links point at the other `.md` copies. It also writes:

- `.dewey/site/llms.txt`: one line per published page with its summary and size (lines, estimated tokens), linking to the `.md` copies, plus a pointer to the full bundle.
- `.dewey/site/llms-full.txt`: every guide and reference page in one file. Maps and history are left out.
- The marked `index` region of root `llms.txt`: the same list, linking to the source files so it works from the repo root.

A page's summary is its `description` frontmatter, else its first paragraph.

## Source contract

```yaml
---
kind: map
covers: [src/sync/**]
title: Sync implementation
---
```

Kinds: `guide`, `reference`, `map`, `history`. Maps declare coverage. Guides and references produce human pages. Maps and history do not appear in the site or default agent index. Root `README.md` is a guide by default. `nav: false` explicitly marks an intentionally unlisted human page. Relative Markdown links and heading anchors are rewritten into site links.

Optional status fields:

- `status`: `shipped` (the default), `proposal` or `abandoned`. Proposal pages open with a notice and stay out of `llms-full.txt`; `llms.txt` tags them `[proposal]`. Abandoned docs are never published.
- `applies`: what the doc covers, such as a package, version or platform. A string or a list.
- `supersedes` and `superseded_by`: doc paths from the project root. A replaced page links to its replacement and leaves both indexes. `check` fails with `SUPERSEDES_MISSING` if a target doesn't exist.

Each file belongs to one map. `check` fails with `COVERAGE_OVERLAP` when two maps cover the same file, and with `COVERAGE_BROAD` when a map pattern starts with `**`. When covered code moves, `REVIEW_REQUIRED` names the files that changed, were added or were removed since the last review.

`dewey build` refreshes the observed region of `AGENTS.md` (scripts, areas and maps). Text outside the markers is never touched. `check` reports `REGION_STALE` when the region is out of date and `REGION_INVALID` when the markers are duplicated.

Coverage accepts `*`, `**`, and `?`, with project-relative paths. `src/*` does not cover `src/sync/index.ts`. Adding that area requires a map. A guide does not need a paired agent file.

## Start a new doc

```sh
dewey new map src/sync              # docs/src-sync.agent.md, covering that area's files
dewey new guide "Deploy to staging" # docs/deploy-to-staging.md
dewey new reference "CLI flags"     # docs/reference/cli-flags.md
dewey new history "Why JSONL"       # docs/history/<date>-why-jsonl.md
```

Each starts as a draft with section prompts. `new` refuses to overwrite an existing file.

## Find docs by code

```sh
dewey which src/sync/index.ts   # docs whose covers match the file, with lines and token estimate
dewey which src/sync            # docs covering anything under a directory
dewey uncovered                 # source files no map covers, grouped by area
```

Both take `--json`. Results list maps first, then reference, guides and history.

## Checks and safety

`check` exits 1 and emits issue codes for:

- Drafts, invalid metadata, uncovered source, empty coverage patterns, or review-required source/document changes.
- Missing front door/skill/pointer, or a front door (AGENTS.md plus host files) over 150 lines or about 2,000 tokens.
- A published package (named, not `private`) whose `files` list or `.npmignore` would leave out `AGENTS.md`, `SKILL.md` or a guide/reference under `docs/`. Agents in other projects read docs from `node_modules/<pkg>/`, so they must ship with the version they describe.
- Symbol citations in JS or TS files, written `` `src/model.ts#loadModel` `` or `[loadModel](../src/model.ts#loadModel)`. The file must declare the name at top level, as an export alias, or as `Class.member`, `Interface.member` or `Enum.member`. Relative `export *` is followed. Other languages and bare names in backticks are not checked.
- Missing cited conventional paths, nonexistent package scripts, and unknown shell commands. A command in a `sh` fence must be a package bin, a common tool (bun, node, git and similar), a `./` script, or listed in `commands` in `.dewey/project.json`. Mark a fence ```` ```sh ignore ```` to skip it.
- Missing local Markdown links/anchors, unpublished map/history links from human pages, stale outputs, broken rendered links, and human pages absent from navigation.

Each issue carries the file, the line when it has one, and a `fix`. Text output prints `path:line CODE message` followed by the fix. A pass means references, coverage, reviews and outputs are consistent; it does not prove the prose is true.

It does not execute documentation commands. External links are not fetched. Source changes request review; they are not proof that prose is false.

Init refuses existing scaffold targets. Rerunning it in an initialized project updates only the observed front-door region and generated outputs. Build updates only the marked region in root `llms.txt`; surrounding authored text survives. Generated site files have hash-based ownership: modified/unowned targets block a build before writes. Obsolete unchanged owned pages are pruned. Symlink output paths are refused.

## First-slice boundaries

- Source discovery covers conventional `src/`, `lib/`, `Sources/`, package/app `src` or `Sources` trees, root code files, and existing package main/module/types/bin entry files. It excludes dependency/build/test directories and symlinks. Arbitrary source-root policy is not implemented.
- Markdown `.md` is supported; MDX, remote assets, generated API extraction, and arbitrary renderer configuration are not implemented.
- Referenced local PNG/JPEG/GIF/WebP/AVIF/ICO/PDF/TXT assets are copied. Other local downloads are reported as broken rendered links until supported.
- Script checks validate named root package scripts; shell-fence command checks inspect the first word of each line (after any `VAR=value`). They never look at this machine's PATH, so the result is the same on a laptop and in CI. This is not a shell parser, dependency resolver, or proof that a command succeeds.
- Review is an explicit author acknowledgment, not an automated semantic judgment. Deleting the review baseline cannot silently make a covered document pass.
- No deployment, cross-project discovery, migration, compatibility program, or automatic prose generation is included.

## Real docs renderer

`build` renders each page to static HTML with Dewey's `DocsApp` components: sidebar,
highlighted code, table of contents and previous/next links. Pages work with
JavaScript off, and each page holds only its own doc.

One script, `site.js` (about 10 KB), adds search, dark mode, the four color
themes, the phone menu, copy buttons and collapsible groups. Search loads
`search.js` on first use: titles, headings and up to 6,000 characters of each
listed page. Maps and history are left out of both. Nothing needs to be built
before the source CLI runs.

Sidebar groups: Start here (`README.md`, `docs/quickstart.md`), Guides, then
Reference. Set `group: <name>` to put a page in another group and `order: <n>`
to sort it; pages without `order` sort by path.

The browser proof uses Playwright Chromium and checks search navigation, code copy,
color themes, dark-mode persistence, the phone menu, pages with JavaScript off, mobile overflow, and browser/HTTP errors.
It writes light, dark, and mobile screenshots under the scratch project's
`browser-proof/`. Pass a scratch root and screenshot directory as optional arguments.
Serve `.dewey/site` with any static HTTP server to inspect it yourself.
