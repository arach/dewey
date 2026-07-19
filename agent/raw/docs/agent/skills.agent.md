---
title: Skills for agents
description: Dewey skill inventory and authoring contract
order: 4
---

# Dewey skills contract

Skills are LLM instructions, not deterministic executable code.

## Built-in inventory

| Skill | Purpose | Success condition |
|---|---|---|
| `docsReviewAgent` | Review one page for correctness, completeness, clarity, links, and source drift | Findings reference evidence and actionable changes |
| `docsDesignCritic` | Review hierarchy, information density, component use, and visual structure | Critique separates structural and presentation issues |
| `promptSlideoutGenerator` | Produce AI-consumable prompt configuration for a page | Output has explicit inputs, instructions, and expected result |
| `installMdGenerator` | Produce installmd.org-compatible `install.md` | Instructions are executable, environment-aware, and verifiable |
| `improveAIPrompts` | Discover → draft → review → refine prompt contracts | Result is self-contained and satisfies exported quality criteria |

## Public prompt-improvement contract

| Export | Status |
|---|---|
| `improveAIPrompts` | Canonical public runtime object |
| `improveAIPromptsSkill` | Deprecated alias; same object |
| `PromptImprovementPass` | Public type |
| `PromptQualityCriteria` | Public type |

Usage: select a prompt from `improveAIPrompts.passes`, replace its placeholders, send it to an LLM, and review the result. The export is prompt content, not repository automation or a deterministic generator.

## Custom skill location

`.claude/skills/<skill-name>.md`

## Required skill sections

| Section | Content |
|---|---|
| Name and description | One bounded capability |
| When to Use | Concrete trigger conditions |
| Instructions | Ordered, actionable workflow |
| Success criteria | Verifiable completion conditions |
| Example | Representative input and expected output |

## Authoring rules

- Use explicit file paths and commands.
- State required context and constraints.
- Separate deterministic checks from model judgment.
- Include failure and escalation behavior.
- Avoid vague goals, hidden assumptions, and presentation-only prose.
- Treat examples as contracts, not decoration.
