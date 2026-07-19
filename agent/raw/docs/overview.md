---
title: Overview
description: Documentation toolkit for AI-agent-ready docs
order: 1
---

Dewey is a documentation toolkit that prepares your docs for AI agents. It audits, scores, and exports structured documentation artifacts without requiring a specific rendering framework.

## What Dewey Does

Dewey is a **docs agent**, not a docs framework. It focuses on:

- **Auditing** - Validates documentation completeness and quality
- **Scoring** - Rates agent-readiness on a 0-100 scale
- **Generating** - Creates AGENTS.md, llms.txt, docs.json, install.md, and the `agent/` retrieval surface
- **Exporting** - Publishes recursive raw markdown, manifests, prompt registries, and context bundles
- **Publishing** - Optionally scaffolds a static doc site from your markdown
- **Reviewing** - Skills that catch drift between docs and codebase

## Key Concepts

### Agent Content Pattern

Each documentation page should have two versions:

| Version | Audience | Style |
|---------|----------|-------|
| `.md` | Humans | Narrative, explanatory |
| `.agent.md` | AI agents | Dense, structured, self-contained |

### Skills System

Skills are LLM prompts, not code. Built-in skills:

- `docsReviewAgent` - Reviews docs quality page-by-page
- `docsDesignCritic` - Critiques page structure and visual design
- `promptSlideoutGenerator` - Generates AI-consumable prompt configs
- `installMdGenerator` - Creates install.md following installmd.org

### install.md Standard

Follows the [installmd.org](https://installmd.org) specification. LLM-executable:

```bash
curl https://your-project.com/install.md | claude
```

## CLI Commands

```
dewey init      Create docs/ folder and dewey.config.ts
dewey audit     Check documentation completeness
dewey generate  Create agent-ready files and retrieval artifacts
dewey agent     Score agent-readiness (0-100)
dewey create    Optional static docs site from markdown
```

## Onboarding path

Use one sequence for every project (details in [Quickstart](./quickstart.md)):

**init → author → generate → audit → agent → (optional UI)**

| Optional UI | Guide |
|-------------|--------|
| Embed in an existing React/Next.js app | [Integrate into an existing site](./integrate-existing-site.md) |
| Scaffold a standalone docs site | `dewey create` (see [CLI](./cli.md)) |

Agent artifacts from `generate` are the product contract. Components and `create` are presentation options on top of that contract.

## Quick Links

- [Quickstart](./quickstart.md) - Coherent init → generate → audit → agent sequence
- [Integrate into an existing site](./integrate-existing-site.md) - React/Next.js embed guide
- [CLI Reference](./cli.md) - All commands and options
- [API Reference](./api.md) - Public TypeScript, React, theme, and artifact contracts
- [Skills](./skills.md) - Built-in LLM prompt templates
