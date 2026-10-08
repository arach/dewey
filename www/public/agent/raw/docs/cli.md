---
title: CLI Reference
description: Dewey commands, their options, and the settings in .dewey/project.json
order: 3
group: Reference
groupId: reference
---

## Run Dewey

Install Dewey in a project and use its local binary:

```bash
bun add -d @arach/dewey
bunx dewey --help
```

For a one-off run without installing it first, address the scoped package:

```bash
bunx @arach/dewey@latest --help
```

`npx` works the same under Node. Every command runs from the project root.

## Commands

| Command | Purpose |
|---|---|
| `dewey init` | Set up a project: front door, draft maps and guide, skills, first site build |
| `dewey build` | Build the site in `.dewey/site` and `llms.txt` from the same Markdown |
| `dewey check` | Check maps, reviews, references, front door, site links, navigation and freshness |
| `dewey review <doc>` | Record that a covered doc was reviewed against the current code |
| `dewey new <kind> <name>` | Create a draft map, guide, reference or history doc |
| `dewey which <path>` | List the docs that cover a file or directory |
| `dewey uncovered` | List source files no map covers, by area |

The commands `audit`, `generate`, `agent`, `create`, `update` and `eject` are frozen. See [Frozen commands](#frozen-commands).

## init

```bash
dewey init --purpose "Count lines in log files" --rule "Never write to input files"
dewey init --no-rules --host AGENT.md
```

| Option | Meaning |
|---|---|
| `--purpose <text>` | Project purpose. Defaults to the `package.json` description, then the README's first paragraph |
| `--rule <text>` | A hard rule for agents. Repeat for more than one |
| `--no-rules` | Declare that there are no project-specific hard rules |
| `--host <file>` | Write a pointer file that redirects to `AGENTS.md`. Repeatable. Must be a `.md` file name |

In a terminal, init asks for a missing purpose or rules. Without a terminal, it fails with: `Supply --purpose and either --rule or --no-rules in non-interactive use.`

Init writes `AGENTS.md`, `SKILL.md`, `.agents/skills/dewey-author/SKILL.md`, `.dewey/project.json`, a draft `docs/quickstart.md`, a draft map per source area, then runs the first build.

In a repo with existing docs, init keeps your files:

- `AGENTS.md` and `llms.txt` get a marked region appended. Text outside the markers is never changed.
- Existing guides, maps, `SKILL.md` and host files are left alone.
- A doc in `docs/` without a `kind` gets one guessed from its path: `history` under plans, specs, reports, proposals or decisions; `reference` under reference or api; otherwise `guide`. Init prints how many it changed.
- Areas an existing map covers get no draft map.
- If anything fails, including the first build, init restores every file it touched.

In a project without `.dewey/project.json`, init refuses to run if `.dewey/site/` or `.dewey/outputs.json` already exists. Rerunning it in an initialized project only refreshes the marked region of `AGENTS.md` and runs a build; it never replaces authored files.

## build

```bash
dewey build
```

Writes:

| Output | Contents |
|---|---|
| `.dewey/site/*.html` | One page per guide and reference, plus an index page |
| `.dewey/site/**/*.md` | A Markdown copy next to each page, with links to the other copies |
| `.dewey/site/llms.txt` | One line per page: summary and size (lines, estimated tokens) |
| `.dewey/site/llms-full.txt` | Every guide and reference in one file |
| `.dewey/site/nav.json` | The sidebar as data: title, summary, HTML and `.md` paths, source file |
| `llms.txt` (root) | The marked `index` region: the same page list, linking to source files |
| `AGENTS.md` | The marked `observed` region: scripts, source areas and maps |

Maps and history docs are not published to the site or `llms-full.txt`. Generated files are tracked by hash in `.dewey/outputs.json`; a build stops before writing if a target was edited by hand or is not Dewey's. Build never records a review.

## check

```bash
dewey check
dewey check --json
```

Exits 0 when everything is consistent and 1 otherwise. Text output prints `path:line CODE message` and a `fix:` line per issue. `--json` prints `{ "passed": boolean, "issues": [{ code, path, line?, message, fix }] }`.

| Area | Codes |
|---|---|
| Doc metadata | `DOC_DRAFT`, `DOC_KIND`, `DOC_META`, `DOC_STATUS`, `DOC_COVERS`, `SUPERSEDES_MISSING` |
| Coverage | `MAP_MISSING`, `COVERAGE_OVERLAP`, `COVERAGE_BROAD`, `COVERAGE_EMPTY` |
| Review | `REVIEW_REQUIRED` |
| Front door | `FRONT_DOOR_MISSING`, `FRONT_DOOR_BUDGET`, `FRONT_DOOR_POINTER`, `SKILL_MISSING`, `REGION_STALE`, `REGION_INVALID` |
| References | `MISSING_PATH`, `MISSING_SCRIPT`, `MISSING_SYMBOL`, `UNKNOWN_COMMAND` |
| Links and site | `BROKEN_LINK`, `BROKEN_ANCHOR`, `NON_PUBLIC_LINK`, `SITE_LINK`, `NAV_MISSING` |
| Outputs | `STALE_OUTPUT`, `OUTPUT_OWNERSHIP` |
| Packaging | `PUBLISH_MISSING` |

Details:

- The front door is `AGENTS.md` plus any host files. Together they must stay at 150 lines and about 2,000 tokens or fewer.
- A symbol citation is written `` `src/model.ts#loadModel` `` or `[loadModel](../src/model.ts#loadModel)`. Check confirms the JS or TS file declares that name.
- A command in a `sh` fence must be a package bin, a common tool (bun, node, git and similar), a `./` script, or listed in `commands` in `.dewey/project.json`. Mark a fence ```` ```sh ignore ```` to skip it.
- A published package (named, not `private`) must ship `AGENTS.md`, `SKILL.md` and its guides and references in its `files` list.

Check does not run doc commands or fetch external links. A pass does not prove the prose is true.

## review

```bash
dewey review docs/src.agent.md
```

Records hashes of the doc and the files it covers in `.dewey/reviews.json`. Run it after you have reread the code and corrected the doc. The doc must declare `covers`; for other docs, review fails with `Choose a document with covers frontmatter`.

## new

```bash
dewey new map src/sync              # docs/src-sync.agent.md
dewey new guide "Deploy to staging" # docs/deploy-to-staging.md
dewey new reference "CLI flags"     # docs/reference/cli-flags.md
dewey new history "Why JSONL"       # docs/history/<date>-why-jsonl.md
```

Each file starts as a draft with section prompts. `new` refuses to overwrite an existing file.

## which and uncovered

```bash
dewey which src/sync/index.ts   # docs whose covers match the file
dewey which src/sync            # docs covering anything under a directory
dewey uncovered                 # source files no map covers, grouped by area
```

Both take `--json`. `which` lists each doc's path, kind, title, matching pattern, line count and estimated tokens, maps first.

## Frontmatter

```yaml
---
kind: map            # guide | reference | map | history
covers: [src/sync/**]
title: Sync implementation
description: One line shown under the title and used as the summary
group: Guides        # sidebar group
order: 2             # sort within the group
---
```

| Field | Values |
|---|---|
| `kind` | `guide`, `reference`, `map`, `history`. Root `README.md` is a guide by default |
| `covers` | Project-relative patterns with `*`, `**`, `?`. `src/*` does not cover `src/sync/index.ts`. A pattern may not start with `**` |
| `draft` | `true` until the doc is finished; check fails while it is set |
| `status` | `shipped` (default), `proposal`, `abandoned`. Proposals show a notice; abandoned docs are not published |
| `applies` | What the doc covers, such as a package, version or platform. String or list |
| `supersedes`, `superseded_by` | Doc paths from the project root |
| `nav` | `false` for a human page that is deliberately left out of the sidebar |

Sidebar groups are Start here (`README.md`, `docs/quickstart.md`), Guides, then Reference.

## .dewey/project.json

```json
{
  "schemaVersion": 1,
  "name": "tally",
  "purpose": "Count lines in log files",
  "rules": ["Never write to input files"],
  "hosts": ["AGENT.md"],
  "commands": ["frobnicate"],
  "skin": "dewey"
}
```

| Field | Meaning |
|---|---|
| `name`, `purpose`, `rules` | Shown in `AGENTS.md`, `SKILL.md` and `llms.txt` |
| `hosts` | Pointer files that redirect to `AGENTS.md` |
| `commands` | Extra shell commands that docs may use in `sh` fences |
| `skin` | `dewey` (default, looks like deweydocs.com), `openscout`, `talkie`, `lattices`, `hudsonkit`, or `ink` (a plain look with a theme menu) |
| `site` | See [Site settings](#site-settings) |

### Site settings

Every field is optional:

```json
"site": {
  "theme": "slate",
  "accent": { "light": "#0f766e", "dark": "#5eead4" },
  "fonts": { "sans": "Inter, system-ui, sans-serif", "mono": "ui-monospace, monospace", "stylesheet": "https://…" },
  "logo": "brand/logo.svg",
  "css": "brand/docs.css",
  "home": { "href": "https://example.com", "label": "Example" },
  "links": [{ "label": "GitHub", "href": "https://github.com/example/example" }]
}
```

| Field | Meaning |
|---|---|
| `theme` | One color theme for the ink look; removes the visitor's theme menu. Implies `"skin": "ink"`. Refused with any other skin |
| `accent` | One CSS color, or `{ light, dark }`. Applies over any skin |
| `fonts` | `sans`, `heading`, `mono` font stacks and a `stylesheet` URL for web fonts |
| `logo` | Project path to an image that replaces the header's brand mark |
| `css` | Project path to a stylesheet loaded after Dewey's |
| `home` | A header link back to the product site |
| `links` | Header links, such as GitHub |

`theme` accepts `neutral`, `ocean`, `emerald`, `purple`, `dusk`, `rose`, `github`, `warm`, `midnight`, `editorial`, `mono`, `hudson`, `ink` or `slate`. An invalid value stops the build with a message naming the field.

## Frozen commands

These 0.4 commands still run, print `dewey <command> is frozen and will be removed. Use dewey init, build and check instead.` to stderr (except with `--json`), and get no new work. They read `dewey.config.ts`, not `.dewey/project.json`.

| Command | What it did | Use instead |
|---|---|---|
| `dewey audit` | Completeness checks | `dewey check` |
| `dewey generate` | `AGENTS.md`, `llms.txt`, `docs.json`, `install.md`, `agent/` | `dewey build` |
| `dewey agent` | 0–100 readiness score | `dewey check` |
| `dewey create <dir>` | Next.js or Astro site scaffold | `dewey build` (static site in `.dewey/site`) |
| `dewey update [dir]` | Refresh a scaffolded site | — |
| `dewey eject <component> [dir]` | Take ownership of a scaffolded component | — |

Existing `create` sites are covered in [Maintaining generated sites](./maintenance.md).

## Error handling in automation

Every command exits non-zero on failure. In CI:

```bash
bunx dewey build
bunx dewey check --json > dewey-check.json
```

The second command exits 1 when check finds issues, which fails the job; the JSON report is still written.
