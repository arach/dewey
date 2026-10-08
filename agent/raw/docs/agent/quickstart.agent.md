---
title: Quickstart for agents
description: Deterministic setup sequence and expected Dewey outputs
order: 2
---

# Dewey quickstart contract

Requires Node.js 18+ or Bun 1.3+. Run from the project root.

| Step | Command | Expected |
|---|---|---|
| Install | `bun add -d @arach/dewey` | local `dewey` bin; one-off: `bunx @arach/dewey <cmd>` |
| Init | `bunx dewey init --purpose "…" --rule "…"` (or `--no-rules`) | files below; first build |
| Author | edit drafts in `docs/`, remove `draft: true` | no `DOC_DRAFT` |
| Review | `bunx dewey review docs/<area>.agent.md` | `.dewey/reviews.json` |
| Build | `bunx dewey build` | `.dewey/site/`, root `llms.txt` region, `AGENTS.md` region |
| Check | `bunx dewey check` / `--json` | exit 0 and `Dewey check passed: …` |

## Init inputs

- `--purpose` default: `package.json` description, then README first paragraph.
- No TTY and missing rules → fails: `Supply --purpose and either --rule or --no-rules in non-interactive use.`
- `--host <file.md>` repeatable: pointer file redirecting to `AGENTS.md`.

## Init writes

`AGENTS.md`, `SKILL.md`, `llms.txt`, `.agents/skills/dewey-author/SKILL.md`, `.dewey/project.json`, `.dewey/outputs.json`, `.dewey/site/`, `docs/quickstart.md` (draft guide), one draft map per uncovered source area (`docs/src.agent.md` covers `src/*`; `docs/src-sync.agent.md` covers `src/sync/*`).

Existing repos: marked region appended to existing `AGENTS.md`/`llms.txt`; existing guides, maps, `SKILL.md`, host files kept; missing `kind` guessed from path; all-or-nothing restore on failure.

## Fresh check

Fails with `DOC_DRAFT` and `REVIEW_REQUIRED` until drafts are finished and maps reviewed.

## Later

`dewey new guide|reference|history|map <name>`, `dewey which <path>`, `dewey uncovered`. Commit `.dewey/project.json` and `.dewey/reviews.json`; run `build` + `check` in CI.
