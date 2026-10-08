---
title: Make your product usable by coding agents
---

# Make your product usable by coding agents

| Field | Contract |
| --- | --- |
| Prerequisite | Dewey 0.5 installed locally; repository initialized. |
| Repo surfaces | `AGENTS.md`: in-repo rules and source pointers. `SKILL.md`: external consumers. Root `llms.txt`: source-document index. |
| Published surfaces | Site `llms.txt`: Markdown links, summaries, sizes. `llms-full.txt`: current guide/reference content; excludes maps, history, proposals, replaced pages. |
| Create | `bunx dewey new guide "Send a test event"` creates `docs/send-a-test-event.md`. Author and test; remove draft flag. |
| Build | `bunx dewey build`; `bunx dewey check --json`; serve `.dewey/site/`. |
| Retrieve | Inspect `/llms.txt`, `/docs/send-a-test-event.md`, `/llms-full.txt` on deployment. |
| Handoff | Default Copy page menu can copy Markdown or wrap it with title, summary, URL. Open in actions prefill a request to read a URL; reader must send it. Copy/chat actions require JavaScript. |
| Test | Use a public deployment for hosted-assistant URL retrieval. Fresh session; sandbox only; require documented product success evidence. |
| Boundary | No ranking guarantee, attribution system, or conversion dashboard. Retrieval is not activation. `PUBLISH_MISSING` flags required docs excluded from a published package. |
