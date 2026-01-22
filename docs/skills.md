---
title: Skills
description: Built-in LLM prompt templates
order: 4
---

# Skills

Skills are LLM prompts that guide AI agents through specific tasks. They're not code - they're expert instructions.

## Built-in Skills

### docsReviewAgent

Reviews documentation quality page-by-page. Catches:
- Stale content that doesn't match code
- Missing sections
- Unclear explanations
- Broken links

**Usage:**
```
Use the docsReviewAgent skill to review docs/overview.md
```

### promptSlideoutGenerator

Generates AI-consumable prompt configurations for documentation pages.

**Usage:**
```
Use promptSlideoutGenerator to create prompt config for the API page
```

### installMdGenerator

Creates install.md files following the [installmd.org](https://installmd.org) specification.

**Usage:**
```
Use installMdGenerator to create install.md from dewey.config.ts
```

## Creating Custom Skills

Skills live in `.claude/skills/` as markdown files:

```
.claude/skills/
  my-skill.md
```

### Skill Structure

```markdown
# Skill Name

Brief description of what this skill does.

## When to Use

- Situation 1
- Situation 2

## Instructions

Step-by-step guide for the AI agent:

1. First, check X
2. Then, do Y
3. Finally, verify Z

## Example

Show an example input and expected output.
```

## Skill Best Practices

| Do | Don't |
|----|-------|
| Be specific and actionable | Use vague instructions |
| Include examples | Assume context |
| Define success criteria | Leave outcomes ambiguous |
| Reference file paths | Use relative descriptions |
