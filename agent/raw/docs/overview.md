---
title: Overview
description: What Dewey does and how its docs loop works
order: 1
---

Dewey keeps a project's docs usable by people and by coding agents, and checks that they still match the code. From one folder of Markdown it writes a front door for agents (`AGENTS.md`), an agent index (`llms.txt`) and a static docs site.

## The loop

```
dewey init     # once: front door, draft maps and guide, skills, first site build
dewey build    # site in .dewey/site, llms.txt, .md copies, llms-full.txt
dewey check    # maps, reviews, references, front door, site links, freshness
```

`init` sets the project up. After that, you edit Markdown, run `build`, and run `check`. When covered code changes, `check` asks for a review; you reread the doc, fix it, and run `dewey review <doc>`.

## What init creates

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Front door: purpose, hard rules, and a marked region Dewey keeps up to date (scripts, source areas, maps) |
| `docs/quickstart.md` | Draft task guide |
| `docs/<area>.agent.md` | Draft map for each source area, such as `docs/src.agent.md` |
| `SKILL.md` | For agents using the project from outside |
| `.agents/skills/dewey-author/SKILL.md` | For agents maintaining the docs |
| `.dewey/project.json` | Project name, purpose, rules and site settings |
| `.dewey/site/`, `llms.txt` | The first build |

Drafts carry `draft: true`. The site builds from them right away, but `check` fails until you finish them and remove that line.

## Kinds of doc

Every doc declares a `kind` in its frontmatter.

| Kind | Audience | On the site | Notes |
|------|----------|-------------|-------|
| `guide` | People and agents | Yes | Task-shaped: how to do something |
| `reference` | People and agents | Yes | API, CLI and config contracts |
| `map` | Agents | No | Declares `covers`, the source files it describes |
| `history` | Record | No | Plans, decisions, reports |

A map covers part of the source tree:

```yaml
---
kind: map
covers: [src/sync/**]
title: Sync implementation
---
```

Each source file belongs to exactly one map. `dewey uncovered` lists files no map covers, and `dewey which <path>` finds the docs that cover a file.

## What check verifies

`dewey check` exits 1 and lists issues when:

- a doc is still a draft or has invalid frontmatter
- a source file has no map, or two maps cover the same file
- covered code changed since the doc was last reviewed
- `AGENTS.md`, `SKILL.md` or a host pointer file is missing, or the front door is over 150 lines or about 2,000 tokens
- a cited path, package script, shell command or `path#symbol` does not exist
- a local link or anchor is broken, or a human page is missing from navigation
- `llms.txt` or the site is out of date

Each issue has a code, a file, a line when there is one, and a fix. A pass means references, coverage, reviews and outputs agree. It does not prove the prose is true.

## Agent outputs

`build` writes, next to each HTML page, a `.md` copy. It also writes `.dewey/site/llms.txt` (one line per page, with its size), `.dewey/site/llms-full.txt` (every guide and reference in one file), `.dewey/site/nav.json`, and the marked index region of the root `llms.txt`.

## The docs site

The site works with JavaScript off. One small script adds search, dark mode, the phone menu and the Copy page menu. By default it looks like deweydocs.com. A `skin` or a `site` block in `.dewey/project.json` changes the theme, accent, fonts, logo, CSS and header links. See [CLI Reference](./cli.md#site-settings).

## Frozen commands

The 0.4 commands `audit`, `generate`, `agent`, `create`, `update` and `eject` still run, print a warning, and will be removed. See [Frozen commands](./cli.md#frozen-commands).

## Package extras

The `@deweydocs/dewey` package also exports React components for rendering docs inside an existing app ([Integrate into an existing site](./integrate-existing-site.md)), theme CSS, and prompt templates ([Skills](./skills.md)).

## Quick links

- [Quickstart](./quickstart.md) - init, author, review, build, check
- [CLI Reference](./cli.md) - Every command and its options
- [API Reference](./api.md) - TypeScript, React, theme and artifact exports
- [Integrate into an existing site](./integrate-existing-site.md) - React/Next.js embed guide
- [Skills](./skills.md) - Prompt templates and the skills init writes
- [Maintaining generated sites](./maintenance.md) - Frozen site commands and release checks
