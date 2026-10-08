---
title: Skills
description: The skill files dewey init writes, and the prompt templates the package exports
order: 4
---

Skills are instructions for agents, not code. They say how to do a task, what to check and what counts as done.

## Skills init writes

`dewey init` writes two skill files. It leaves either alone if it already exists.

| File | For | Contents |
|------|-----|----------|
| `SKILL.md` | Agents using the project from outside | Points to the quickstart and `llms.txt`, lists the project's rules, and says not to treat maps or history as the public interface |
| `.agents/skills/dewey-author/SKILL.md` | Agents maintaining the docs | The authoring loop: `dewey check --json`, `which`, `new`, `review`, `build`, then `check`; keeping the front door within 150 lines |

`dewey check` reports `SKILL_MISSING` if `SKILL.md` is missing. Edit `SKILL.md` to suit the project; the authoring skill works as written.

## Prompt templates

The package also exports prompt templates. They do not inspect a repository or change files; you paste them into an agent with the context they ask for.

| Skill | Purpose | Usage |
|-------|---------|-------|
| `docsReviewAgent` | Reviews doc quality page-by-page — catches stale content, missing sections, unclear explanations, broken links | `Use the docsReviewAgent skill to review docs/overview.md` |
| `promptSlideoutGenerator` | Generates AI-consumable prompt configurations for documentation pages | `Use promptSlideoutGenerator to create prompt config for the API page` |
| `docsDesignCritic` | Critiques page structure and visual design — heading hierarchy, component usage, information density | `Use docsDesignCritic to critique docs/quickstart.md` |
| `installMdGenerator` | Creates install.md files following the [installmd.org](https://installmd.org) spec | `Use installMdGenerator to create install.md from dewey.config.ts` |
| `improveAIPrompts` | Iteratively discovers prompt opportunities, drafts self-contained contracts, reviews them, and refines the result | `Use improveAIPrompts.passes.discovery.prompt`, then draft/review/refine passes |

`improveAIPrompts` is the public name. `improveAIPromptsSkill` is exported only as a deprecated compatibility alias and references the same object.

```ts
import { improveAIPrompts } from '@deweydocs/dewey'

const discovery = improveAIPrompts.passes.discovery.prompt
const review = improveAIPrompts.passes.review.prompt
  .replace('{PASTE_DRAFT}', draft)
```

The pass prompts guide an LLM; they do not inspect a repository or rewrite files by themselves. Supply the requested context, evaluate the model output against the included quality criteria, and retain human review for project-specific constraints.

---

## Creating Custom Skills

Skills live as markdown files in your project:

```
.agents/skills/
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
