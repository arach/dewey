---
title: Quickstart
description: Set up Dewey in a project, author the drafts, and get a passing check
order: 2
---

Requires Node.js 18+ or Bun 1.3+.

| Step | Command | Result |
|------|---------|--------|
| 1. Install | `bun add -d @deweydocs/dewey` | Local `dewey` binary |
| 2. Init | `bunx dewey init --purpose "…" --rule "…"` | Front door, drafts, skills, first site build |
| 3. Author | Edit the drafts in `docs/` | Real guide and maps |
| 4. Review | `bunx dewey review docs/src.agent.md` | Review recorded for each map |
| 5. Build | `bunx dewey build` | `.dewey/site/` and `llms.txt` |
| 6. Check | `bunx dewey check` | Pass, or a list of issues with fixes |

### 1. Install

```bash
bun add -d @deweydocs/dewey
```

`npm install -D @deweydocs/dewey` and `npx dewey` work the same. For a one-off run without installing, use `bunx @deweydocs/dewey <command>`.

### 2. Initialize

Run from the project root:

```bash
bunx dewey init \
  --purpose "Count lines in log files" \
  --rule "Never write to input files"
```

- `--purpose` defaults to the `description` in `package.json`, then to the README's first paragraph.
- Repeat `--rule` for each hard rule, or pass `--no-rules` to declare none.
- In a terminal, init asks for anything missing. In CI or a script, it fails and asks for the flags.
- Pass `--host <file>` (repeatable) to write a pointer file, such as a tool-specific instruction file, that redirects to `AGENTS.md`.

For a project with `src/index.ts` and `src/sync/index.ts`, init writes:

```
AGENTS.md
SKILL.md
llms.txt
.agents/skills/dewey-author/SKILL.md
.dewey/project.json
.dewey/site/
docs/quickstart.md        # draft guide
docs/src.agent.md         # draft map, covers src/*
docs/src-sync.agent.md    # draft map, covers src/sync/*
```

In a repo that already has docs, init keeps your files. It appends a marked region to an existing `AGENTS.md` and `llms.txt`, leaves existing guides, maps, `SKILL.md` and host files alone, and adds a `kind` to docs that lack one, guessed from the path. If anything fails, it restores every file it touched.

### 3. Author the drafts

Open each draft and replace the comments with what the code does. A map lists its files, data flow, and invariants and traps. The guide states a task, its prerequisites and how to tell it worked. Remove `draft: true` from each file when it is done.

To add docs later:

```bash
bunx dewey new guide "Deploy to staging"   # docs/deploy-to-staging.md
bunx dewey new reference "CLI flags"       # docs/reference/cli-flags.md
bunx dewey new history "Why JSONL"         # docs/history/<date>-why-jsonl.md
bunx dewey new map src/net                 # docs/src-net.agent.md
```

### 4. Review the maps

After you have checked a map against the code, record it:

```bash
bunx dewey review docs/src.agent.md
bunx dewey review docs/src-sync.agent.md
```

This stores hashes of the doc and the files it covers in `.dewey/reviews.json`. When covered code changes, `check` reports `REVIEW_REQUIRED` and names the files that changed. `build` never records a review for you.

### 5. Build

```bash
bunx dewey build
```

Writes the static site to `.dewey/site/`, a `.md` copy of each page, `llms-full.txt`, `nav.json`, and refreshes the marked regions of `AGENTS.md` and `llms.txt`. To look at it:

```bash
python3 -m http.server 4387 --bind 127.0.0.1 --directory .dewey/site
```

### 6. Check

```bash
bunx dewey check
bunx dewey check --json   # for CI
```

On a fresh init, check fails with `DOC_DRAFT` and `REVIEW_REQUIRED`. Once the drafts are done and reviewed and the site is built, it prints:

```
Dewey check passed: references, coverage, reviews and outputs are consistent. It does not prove the prose is true.
```

Check exits 1 on any issue. Each issue prints `path:line CODE message` followed by a fix.

---

## Next steps

- Commit `.dewey/project.json` and `.dewey/reviews.json` so CI checks against the same reviewed baseline.
- Run `dewey build` and `dewey check` in CI.
- Use `dewey which <path>` before changing code to find the docs that cover it, and `dewey uncovered` to find files no map covers.
- Change the site's look with a `skin` or `site` block in `.dewey/project.json` ([site settings](./cli.md#site-settings)).
- [CLI Reference](./cli.md) · [Skills](./skills.md) · [Integrate into an existing site](./integrate-existing-site.md)
