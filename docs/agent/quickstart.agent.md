---
title: Quickstart for agents
description: Deterministic setup sequence and expected Dewey outputs
order: 2
---

# Dewey quickstart contract

## Preconditions

| Requirement | Value |
|---|---|
| Runtime | Node.js 18+ |
| Preferred package manager | Bun 1.3+ |
| Package | `@arach/dewey` |

## Execution sequence

| Step | Command or action | Expected result |
|---|---|---|
| Install | `bun add -d @arach/dewey` (or `bun add` if importing components) | Local `dewey` binary available |
| Initialize | `bunx dewey init` | `docs/` and `dewey.config.ts` created |
| Configure | Edit `dewey.config.ts` | Project context, document paths, agent rules defined |
| Author | Add human `.md` and agent `.agent.md` pages | Paired documentation source exists |
| Generate | `bunx dewey generate` | Standard files and `agent/` retrieval surface written |
| Audit | `bunx dewey audit` / `--json` | Deterministic documentation checks reported |
| Score | `bunx dewey agent` / `--json` | Agent-readiness score and recommendations reported |
| Embed UI (optional) | Host React/Next routes | See `docs/integrate-existing-site.md` |
| Create site (optional) | `bunx dewey create …` | Standalone static site only |

Order is fixed for greenfield and embed alike: **init → author → generate → audit → agent → optional UI**.

## Generated outputs

| Path | Contract |
|---|---|
| `AGENTS.md` | Combined project context and selected docs |
| `llms.txt` | Compact LLM-facing index and summaries |
| `docs.json` | Structured documentation manifest |
| `install.md` | installmd.org-compatible execution guide |
| `agent/manifest.json` | Retrieval discovery manifest |
| `agent/docs.json` | Full structured documentation payload |
| `agent/prompts.json` | Prompt registry |
| `agent/context.md` | Compact retrieval context |
| `agent/raw/docs/**` | Recursive raw Markdown mirror |

## Selection rules

| Configuration | Behavior |
|---|---|
| `agent.sections: []` | Include all human `.md` documents recursively |
| Non-empty `agent.sections` | Include exact document IDs only |
| `generate --source <path>` | Override `docs.path` for one run |
| `generate --output <path>` | Override `docs.output`; create directory recursively |

## Optional publishing

| Mode | Entry |
|---|---|
| Embed in existing React/Next | `docs/integrate-existing-site.md` + `docs/agent/integrate-existing-site.agent.md` |
| Standalone site | `bunx dewey create my-docs --source ./docs --theme ocean` |

Publishing is optional; generated agent artifacts remain the core contract.
