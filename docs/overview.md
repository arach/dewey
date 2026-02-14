---
title: Overview
description: Documentation toolkit for AI-agent-ready docs
order: 1
---

# Dewey

Dewey is a documentation toolkit that makes your docs AI-agent-ready. It audits, scores, and generates optimized documentation for LLM consumption.

## What Dewey Does

Dewey is a **docs agent**, not a docs framework. It focuses on:

- **Auditing** - Validates documentation completeness and quality
- **Scoring** - Rates agent-readiness on a 0-100 scale
- **Generating** - Creates AGENTS.md, llms.txt, docs.json, install.md
- **Reviewing** - Skills that catch drift between docs and codebase

Dewey prepares your docs for AI consumption. Rendering is left to your framework of choice.

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
dewey generate  Create agent-ready files
dewey agent     Score agent-readiness (0-100)
```

## Quick Links

- [Quickstart](./quickstart.md) - Get started in 5 minutes
- [CLI Reference](./cli.md) - All commands and options
- [Skills](./skills.md) - Built-in LLM prompt templates
