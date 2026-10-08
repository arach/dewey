---
title: CLI Reference
description: Dense Dewey CLI contract for agents
order: 3
group: Reference
groupId: reference
---

# Dewey CLI

| Command | Inputs | Writes | Purpose |
|---|---|---|---|
| `dewey init` | `--purpose`, `--rule` (repeat), `--no-rules`, `--host` (repeat) | front door, skills, `.dewey/project.json`, drafts, first build | Set up a project |
| `dewey build` | none | `.dewey/site/`, root `llms.txt` `index` region, `AGENTS.md` `observed` region, `.dewey/outputs.json` | Build site and agent index |
| `dewey check` | `--json` | none | Consistency gate; exit 0/1 |
| `dewey review <doc>` | doc with `covers` | `.dewey/reviews.json` | Record review |
| `dewey new <kind> <name>` | kind: map, guide, reference, history | draft doc | Scaffold; refuses existing file |
| `dewey which <path>` | `--json` | none | Docs covering a path |
| `dewey uncovered` | `--json` | none | Uncovered source files by area |

## init

- Non-TTY needs `--purpose` (unless `package.json` description or README supplies it) and `--rule` or `--no-rules`.
- Refuses when `.dewey/site/` or `.dewey/outputs.json` exists without `.dewey/project.json`.
- Rerun in an initialized project: refresh `AGENTS.md` marked region + build; authored files never replaced.
- Adoption: keeps existing files; guesses missing `kind` (plans/specs/reports/proposals/decisions → history; reference/api → reference; else guide); no draft map for covered areas; restores all files on failure.

## build outputs

`.dewey/site/*.html`, `.dewey/site/**/*.md`, `.dewey/site/llms.txt`, `.dewey/site/llms-full.txt`, `.dewey/site/nav.json`. Maps and history are not published. Outputs hashed in `.dewey/outputs.json`; build stops if a target was hand-edited or not Dewey's. Build never records reviews.

## check JSON

`{ passed: boolean, issues: [{ code, path, line?, message, fix }] }`

| Area | Codes |
|---|---|
| Doc metadata | DOC_DRAFT, DOC_KIND, DOC_META, DOC_STATUS, DOC_COVERS, SUPERSEDES_MISSING |
| Coverage | MAP_MISSING, COVERAGE_OVERLAP, COVERAGE_BROAD, COVERAGE_EMPTY |
| Review | REVIEW_REQUIRED |
| Front door | FRONT_DOOR_MISSING, FRONT_DOOR_BUDGET, FRONT_DOOR_POINTER, SKILL_MISSING, REGION_STALE, REGION_INVALID |
| References | MISSING_PATH, MISSING_SCRIPT, MISSING_SYMBOL, UNKNOWN_COMMAND |
| Links/site | BROKEN_LINK, BROKEN_ANCHOR, NON_PUBLIC_LINK, SITE_LINK, NAV_MISSING |
| Outputs | STALE_OUTPUT, OUTPUT_OWNERSHIP |
| Packaging | PUBLISH_MISSING |

Front door budget: `AGENTS.md` + hosts ≤ 150 lines and ~2,000 tokens. Symbol citation: `path#symbol` (JS/TS declarations). `sh` fence commands must be a package bin, common tool, `./` script or listed in `commands`; `sh ignore` skips. Check does not run commands or fetch external links.

## Frontmatter

`kind` (guide|reference|map|history), `covers` (`*`, `**`, `?`; not leading `**`), `title`, `description`, `group`, `order`, `draft`, `status` (shipped|proposal|abandoned), `applies`, `supersedes`, `superseded_by`, `nav: false`.

## .dewey/project.json

`schemaVersion: 1`, `name`, `purpose`, `rules[]`, `hosts[]`, `commands[]`, `skin` (dewey|openscout|talkie|lattices|hudsonkit|ink), `site`:

| Field | Contract |
|---|---|
| theme | ThemePreset; implies skin ink; error with other skins |
| accent | CSS color or `{light,dark}` |
| fonts | `sans`, `heading`, `mono`, `stylesheet` |
| logo, css | project paths |
| home | `{href,label}` |
| links | `[{label,href}]` |

## Frozen

`audit`, `generate`, `agent`, `create`, `update`, `eject`: run, warn on stderr (not with `--json`), read `dewey.config.ts`. Replacements: audit/agent → check; generate/create → build; update/eject → none.
