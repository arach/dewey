---
kind: guide
title: Measure time-to-value from docs
description: Connect documentation entry points to product success without treating clicks as activation.
---

# Measure time-to-value from docs

**How do I know whether a documentation change gets developers to value faster?**

Measure a product outcome from a defined start event. Use documentation events to explain delays, not to replace the outcome.

Dewey 0.5 publishes pages, Markdown, indexes, and handoff controls. It does not include an analytics collector, experiment assignment, or identity stitching. The event names below are a proposed instrumentation plan for your own analytics system, not Dewey events.

## Choose the clock and denominator

For example, start the clock when a new workspace enters the integration task. Stop it when your service confirms its first successful test delivery. Use the same definitions for both variants of an experiment.

Report these measures together:

| Measure | Definition |
| --- | --- |
| Activation rate | Eligible workspaces with first success within 24 hours / all eligible workspaces assigned |
| Time-to-value | Time from task start to first success; report median and p90 for successful workspaces |
| Incomplete rate | Eligible workspaces without success by the observation cutoff |
| Failure rate | Workspaces encountering a setup error / workspaces starting setup |

The 24-hour window is an example policy, not a Dewey default. Pick a window that fits the task and wait for it to finish before comparing cohorts. Reporting only successful users can make a worse flow look faster by excluding people who quit.

## Add a small event contract

Instrument the product and your documentation hosting layer with your own tooling:

| Proposed event | Emit when | Useful fields |
| --- | --- | --- |
| `onboarding_started` | Workspace enters the integration task | Workspace ID, timestamp, persona, experiment, variant |
| `docs_viewed` | Reader opens the task page | Page ID, docs revision, variant, permitted session ID |
| `docs_handoff_clicked` | Reader requests copy or opens an assistant link | Page ID, handoff method, docs revision |
| `setup_failed` | Product rejects a setup step | Workspace ID, step ID, safe error code |
| `first_test_delivery_succeeded` | Service verifies the first test delivery | Workspace ID, timestamp, product version |

Deduplicate first success per workspace. Use a stable, consented identifier when connecting browser activity to product activity. Do not store credentials, copied page contents, prompts, or raw customer payloads in event properties.

Raw Markdown requests belong in hosting logs, not browser-only analytics. A fetch is evidence of retrieval, not evidence that an agent understood or used the page. Keep anonymous fetch counts separate when you cannot connect them reliably to a workspace.

## Keep the docs revision reproducible

After reviewing the changed instructions, build and check the same repository revision that you will deploy:

```sh
bunx dewey build
bunx dewey check --json
```

These commands assume an initialized repository with Dewey 0.5 installed locally. Review affected covered documents before this step; `build` does not acknowledge source changes.

Record the repository commit with your deployment and analytics metadata. Serve the whole `.dewey/site/` output so HTML, Markdown copies, `llms.txt`, and `llms-full.txt` come from the same build. Dewey does not attach experiment IDs or analytics properties for you.

If you need custom tracking on generated pages, add it through a controlled hosting or deployment integration. There is no analytics switch in `.dewey/project.json`. Do not manually patch Dewey-owned files in place: subsequent builds reject modified owned targets. Preserve the original build directory and transform a deployment copy if your hosting integration requires it.

## Use the measurements to select one change

Suppose your event data shows that new workspaces request a credential but never attempt a test delivery. Read the page at that step and observe a clean onboarding run. The missing instruction might be where to store the credential or which permission it needs.

Change that instruction before rewriting the entire guide. Compare activation and time-to-value for the same persona and entry point. Keep support contacts, unsafe credential use, and failed setup attempts as guardrails.

A successful `dewey check` tells you the docs and their tracked evidence agree. Your product telemetry tells you whether users reached value. Neither substitutes for the other.

Next: [Run docs-led onboarding experiments](/docs/guides/docs-onboarding-experiments).
