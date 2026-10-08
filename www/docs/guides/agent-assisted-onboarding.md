---
kind: guide
title: Make your product usable by coding agents
description: Publish retrievable instructions and test whether an agent can complete a real integration.
---

# Make your product usable by coding agents

**How can a developer try our product without leaving their coding agent?**

Give the agent current instructions it can retrieve, a bounded task, and a visible success condition. Treat this as an onboarding path to test, not a promise that an assistant will recommend your product.

The commands below assume Dewey 0.5 is installed locally and the repository has completed `dewey init`.

## Separate repository instructions from product instructions

| Surface | Reader and job |
| --- | --- |
| Root `AGENTS.md` | An agent working inside your repository: rules, commands, and source-map pointers |
| Root `SKILL.md` | An agent using the project from another repository |
| Root `llms.txt` | Retrieval index pointing to repository source documents |
| Published `llms.txt` | Retrieval index pointing to published Markdown copies, with summaries and sizes |
| Published `llms-full.txt` | Combined current guide/reference content for tasks that need the whole set |

Do not make every consumer read your implementation maps. `build` leaves maps and history out of the human site and default agent index. Keep integration steps in guides and public contracts in references.

For a published package, inspect the files that ship. `check` reports `PUBLISH_MISSING` when the package's inclusion rules omit required documentation such as `AGENTS.md`, `SKILL.md`, or guides and references under `docs/`. A hosted page and the documentation installed with a package serve different entry points.

## Publish a task an agent can finish

```sh
bunx dewey new guide "Send a test event"
```

This creates `docs/send-a-test-event.md` as a draft. Replace the section prompts with your verified prerequisites, commands, expected output, and recovery steps. Include which product version the instructions cover. Remove `draft: true` after review.

```sh
bunx dewey build
bunx dewey check --json
python3 -m http.server 4387 --bind 127.0.0.1 --directory .dewey/site
```

Inspect the actual retrieval files:

```sh
curl -fsS http://127.0.0.1:4387/llms.txt
curl -fsS http://127.0.0.1:4387/docs/send-a-test-event.md
curl -fsS http://127.0.0.1:4387/llms-full.txt
```

The `.md` copy rewrites document links to other Markdown copies. The index helps an agent select a page without loading the full bundle. Proposal pages are labeled in the index but excluded from the full bundle; abandoned pages are not published.

## Test both handoff methods

On the default generated site, the **Copy page** menu offers **Copy page for agent**, **Copy as Markdown**, **View as Markdown**, the index, and **Open in** assistant actions.

Use **Copy page for agent** when the agent needs the page content directly. It copies the Markdown with a prompt header containing the title, summary, and Markdown URL. Paste it into a fresh session and add a bounded task:

```text
Use these instructions to send one sandbox event from this project.
Ask me for missing prerequisites. Do not use production credentials.
Stop when the documented success check passes and report the evidence.
```

The **Open in** actions prefill a chat with a request to read the Markdown URL. They do not send the message or prove the assistant fetched the page. Test those actions on a publicly reachable deployment: a hosted assistant cannot be assumed to reach your local preview or authenticated documentation.

Copy and assistant actions require JavaScript. Markdown links remain useful without it. Check the clipboard result and destination URL rather than counting a click as a completed handoff.

## Evaluate the integration, not assistant traffic alone

Run the same task in several fresh sessions. Record whether the agent selected the correct page, requested missing information, used supported commands, and produced a product-side success event. Do not supply undocumented fixes silently.

Dewey supplies retrieval files and handoff controls. It does not supply assistant-ranking guarantees, cross-session attribution, or a conversion dashboard. Public Markdown requests can include crawlers and retries, so keep them separate from activated workspaces.

Next: [Make docs the path to first success](/docs/guides/docs-activation-path).
