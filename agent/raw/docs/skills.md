---
title: Skills
description: Expert instructions that guide AI agents through specific documentation tasks
order: 4
---

Skills are LLM prompts, not code. They're expert instructions that tell AI agents exactly how to perform a task — what to check, what to produce, and what success looks like.

## Built-in Skills

| Skill | Purpose | Usage |
|-------|---------|-------|
| `docsReviewAgent` | Reviews doc quality page-by-page — catches stale content, missing sections, unclear explanations, broken links | `Use the docsReviewAgent skill to review docs/overview.md` |
| `promptSlideoutGenerator` | Generates AI-consumable prompt configurations for documentation pages | `Use promptSlideoutGenerator to create prompt config for the API page` |
| `docsDesignCritic` | Critiques page structure and visual design — heading hierarchy, component usage, information density | `Use docsDesignCritic to critique docs/quickstart.md` |
| `installMdGenerator` | Creates install.md files following the [installmd.org](https://installmd.org) spec | `Use installMdGenerator to create install.md from dewey.config.ts` |
| `improveAIPrompts` | Iteratively discovers prompt opportunities, drafts self-contained contracts, reviews them, and refines the result | `Use improveAIPrompts.passes.discovery.prompt`, then draft/review/refine passes |

`improveAIPrompts` is the public name. `improveAIPromptsSkill` is exported only as a deprecated compatibility alias and references the same object.

```ts
import { improveAIPrompts } from '@arach/dewey'

const discovery = improveAIPrompts.passes.discovery.prompt
const review = improveAIPrompts.passes.review.prompt
  .replace('{PASTE_DRAFT}', draft)
```

The pass prompts guide an LLM; they do not inspect a repository or rewrite files by themselves. Supply the requested context, evaluate the model output against the included quality criteria, and retain human review for project-specific constraints.

---

## Creating Custom Skills

Skills live as markdown files in your project:

```
.claude/skills/
  my-skill.md
```

Each skill follows a consistent structure:

<div class="doc-file-block">
<div class="doc-file-bar">my-skill.md</div>

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

</div>

## Best Practices

| Do | Don't |
|----|-------|
| Be specific and actionable | Use vague instructions |
| Include examples | Assume context |
| Define success criteria | Leave outcomes ambiguous |
| Reference file paths | Use relative descriptions |
