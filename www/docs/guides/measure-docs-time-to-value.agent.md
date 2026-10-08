---
title: Measure time-to-value from docs
---

# Measure time-to-value from docs

| Field | Contract |
| --- | --- |
| Prerequisite | Initialized repository; Dewey 0.5 local dependency. |
| Clock | Start: integration task entry. End: first verified product result. Deduplicate per workspace. |
| Metrics | Activation within a fixed window / all eligible assigned workspaces; median and p90 time for successes; incomplete rate; setup-failure rate. Wait for full observation window. |
| Proposed events | `onboarding_started`, `docs_viewed`, `docs_handoff_clicked`, `setup_failed`, `first_test_delivery_succeeded`. These are user instrumentation, not built-in Dewey events. |
| Properties | Workspace/session identity where permitted, timestamp, persona, experiment/variant, page ID, docs revision, safe error code. No secrets, prompts, or customer payloads. |
| Build | Review covered changes; `bunx dewey build`; `bunx dewey check --json`; deploy full `.dewey/site/` at a recorded commit. |
| Analytics boundary | No collector, identity stitching, experiment assignment, or analytics config switch. Use own product/hosting tooling. Raw Markdown retrieval needs server logs; requests do not establish activation. |
| Ownership | Do not patch generated owned files in place. Use controlled deployment integration or transform a separate deployment copy. |
| Decision | Change one observed blocking instruction. Compare same audience/entry point. Track support and safety guardrails. Check consistency and product telemetry answer different questions. |
